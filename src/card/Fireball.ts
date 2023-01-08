import { CardType } from './Card';

import { vec2 } from 'gl-matrix';
import Enemy from '../entities/Enemy';
import Entity from '../entities/Entity';
import setPausableTimeout from '../PauseableTimeout';

import card_image from '../../res/card_image.png';

function isEnemy(entity: Entity): entity is Enemy {
	return entity.type === 'enemy';
}

const card: CardType = {
	name: 'Fireball',
	image: card_image,
	type: 'fireball',
	value: 24,
	modifiers: [ 'refined', 'crude', 'binding', 'wild', 'ravenous', 'vampiric', 'preserved' ],
	description: 'Creates an explosion at the target, dealing %1% damage to all enemies.',
	rolls: [ '3x+12' ],
	cast: (data, { room, target }) => {
		let circle = room.scene.add.circle(target[0], target[1], 16 * 3, 0xff0000, 0.3);
		setPausableTimeout(() => circle.destroy(), 200);

		let totalDamage = 0;

		room.entities
			.filter<Enemy>(isEnemy)
			.filter(e => vec2.dist(vec2.add(vec2.create(), e.pos, vec2.scale(vec2.create(), e.size, 0.5)), target) < 16 * 4)
			.map(enemy => {
				let diff = vec2.sub(vec2.create(), vec2.add(vec2.create(),
					enemy.pos, vec2.scale(vec2.create(), enemy.size, 0.5)), target);
				vec2.normalize(diff, diff);
				vec2.scale(diff, diff, 20);
				enemy.damage(data.rolls[0].roll, diff);
				totalDamage += data.rolls[0].roll;
			});

		return { damage: totalDamage };
	}
};

export default card;
