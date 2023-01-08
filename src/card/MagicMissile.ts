import { CardType } from './Card';

import card_image from '../../res/card_image.png';
import { vec2 } from 'gl-matrix';
import MagicMissileProjectile from '../entities/MagicMissileProjectile';
import { isEnemy } from './Fireball';

const card: CardType = {
	name: 'Magic Missile',
	type: 'magic_missile',
	image: card_image,
	value: 16,
	modifiers: [ 'refined', 'crude', 'binding', 'wild', 'ravenous', 'vampiric', 'preserved' ],
	description: 'Fires 3 homing bolts into enemies near the target, dealing %1% damage to each.',
	rolls: [ '1x+9', '1x+9', '1x+9' ],
	valid: ({ room }) => {
		return room.entities.findIndex(isEnemy) !== -1;
	},
	cast: (data, { room, target }) => {
		let enemies = room.entities.filter(isEnemy).sort((a, b) => {
			let aDist = vec2.distance(a.pos, target);
			let bDist = vec2.distance(b.pos, target);
			return aDist - bDist;
		});

		let totalDamage = 0;

		for (let i = 0; i < 3; i++) {
			room.entities.push(new MagicMissileProjectile(room, room.player.pos,
				{ target: enemies[i % enemies.length], damage: data.rolls[i].roll }));
			totalDamage += data.rolls[i].roll;
		}

		return { damage: totalDamage };
	}
};

export default card;
