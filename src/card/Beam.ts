import { CardType } from './Card';

import { vec2 } from 'gl-matrix';
import Enemy from '../entities/Enemy';
import Entity from '../entities/Entity';
import setPausableTimeout from '../PauseableTimeout';

import card_image from '../../res/card_image.png';

function isEnemy(entity: Entity): entity is Enemy {
	return entity.type === 'enemy';
}

function lineIntersection(origin1: vec2, direction1: vec2, origin2: vec2, direction2: vec2) {
	let det = direction1[0] * direction2[1] - direction1[1] * direction2[0];
	if (det === 0) return null;
	let t = (origin2[0] - origin1[0]) * direction2[1] - (origin2[1] - origin1[1]) * direction2[0];
	return vec2.add(vec2.create(), origin1, vec2.scale(vec2.create(), direction1, t / det));
}

const card: CardType = {
	name: 'Beam',
	image: card_image,
	description: 'Fires a beam towards the target, damaging everything in its path.',
	rolls: [ '2x+16' ],
	cast: (data, { room, target }) => {
		let direction = vec2.sub(vec2.create(), target, vec2.add(vec2.create(),
			room.player.pos, vec2.scale(vec2.create(), room.player.size, 0.5)));
		vec2.normalize(direction, direction);

		let tangentLine = vec2.rotate(vec2.create(), direction, vec2.create(), Math.PI / 2);

		let line = room.scene.add.line(room.player.pos[0] + room.player.size[0] / 2 - direction[0] * 500,
			room.player.pos[1] + room.player.size[1] / 2 - direction[1] * 500, 0, 0, direction[0] * 1000, direction[1] * 1000, 0xff0000, 0.3).setOrigin(0).setLineWidth(10);
		setPausableTimeout(() => line.destroy(), 200);

		room.entities
			.filter<Enemy>(isEnemy)
			.filter(enemy => {
				const enemyPos = vec2.fromValues(enemy.pos[0] + enemy.size[0] / 2, enemy.pos[1] + enemy.size[1] / 2);
				const intersectPos = lineIntersection(enemyPos, tangentLine, target, direction)!;
				const distance = vec2.dist(intersectPos, enemyPos);
				return distance < 32;
			})
			.map(enemy => {
				const enemyPos = vec2.fromValues(enemy.pos[0] + enemy.size[0] / 2, enemy.pos[1] + enemy.size[1] / 2);
				const intersectPos = lineIntersection(enemyPos, tangentLine, target, direction)!;
				let diff = vec2.sub(vec2.create(), enemyPos, intersectPos);
				vec2.normalize(diff, diff);
				vec2.scale(diff, diff, 20);
				enemy.damage(data.rolls[0].roll, diff);
			});
	}
};

export default card;
