import { CardType } from './Card';

import card_image from '../../res/card_image.png';

const card: CardType = {
	name: 'Heal',
	image: card_image,
	description: 'Restores %1% health to the caster.',
	rolls: [ '1x' ],
	valid: ({ room: { player }}) => {
		return player.getHealth() < player.getMaxHealth();
	},
	cast: (data, { room: { player }}) => {
		player.heal(data.rolls[0].roll);
	}
};

export default card;
