import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';
import { collides, rayCollides } from '../Collides';
import getPath from '../AStar';

export interface Props {
}

export const ENEMIES = new Set<Enemy>();

export default class Enemy extends Entity<Props> {
	readonly type = 'enemy';

	private sprite: Phaser.GameObjects.Sprite;
	// private targetSprite: Phaser.GameObjects.Sprite;

	pos: vec2;
	vel = vec2.fromValues(0, 0);
	size: vec2 = [ 14, 14 ];

	private health = 60;

	private lastVelLen: number = 0;
	private noControlTime = 0;
	private attackCooldown = 0;
	private invincibilityTime = 0;
	private killTime = 0;

	private target: vec2 = vec2.create();
	private path: vec2[] = [];

	constructor(room: Room, tilePos: vec2, data: Props) {
		super(room, tilePos, data);
		this.pos = vec2.scale(vec2.create(), tilePos, 16);
		this.sprite = this.room.scene.add.sprite(this.pos[0], this.pos[1], 'enemy').setOrigin(0);
		ENEMIES.add(this);
		// this.targetSprite = this.room.scene.add.sprite(this.pos[0], this.pos[1], 'star_particle', 0).setOrigin(0);
	}

	update(delta: number) {
		const friction = 0.6;
		let newVel = vec2.create();

		if (this.attackCooldown > 0) this.attackCooldown = Math.max(this.attackCooldown - delta, 0);
		if (this.noControlTime > 0) this.noControlTime = Math.max(this.noControlTime - delta, 0);
		if (this.invincibilityTime > 0) this.invincibilityTime = Math.max(this.invincibilityTime - delta, 0);

		if (this.killTime > 0) {
			this.killTime -= delta;
			if (this.killTime <= 0) {
				this.destroy();
				return;
			}
		}

		if (this.attackCooldown === 0 && this.noControlTime === 0) {
			let playerTilePos = vec2.round(vec2.create(), vec2.scale(vec2.create(), this.room.player.pos, 1/16));
			if (!vec2.equals(playerTilePos, this.target)) {
				this.target = playerTilePos;
				let tilePos = vec2.round(vec2.create(), vec2.scale(vec2.create(), this.pos, 1/16));
				this.path = getPath(tilePos, playerTilePos, this.room.data);
				this.path.shift();
			}

			if (this.path.length > 0 && vec2.distance(this.pos, this.room.player.pos) > 0.8 * 16) {
				let tile = this.path[0];

				while (this.path.length > 1 && this.lastVelLen > 0.5) {
					let nextTile = this.path[1];
					if (rayCollides(this.pos, vec2.scale(vec2.create(), nextTile, 16), this.room.data)) break;
					this.path.shift();
					tile = nextTile;
					// console.log('shifting unnecessary node');
				}

				let nextPos = this.path.length === 1 ? vec2.clone(this.room.player.pos) : vec2.scale(vec2.create(), tile, 16);

				if ((this.path.length !== 1 && vec2.dist(this.pos, nextPos) < 24) || this.lastVelLen <= 0.5) {
					let diff = vec2.sub(vec2.create(), nextPos, this.pos);
					nextPos = vec2.add(nextPos, nextPos, vec2.fromValues(diff[0] > 0 ? 8 : -8, diff[1] > 0 ? 8 : -8));
				}

				// this.targetSprite.setPosition(nextPos[0], nextPos[1]);

				newVel = vec2.sub(vec2.create(), nextPos, this.pos);
				vec2.normalize(newVel, newVel);

				if (vec2.dist(this.pos, nextPos) < 0.2) this.path.shift();
			}

			for (let enemy of ENEMIES) {
				if (enemy !== this && vec2.sqrDist(enemy.pos, this.pos) < 16 * 25) {
					let diff = vec2.sub(vec2.create(), this.pos, enemy.pos);
					vec2.normalize(diff, diff);
					vec2.scale(diff, diff, vec2.sqrDist(enemy.pos, this.pos) < 16 * 6 ? 1 : 0.5);
					vec2.add(newVel, newVel, diff);
				}
			}

			if (vec2.sqrDist(this.room.player.pos, this.pos) < 60) {
				let diff = vec2.sub(vec2.create(), this.pos, this.room.player.pos);
				vec2.normalize(diff, diff);
				vec2.scale(diff, diff, 8);
				vec2.add(newVel, newVel, diff);
			}
		}

		vec2.add(this.vel, vec2.scale(this.vel, this.vel, friction), vec2.scale(newVel, newVel, 1-friction));

		let currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
			this.pos[0] + this.size[0], this.pos[1] + this.size[1]);

		let lastPos = this.pos;

		let totalVel = this.vel[0];
		while (Math.abs(totalVel) > 0) {
			let offsetX = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(offsetX, 0, offsetX, 0)), this.room.data)) {
				this.setPosition(vec2.fromValues(this.pos[0] + offsetX, this.pos[1]));
				currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
					this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		totalVel = this.vel[1];
		while (Math.abs(totalVel) > 0) {
			let offsetY = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(0, offsetY, 0, offsetY)), this.room.data)) {
				this.setPosition(vec2.fromValues(this.pos[0], this.pos[1] + offsetY));
				currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
					this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		this.lastVelLen = vec2.dist(this.pos, lastPos);

		if (vec2.dist(this.pos, this.room.player.pos) < 0.8 * 16 && this.attackCooldown <= 0) {
			let kb = vec2.sub(vec2.create(), this.room.player.pos, this.pos);
			vec2.normalize(kb, kb);
			vec2.scale(kb, kb, 10);
			this.room.player.damage(3, kb);
			this.attackCooldown = 0.3;
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

		this.invincibilityTime = 0.1;
		this.health -= amount;
		this.vel = knockback;
		this.noControlTime = 0.4;

		if (this.health <= 0) {
			this.killTime = 0.1;
			vec2.scale(this.vel, this.vel, 1.5);
		}
	}

	destroy(): void {
		this.sprite.destroy();
		ENEMIES.delete(this);
		this.room.destroyEntity(this);
	}
}
