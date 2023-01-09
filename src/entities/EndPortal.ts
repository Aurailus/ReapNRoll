import { vec2 } from 'gl-matrix';
import DungeonRoom from '../DungeonRoom';

import Room from '../Room';
import { ROOMS, ROOM_SOULS } from '../scene/LoadScene';
import Entity from './Entity';

export default class EndPortal extends Entity<{}> {
	readonly type = 'end_portal';

	private active = true;
	private pos: vec2;
	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: {}) {
		super(room, pos, data);
		this.pos = vec2.scale(vec2.create(), pos, 16);

		this.sprite = this.room.scene.add.sprite(pos[0] * 16 + 8, pos[1] * 16 + 8, 'end_portal');
	}

	update() {
		if (vec2.dist(this.room.player.pos, this.pos) < 24 && this.active) {
			let nextRoom: DungeonRoom;

			if (this.room.data === ROOM_SOULS) {
				const roomOptions = [ ...ROOMS ];
				nextRoom = roomOptions[Math.floor(Math.random() * roomOptions.length)];
			}
			else {
				nextRoom = ROOM_SOULS;
			}

			this.room.scene.scene.start('room', { player: this.room.player, room: nextRoom });
			this.active = false;

			// console.warn('TO NEXT ROOM');
		}
	}

	destroy(): void {
		this.sprite.destroy();
	}
}
