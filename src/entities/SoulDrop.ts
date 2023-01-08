import { vec2 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';

export default class StartPortal extends Entity<{}> {
	readonly type = 'soul_drop';

	private pos: vec2;
	private vel: vec2 = [0, 0];
	private lifetime: number = 1;

	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: {}) {
		super(room, pos, data);

		this.pos = pos;
		const angle = Math.random() * Math.PI * 2;
		this.vel = vec2.fromValues(Math.cos(angle) * 100, Math.sin(angle) * 100);

		this.sprite = this.room.scene.add.sprite(pos[0], pos[1], 'soul');
	}

	update(delta: number) {
		const friction = 0.85;

		const targetPos = vec2.add(vec2.create(), this.room.player.pos,
		vec2.scale(vec2.create(), this.room.player.size, 0.5));

		this.lifetime += delta;
		const newVel = vec2.sub(vec2.create(), targetPos, this.pos);
		vec2.normalize(newVel, newVel);
		vec2.scale(newVel, newVel, this.lifetime * 100);
		vec2.add(this.vel, vec2.scale(this.vel, this.vel, friction), vec2.scale(newVel, newVel, 1-friction));
		vec2.add(this.pos, this.pos, vec2.scale(vec2.create(), this.vel, delta));

		this.sprite.setAlpha(Math.min((this.lifetime - 1), 0.5) + .5);
		this.sprite.setScale(Math.min((this.lifetime - 1) * 0.5, 0.5) + .5);
		this.sprite.setPosition(this.pos[0], this.pos[1]);

		if (vec2.distance(this.pos, targetPos) < 5) {
			this.room.player.setCurrency(this.room.player.getCurrency() + 100);
			this.destroy();
		}
	}

	destroy(): void {
		this.sprite.destroy();
		this.room.destroyEntity(this);
	}
}
