import { vec2 } from 'gl-matrix';

import Room from '../Room';
import getPath from '../AStar';
import Enemy, { ENEMIES } from './Enemy';
import { rayCollides } from '../Collides';
import { clamp } from '../Util';

const DEFAULT_ACTIVATE_RANGE = 8;
const DEFAULT_DEACTIVATE_RANGE = 10;

export interface Props {
	activateRange: number;
	deactivateRange: number;
	value: number;
}

export default class MeleeEnemy extends Enemy {
	readonly type = 'melee_enemy';

	private active = false;

	private lastVelLen: number = 0;
	private target: vec2 = vec2.create();
	private path: vec2[] = [];

	constructor(room: Room, tilePos: vec2, data: Props) {
		super(room, tilePos, data);
		this.pos = vec2.scale(vec2.create(), tilePos, 16);
		this.sprite.setTexture('melee', 0);
		this.sprite.anims.create({ key: 'idle', repeat: -1, frameRate: 6, frames: [ { key: 'melee', frame: 0 } ] });
		this.sprite.anims.create({ key: 'walk', repeat: -1, frameRate: 6, frames: [ { key: 'melee', frame: 1 }, { key: 'melee', frame: 2 }, { key: 'melee', frame: 3 } ] });
		this.sprite.anims.create({ key: 'attack', repeat: 0, frameRate: 12, frames: [ { key: 'melee', frame: 4 }, { key: 'melee', frame: 5 }, { key: 'melee', frame: 6 } ] });
		this.sprite.anims.create({ key: 'stumble', repeat: 0, frameRate: 12, frames: [ { key: 'melee', frame: 8 }, { key: 'melee', frame: 9 }, { key: 'melee', frame: 10 }, { key: 'melee', frame: 11 } ] });

	}

	update(delta: number) {
		const distToPlayer = vec2.dist(this.room.player.pos, this.pos);

		if (!this.active && distToPlayer < (this.data.activateRange ?? DEFAULT_ACTIVATE_RANGE) * 16) {
			this.active = true;
		}
		else if (this.active && distToPlayer > (this.data.deactivateRange ?? DEFAULT_DEACTIVATE_RANGE) * 16) {
			this.active = false;
			this.sprite.anims.play('idle');
			return;
		}

		const friction = 0.6;
		const scaledFriction = clamp(friction * (delta * 60), 0, 1)
		let newVel = vec2.create();

		if (this.killTime > 0) {
			this.killTime -= delta;
			if (this.killTime <= 0) {
				this.destroy();
				return;
			}
		}

		if (this.attackCooldownTime === 0 && this.noControlTime === 0 && this.active) {
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
				}

				let nextPos = this.path.length === 1 ? vec2.clone(this.room.player.pos) : vec2.add(vec2.create(), vec2.scale(vec2.create(), tile, 16), vec2.fromValues(8, 8));

				if ((this.path.length !== 1 && vec2.dist(this.pos, nextPos) < 24) || this.lastVelLen <= 0.5) {
					let diff = vec2.sub(vec2.create(), nextPos, this.pos);
					nextPos = vec2.add(nextPos, nextPos, vec2.fromValues(diff[0] > 0 ? 8 : -8, diff[1] > 0 ? 8 : -8));
				}

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

		vec2.add(this.vel, vec2.scale(this.vel, this.vel, scaledFriction), vec2.scale(newVel, newVel, 1 - scaledFriction));

		if (this.lastVelLen > 0.1) {
			if (this.sprite.anims.currentAnim?.key === 'idle' || !this.sprite.anims.isPlaying) this.sprite.anims.play('walk');
		}
		else {
			if (this.sprite.anims.currentAnim?.key === 'walk' || !this.sprite.anims.isPlaying) this.sprite.anims.play('idle');
		}


		if (this.vel[0] !== 0 && this.sprite.anims.currentAnim?.key !== 'stumble') {
			if (this.vel[0] > 0) {
				this.sprite.scaleX = -1;
			}
			else {
				this.sprite.scaleX = 1;
			}
		}
		let lastPos = vec2.clone(this.pos);

		super.update(delta);

		this.lastVelLen = vec2.dist(this.pos, lastPos);

		if (vec2.dist(this.pos, this.room.player.pos) < 0.8 * 16 &&
			this.attackCooldownTime === 0 && this.noControlTime === 0) {
			let kb = vec2.sub(vec2.create(), this.room.player.pos, this.pos);
			vec2.normalize(kb, kb);
			vec2.scale(kb, kb, 10);
			this.room.player.damage(1, kb);
			this.sprite.anims.play('attack');
			this.attackCooldownTime = 0.3;
		}
	}

	setPosition(pos: vec2) {
		this.sprite.setPosition(Math.round(pos[0]), Math.round(pos[1]));
		this.pos = pos;
	}

	getStartingHealth(): number {
		return 30;
	}
}
