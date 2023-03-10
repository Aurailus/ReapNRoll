import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Enemy from './Enemy';
import Entity from './Entity';

export interface Props {
	damage: number;
}

export default class RangedEnemyProjectile extends Entity<Props> {
	readonly type = 'ranged_projectile';

	private vel: vec2;
	private lifetime = 0;

	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);

		this.sprite = this.room.scene.add.sprite(pos[0], pos[1], 'magic_missile_projectile').setTint(0xfc86a9);
		this.sprite.setPosition(pos[0], pos[1]);

		this.vel = vec2.sub(vec2.create(), this.room.player.pos, pos);
		vec2.normalize(this.vel, this.vel);
		vec2.scale(this.vel, this.vel, 450);
	}

	update(delta: number) {
		this.lifetime += delta;
		if (this.lifetime > 2) this.destroy();

		if (vec2.dist(vec2.fromValues(this.sprite.x, this.sprite.y), this.room.player.pos) < vec2.len(this.vel) * delta) {
			const kb = vec2.sub(vec2.create(), this.room.player.pos, vec2.fromValues(this.sprite.x, this.sprite.y));
			vec2.normalize(kb, kb);
			vec2.scale(kb, kb, 20);

			this.room.player.damage(this.data.damage, kb);
			this.destroy();
		}
		else {
			this.sprite.setPosition(this.sprite.x + this.vel[0] * delta, this.sprite.y + this.vel[1] * delta);
		}
	}

	destroy(): void {
		this.sprite.destroy();
		this.room.destroyEntity(this);
	}
}
