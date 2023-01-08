import { vec2 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';

export default class EndPortal extends Entity<{}> {
	readonly type = 'end_portal';

	private pos: vec2;
	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: {}) {
		super(room, pos, data);
		this.pos = vec2.scale(vec2.create(), pos, 16);

		this.sprite = this.room.scene.add.sprite(pos[0] * 16 + 8, pos[1] * 16 + 8, 'end_portal');
	}

	update() {
		const playerPos = vec2.add(vec2.create(), this.room.player.pos,
			vec2.scale(vec2.create(), this.room.player.size, 0.5));

		if (vec2.dist(playerPos, this.pos) < 24) {
			console.warn('TO NEXT ROOM');
		}
	}

	destroy(): void {
		this.sprite.destroy();
	}
}
