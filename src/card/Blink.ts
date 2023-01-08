import { CardType } from './Card';

import { vec2, vec4 } from 'gl-matrix';
import Enemy from '../entities/Enemy';

import card_image from '../../res/card_image.png';
import { collides } from '../Collides';
import { isEnemy } from './Fireball';

const card: CardType = {
	name: 'Blink',
	type: 'blink',
	value: 7,
	image: card_image,
	modifiers: [ 'refined', 'crude', 'binding', 'wild', 'ravenous', 'vampiric', 'preserved' ],
	description: 'Teleports the player to the target position, hitting nearby enemies with %1% damage. Fails if the position is obstructed.',
	rolls: [ '1x+6' ],
	valid: ({ room, target }) => {
		const targetBounds = vec4.fromValues(target[0] - room.player.size[0] / 2, target[1] - room.player.size[1] / 2,
			target[0] + room.player.size[0] / 2, target[1] + room.player.size[1] / 2);
		return !collides(targetBounds, room.data);
	},
	cast: (data, { room, target }) => {
		const targetBounds = vec4.fromValues(target[0] - room.player.size[0] / 2, target[1] - room.player.size[1] / 2,
			target[0] + room.player.size[0] / 2, target[1] + room.player.size[1] / 2);

		let totalDamage = 0;

		room.player.setPosition(vec2.fromValues(targetBounds[0] + room.player.size[0] / 2, targetBounds[1] + room.player.size[1] / 2));

		let circle = room.scene.add.circle(target[0], target[1], 16 * 3, 0xff0000, 0.3);
		room.scene.time.addEvent({ callback: () => circle.destroy(), delay: 200 });
		room.player.giveInvincibility(0.5);


		room.entities
			.filter<Enemy>(isEnemy)
			.filter(e => vec2.dist(vec2.add(vec2.create(), e.pos, vec2.scale(vec2.create(), e.size, 0.5)), target) < 16 * 4)
			.map(enemy => {
				let diff = vec2.sub(vec2.create(), enemy.size, target);
				vec2.normalize(diff, diff);
				vec2.scale(diff, diff, 20);
				enemy.damage(data.rolls[0].roll, diff);
				totalDamage += data.rolls[0].roll;
			});

		return { damage: totalDamage };
	}
};

export default card;
