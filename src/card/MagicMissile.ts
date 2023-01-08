import { CardType } from './Card';

import card_image from '../../res/card_image.png';
import { vec2 } from 'gl-matrix';
import Enemy from '../entities/Enemy';
import MagicMissileProjectile from '../entities/MagicMissileProjectile';

const card: CardType = {
	name: 'Magic Missile',
	image: card_image,
	description: 'Fires 3 homing bolts into enemies near the target, dealing %1% damage to each.',
	rolls: [ '1x+9', '1x+9', '1x+9' ],
	valid: ({ room }) => {
		return room.entities.filter(entity => entity.type === 'enemy').length >= 1;
	},
	cast: (data, { room, target }) => {
		let enemies = room.entities.filter(entity => entity.type === 'enemy') as Enemy[];
		enemies.sort((a, b) => {
			let aDist = vec2.distance(vec2.add(vec2.create(), a.pos, vec2.scale(vec2.create(), a.size, 0.5)), target);
			let bDist = vec2.distance(vec2.add(vec2.create(), b.pos, vec2.scale(vec2.create(), b.size, 0.5)), target);
			return aDist - bDist;
		});

		for (let i = 0; i < 3; i++) {
			room.entities.push(new MagicMissileProjectile(room, room.player.pos,
				{ target: enemies[i % enemies.length], damage: data.rolls[i].roll }));
		}
	}
};

export default card;
