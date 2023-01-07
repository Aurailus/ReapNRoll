
export const DiceModifiers = [ 'weighted', 'cursed' ] as const;

export type DiceModifier = typeof DiceModifiers[number];

export const DiceModifierNames: Record<DiceModifier | '', string> = {
	'': '',
	weighted: 'Weighted',
	cursed: 'Cursed'
};

export interface Dice {
	sides: number;
	modifier: DiceModifier | null;
}

export function rollDice(dice: Dice) {
	let power;

	switch (dice.modifier) {
		case 'weighted': {
			power = 0.4;
			break;
		}
		case 'cursed': {
			power = 1.8;
			break;
		}
		default: {
			power = 0.7;
			break;
		}
	}

	const value = Math.floor(Math.pow(Math.random(), power) * dice.sides) + 1;
	return value;
}

export function getDiceName(dice: Dice) {
	return `${DiceModifierNames[dice.modifier ?? '']} d${dice.sides}`.trim();
}
