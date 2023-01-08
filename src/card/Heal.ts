import { CardType } from './Card';

import card_image from '../../res/card_image.png';

const card: CardType = {
	name: 'Heal',
	type: 'heal',
	image: card_image,
	value: 30,
	modifiers: [ 'refined', 'crude', 'binding', 'wild', 'preserved' ],
	description: 'Restores %1% health to the caster.',
	rolls: [ '1x' ],
	valid: ({ room: { player }}) => {
		return player.getHealth() < player.getMaxHealth();
	},
	cast: (data, { room: { player }}) => {
		player.heal(data.rolls[0].roll);
		return { damage: 0 };
	}
};

export default card;
