import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';
import SoulDrop from './SoulDrop';
import StatusText from '../StatusText';
import { collides } from '../Collides';

export interface Props {
	activateRange: number;
	deactivateRange: number;
	value?: number;
	health?: number;
}

export const ENEMIES = new Set<Enemy>();

export default abstract class Enemy extends Entity<Props> {
	pos: vec2;
	vel = vec2.fromValues(0, 0);
	size: vec2 = [ 14, 14 ];


	protected sprite: Phaser.GameObjects.Sprite;
	protected health: number;

	protected attackCooldownTime = 0;
	protected invincibilityTime = 0;
	protected noControlTime = 0;
	protected killTime = 0;

	constructor(room: Room, tilePos: vec2, data: Props) {
		super(room, tilePos, data);
		this.pos = vec2.scale(vec2.create(), tilePos, 16);
		this.sprite = this.room.scene.add.sprite(this.pos[0], this.pos[1], 'enemy').setOrigin(0);
		this.health = this.data.health ?? this.getStartingHealth();
		ENEMIES.add(this);
	}

	update(delta: number) {
		this.invincibilityTime = Math.max(0, this.invincibilityTime - delta);
		this.noControlTime = Math.max(0, this.noControlTime - delta);
		this.attackCooldownTime = Math.max(0, this.attackCooldownTime - delta);

		let currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
			this.pos[0] + this.size[0], this.pos[1] + this.size[1]);

		let totalVel = this.vel[0]  * delta * (60/1);;
		while (Math.abs(totalVel) > 0) {
			let offsetX = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(offsetX, 0, offsetX, 0)), this.room.data)) {
				this.setPosition(vec2.fromValues(this.pos[0] + offsetX, this.pos[1]));
				currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
					this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		totalVel = this.vel[1]  * delta * (60/1);;
		while (Math.abs(totalVel) > 0) {
			let offsetY = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(0, offsetY, 0, offsetY)), this.room.data)) {
				this.setPosition(vec2.fromValues(this.pos[0], this.pos[1] + offsetY));
				currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
					this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		if (this.killTime > 0) {
			this.killTime -= delta;
			if (this.killTime <= 0) {
				this.destroy();
				return;
			}
		}
	}

	setPosition(pos: vec2) {
		this.sprite.setPosition(Math.round(pos[0]), Math.round(pos[1]));
		this.pos = pos;
	}

	getBounds(): vec4 {
		return vec4.fromValues(this.pos[0], this.pos[1], this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
	}

	damage(amount: number, knockback: vec2 = vec2.create()) {
		if (this.invincibilityTime > 0) return;

		this.invincibilityTime = 0.02;
		this.health -= amount;
		this.vel = knockback;
		this.noControlTime = 0.4;

		this.room.scene.add.existing(new StatusText(this.room.scene, vec2.fromValues(
			this.pos[0] + this.size[0] / 2, this.pos[1] - 4), amount));

		if (this.health <= 0) {
			this.killTime = 0.1;
			vec2.scale(this.vel, this.vel, 1.5);
		}
	}

	destroy(): void {
		for (let i = 0; i < (this.data.value ?? this.getSoulAmount()); i += 100) this.room.entities.push(new SoulDrop(this.room, this.pos, {}));

		this.sprite.destroy();
		ENEMIES.delete(this);
		this.room.destroyEntity(this);
	}

	getSoulAmount(): number {
		return 300;
	}

	getStartingHealth(): number {
		return 60;
	}
}
