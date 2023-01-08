import { CardType } from './Card';

import { vec2 } from 'gl-matrix';
import Enemy from '../entities/Enemy';

import card_image from '../../res/card_image.png';
import { isEnemy } from './Fireball';

function lineIntersection(origin1: vec2, direction1: vec2, origin2: vec2, direction2: vec2) {
	let det = direction1[0] * direction2[1] - direction1[1] * direction2[0];
	if (det === 0) return null;
	let t = (origin2[0] - origin1[0]) * direction2[1] - (origin2[1] - origin1[1]) * direction2[0];
	return vec2.add(vec2.create(), origin1, vec2.scale(vec2.create(), direction1, t / det));
}

const card: CardType = {
	name: 'Beam',
	type: 'beam',
	value: 16,
	image: card_image,
	modifiers: [ 'refined', 'crude', 'binding', 'wild', 'ravenous', 'vampiric', 'preserved' ],
	description: 'Fires a beam towards the target, dealing %1% damage to everything in its path.',
	rolls: [ '2x+16' ],
	cast: (data, { room, target }) => {
		let direction = vec2.sub(vec2.create(), target, room.player.pos);
		vec2.normalize(direction, direction);

		let totalDamage = 0;

		let tangentLine = vec2.rotate(vec2.create(), direction, vec2.create(), Math.PI / 2);

		let line = room.scene.add.line(room.player.pos[0] - direction[0] * 500,
			room.player.pos[1] - direction[1] * 500, 0, 0, direction[0] * 1000, direction[1] * 1000, 0xff0000, 0.3).setOrigin(0).setLineWidth(10);
		room.scene.time.addEvent({ callback: () => line.destroy(), delay: 200 });

		room.entities
			.filter<Enemy>(isEnemy)
			.filter(enemy => {
				const enemyPos = vec2.fromValues(enemy.pos[0], enemy.pos[1]);
				const intersectPos = lineIntersection(enemyPos, tangentLine, target, direction)!;
				const distance = vec2.dist(intersectPos, enemyPos);
				return distance < 32;
			})
			.map(enemy => {
				const enemyPos = vec2.fromValues(enemy.pos[0], enemy.pos[1]);
				const intersectPos = lineIntersection(enemyPos, tangentLine, target, direction)!;
				let diff = vec2.sub(vec2.create(), enemyPos, intersectPos);
				vec2.normalize(diff, diff);
				vec2.scale(diff, diff, 20);
				enemy.damage(data.rolls[0].roll, diff);
				totalDamage += data.rolls[0].roll;
			});
			room.scene.sound.play('explode', { volume: 0.7, rate: 1.5 });

		return { damage: totalDamage };
	}
};

export default card;
