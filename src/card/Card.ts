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
	image: string;
	description: string;
	rolls: (Intensity | Condition)[];

	valid?: (ctx: CardContext) => boolean;
	cast: (data: CastData, ctx: CardContext) => void;
}

export const CardModifiers = [ 'refined', 'crude', 'inverted', 'beginner', 'master', 'bifurcated', 'wild' ] as const;

export type CardModifier = typeof CardModifiers[number];

export const CardModifierNames: Record<CardModifier | '', string> = {
	'': '',
	refined: 'Refined',
	crude: 'Crude',
	inverted: 'Inverted',
	beginner: 'Beginner\'s',
	master: 'Master\'s',
	bifurcated: 'Bifurcated',
	wild: 'Wild'
};

export const CardTypes = new Map<string, CardType>();

import Beam from './Beam';
import Heal from './Heal';
import Blink from './Blink';
import Revive from './Revive';
import Fireball from './Fireball';
import MagicMissile from './MagicMissile';

CardTypes.set('beam', Beam);
CardTypes.set('heal', Heal);
CardTypes.set('blink', Blink);
CardTypes.set('revive', Revive);
CardTypes.set('fireball', Fireball);
CardTypes.set('magic_missile', MagicMissile);

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
						default: {
							return condition as Condition;
						}
					}
				}
			}) as (Intensity | Condition)[]
		}
	}

	newCard.type.description = newCard.type.description.replace(/%(\d+)%/g, (_, match) => {
		const roll = newCard.type.rolls[Number.parseInt(match) - 1];
		if (roll.includes('x')) {
			let intensity = 0, offset = 0;
			if (roll.includes('+')) [ intensity, offset ] = roll.split('x+').map(n => Number.parseInt(n, 10));
			else intensity = Number.parseInt(roll, 10);

			if (offset !== 0) return `${intensity}x ${offset >= 0 ? '+' : '-'} ${offset}`;
			else return `${intensity}x`;
		}
		else {
			return roll;
		}
	});

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

	card.type.cast(data, ctx);
}

export function canExecuteCard(card: Card, ctx: CardContext) {
	if (!card.type.valid) return true;
	return card.type.valid(ctx);
}
