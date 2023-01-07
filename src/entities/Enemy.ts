import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';
import { collides, intersects } from '../Collides';
import getPath from '../AStar';

export interface Props {
}

export default class Spike extends Entity<Props> {
	private sprite: Phaser.GameObjects.Sprite;

	private pos: vec2;
	private vel = vec2.fromValues(0, 0);
	private size: vec2 = [ 14, 14 ];

	private target: vec2 = vec2.create();
	private path: vec2[] = [];

	constructor(room: Room, tilePos: vec2, data: Props) {
		super(room, tilePos, data);
		this.pos = vec2.scale(vec2.create(), tilePos, 16);
		this.sprite = this.room.scene.add.sprite(this.pos[0], this.pos[1], 'spike_off').setOrigin(0);;
	}

	update() {
		const friction = 0.6;
		let newVel = vec2.create();

		let playerTilePos = vec2.round(vec2.create(), vec2.scale(vec2.create(), this.room.player.pos, 1/16));
		if (!vec2.equals(playerTilePos, this.target)) {
			this.target = playerTilePos;
			let tilePos = vec2.round(vec2.create(), vec2.scale(vec2.create(), this.pos, 1/16));
			this.path = getPath(tilePos, playerTilePos, this.room.data);
			this.path.shift();
		}

		if (this.path.length > 0) {
			const nextTile = this.path[0];
			const nextPos = vec2.scale(vec2.create(), nextTile, 16);

			newVel = vec2.sub(vec2.create(), nextPos, this.pos);
			vec2.normalize(newVel, newVel);

			if (vec2.dist(this.pos, nextPos) < 0.2) this.path.shift();
		}

		vec2.add(this.vel, vec2.scale(this.vel, this.vel, friction), vec2.scale(newVel, newVel, 1-friction));

		let currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
			this.pos[0] + this.size[0], this.pos[1] + this.size[1]);

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
	}

	setPosition(pos: vec2) {
		this.sprite.setPosition(Math.round(pos[0]), Math.round(pos[1]));
		this.pos = pos;
	}
}
