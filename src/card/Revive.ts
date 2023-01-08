import { CardType } from './Card';

import card_image from '../../res/card_image.png';

const card: CardType = {
	name: 'Revive',
	type: 'revive',
	image: card_image,
	value: 60,
	modifiers: [ 'refined', 'crude', 'preserved' ],
	description: 'Gives a second change to fight against death, if the fates are in your favor. Roll %1% upon death.',
	rolls: [ '>= 9' ],
	valid: () => false,
	cast: (data, { room: { player }}) => {
		if (data.rolls[0].condition) {
			player.heal(player.getMaxHealth());
			player.giveInvincibility(1);
		}
		return { damage: 0 };
	}
};

export default card;
