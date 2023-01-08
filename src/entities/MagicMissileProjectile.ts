import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Enemy from './Enemy';
import Entity from './Entity';

export interface Props {
	target: Enemy;
	damage: number;
}

export default class MagicMissileProjectile extends Entity<Props> {
	readonly type = 'magic_missile_projectile';

	private speed = 300;
	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);

		this.sprite = this.room.scene.add.sprite(pos[0], pos[1], 'magic_missile_projectile');
		this.sprite.setPosition(pos[0], pos[1]);
	}

	update(delta: number) {
		if (this.speed < 1) this.speed = Math.min(this.speed + delta * 1000 * 100, 500);

		const diff = vec2.sub(vec2.create(), this.data.target.pos, vec2.fromValues(this.sprite.x, this.sprite.y));
		vec2.normalize(diff, diff);

		if (vec2.dist(vec2.fromValues(this.sprite.x, this.sprite.y), this.data.target.pos) < this.speed * delta) {
			vec2.scale(diff, diff, 15);
			this.data.target.damage(this.data.damage, diff);
			this.destroy();
		}
		else {
			vec2.scale(diff, diff, this.speed * delta);
			let newPos = vec2.add(vec2.create(), diff, vec2.fromValues(this.sprite.x, this.sprite.y));
			this.sprite.setPosition(newPos[0], newPos[1]);
		}
	}

	destroy(): void {
		this.sprite.destroy();
		this.room.destroyEntity(this);
	}
}
