import { CardType } from './Card';

import card_image from '../../res/card_image.png';

const card: CardType = {
	name: 'Revive',
	image: card_image,
	description: 'Gives a second change to fight against death, if the fates are in your favor. Roll %1% upon death.',
	rolls: [ '>= 9' ],
	valid: () => false,
	cast: (data, { room: { player }}) => {
		console.log(data);
		if (data.rolls[0].condition) {
			player.heal(player.getMaxHealth());
			player.giveInvincibility(1);
		}
	}
};

export default card;
