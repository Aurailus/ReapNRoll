import { vec2 } from 'gl-matrix';

import Room from '../Room';

export type Equivalency = '=' | '>=' | '>' | '<' | '<=' | '!=';

export const EquivalencyInverse: Record<Equivalency, Equivalency> = {
	'=': '!=',
	'>=': '<',
	'>': '<=',
	'<=': '>',
	'<': '>=',
	'!=': '='
};

export interface CardContext {
	room: Room;
	target: vec2;
}

export interface CardReturn {
	damage: number;
}

export type Condition = `${Equivalency} ${number}`;
export type Intensity = `${number}x` | `${number}x+${number}`;

export interface CastData {
	rolls: {
		roll: number;
		raw: number;
		condition: boolean;
	}[]
}

export interface CardType {
	name: string;
	value: number;
	image: string;
	type: string;
	modifiers: CardModifier[];
	description: string;
	rolls: (Intensity | Condition)[];

	valid?: (ctx: CardContext) => boolean;
	cast: (data: CastData, ctx: CardContext) => CardReturn;
}

export const CardModifiers = [
	'refined',
	'crude',
	'inverted',
	'binding',
	'wild',
	'ravenous',
	'vampiric',
	'preserved'
] as const;

export type CardModifier = typeof CardModifiers[number];

export const CardModifierNames: Record<CardModifier | '', string> = {
	'': '',
	refined: 'Edified',
	crude: 'Crude',
	inverted: 'Inverted',
	preserved: 'Preserved',
	ravenous: 'Ravenous',
	binding: 'Shackled',
	vampiric: 'Vampiric',
	wild: 'Wild'
};

export const CardModifierValues: Record<CardModifier | '', number> = {
	'': 0,
	refined: 1.2,
	crude: 0.8,
	inverted: 1.1,
	binding: -0.7,
	ravenous: 1.05,
	preserved: 2,
	vampiric: 1.6,
	wild: 1
};

export const CardModifierDescriptions: { [key in CardModifier | '']?: string } = {
	refined: 'Contains extra potency.',
	binding: 'A malicious force binds itself to the caster, temporarily immobilizing them.',
	preserved: 'Emanates a sense of stability. Will survive an extra cast.',
	ravenous: 'Consumes a portion of the caster\'s vitality, but casts with extra potency.',
	vampiric: 'Captures a portion of damage dealt, and returns it to the caster.',
	wild: 'Contains a wild, unpredictable energy. An unknownable force dictates its potency.'
};

export const CardTypes = new Map<string, CardType>();

import Beam from './Beam';
import Heal from './Heal';
import Blink from './Blink';
import Revive from './Revive';
import Fireball from './Fireball';
import MagicMissile from './MagicMissile';

CardTypes.set(Beam.type, Beam);
CardTypes.set(Heal.type, Heal);
CardTypes.set(Blink.type, Blink);
CardTypes.set(Revive.type, Revive);
CardTypes.set(Fireball.type, Fireball);
CardTypes.set(MagicMissile.type, MagicMissile);

export interface Card {
	type: CardType;
	modifier: CardModifier | null;
}

export function modifyCard(card: Card): Card {
	const newCard: Card = {
		modifier: null,
		type: {
			...card.type,
			name: `${CardModifierNames[card.modifier ?? '']} ${card.type.name}`.trim(),
			description: card.type.description,
			rolls: card.type.rolls.map((condition) => {
				if (condition.includes('x')) {
					let intensity = 0, offset = 0;
					if (condition.includes('+')) {
						[ intensity, offset ] = condition.split('x+').map((num) => Number.parseInt(num, 10));
					}
					else {
						intensity = Number.parseInt(condition);
					}

					switch (card.modifier) {
						case 'ravenous':
						case 'refined': {
							offset += Math.max(Math.floor(offset / 2), 2);
							break;
						}
						case 'crude': {
							offset -= Math.max(Math.floor(offset / 2), 2);
							break;
						}
						default: {
							break;
						}
					}

					if (!offset) return `${intensity}x`;
					return `${intensity}x+${offset}` as Intensity;
				}
				else {
					let [ relation, value ] = condition.split(' ') as [ Equivalency, string ];

					switch(card.modifier) {
						case 'inverted': {
							return `${EquivalencyInverse[relation]} ${value}` as Condition;
						}
						case 'refined': {
							const newValue = (relation === '>' || relation === '>=')
								? (Number.parseInt(value, 10) - 2) : (Number.parseInt(value) + 2);
							return `${relation} ${newValue}` as Condition;
						}
						case 'crude': {
							const newValue = (relation === '>' || relation === '>=')
								? (Number.parseInt(value, 10) + 2) : (Number.parseInt(value) - 2);
							return `${relation} ${newValue}` as Condition;
						}
						default: {
							return condition as Condition;
						}
					}
				}
			}) as (Intensity | Condition)[]
		}
	}

	newCard.type.description = (newCard.type.description.replace(/%(\d+)%/g, (_, match) => {
		const roll: Intensity | Condition = newCard.type.rolls[Number.parseInt(match) - 1];
		if (roll.includes('x')) {
			let intensity = 0, offset = 0;
			if (roll.includes('+')) [ intensity, offset ] = roll.split('x+').map(n => Number.parseInt(n, 10));
			else intensity = Number.parseInt(roll, 10);

			if (offset !== 0) return `${intensity}x ${offset >= 0 ? '+' : '-'} ${Math.abs(offset)}`;
			else return `${intensity}x`;
		}
		else {
			return roll;
		}
	}) + ' ' + (CardModifierDescriptions[card.modifier ?? ''] ?? '')).trim();

	return newCard;
}

export function executeCard(card: Card, rolls: number[], ctx: CardContext) {
	card = modifyCard(card);
	let data: CastData = { rolls: [] };

	for (let roll of card.type.rolls) {
		if (roll.includes('x')) {
			let intensity = 0, offset = 0;
			if (roll.includes('+')) [ intensity, offset ] = roll.split('x+').map(n => Number.parseInt(n, 10));
			else intensity = Number.parseInt(roll, 10);

			const val = rolls.shift()! ?? 0;

			data.rolls.push({
				roll: val * intensity + offset,
				raw: val,
				condition: true
			});
		}
		else {
			let [ equivalency, reqStr ] = roll.split(' ') as [ Equivalency, string ];
			let req = Number.parseInt(reqStr, 10);
			const val = rolls.shift()! ?? 0;
			let matches = false;

			switch (equivalency) {
				case '=': matches = val === req; break;
				case '!=': matches = val !== req; break;
				case '>': matches = val > req; break;
				case '<': matches = val < req; break;
				case '>=': matches = val >= req; break;
				case '<=': matches = val <= req; break;
				default: break;
			}

			data.rolls.push({
				roll: val,
				raw: val,
				condition: matches
			});
		}
	}

	return card.type.cast(data, ctx);
}

export function canExecuteCard(card: Card, ctx: CardContext) {
	if (!card.type.valid) return true;
	return card.type.valid(ctx);
}

export function generateCards(budget: number): [ Card, Card, Card ] {
	const types = [ ...CardTypes.keys()];

	const cardOneType = CardTypes.get(types[Math.floor(Math.random() * CardTypes.size)])!;

	const cardOne: Card = {
		type: cardOneType,
		modifier: [...cardOneType.modifiers, null ][Math.floor(Math.random() * cardOneType.modifiers.length + 1)]
	};

	budget -= cardOne.type.value * CardModifierValues[cardOne.modifier ?? ''];
	let possibleTypes = types.filter(type => CardTypes.get(type)!.value * 1.2 <= budget / 2)
		.filter(t => t !== cardOneType.type);
	if (possibleTypes.length === 0) possibleTypes = [ ...types ].filter(t => t !== cardOneType.type);

	const cardTwoType = CardTypes.get(possibleTypes[Math.floor(Math.random() * possibleTypes.length)])!;
	let possibleModifiers = [ ...cardTwoType.modifiers.filter(mod => cardTwoType.value * CardModifierValues[mod ?? ''] <= budget / 2), null ];
	if (possibleModifiers.length === 0) possibleModifiers = [ 'crude', 'binding' ];
	let cardTwoModifier = possibleModifiers[Math.floor(Math.random() * possibleModifiers.length)];

	const cardTwo: Card = {
		type: cardTwoType,
		modifier: cardTwoModifier
	}

	budget -= cardTwo.type.value * CardModifierValues[cardTwo.modifier ?? ''];
	possibleTypes = types.filter(type => CardTypes.get(type)!.value * 1.2 <= budget)
		.filter(t => t !== cardOneType.type && t !== cardTwoType.type);
	if (possibleTypes.length === 0) possibleTypes = [ ...types ]
	.filter(t => t !== cardOneType.type && t !== cardTwoType.type);

	const cardThreeType = CardTypes.get(possibleTypes[Math.floor(Math.random() * possibleTypes.length)])!;
	possibleModifiers = [ ...cardThreeType.modifiers.filter(mod => cardThreeType.value * CardModifierValues[mod ?? ''] <= budget), null ];
	if (possibleModifiers.length === 0) possibleModifiers = [ 'crude', 'binding' ];
	const cardThreeModifier = possibleModifiers[Math.floor(Math.random() * possibleModifiers.length)];

	const cardThree: Card = {
		type: cardThreeType,
		modifier: cardThreeModifier
	}

	return [
		cardOne,
		cardTwo,
		cardThree
	];
}
