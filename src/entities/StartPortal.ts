import { vec2 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';

export default class StartPortal extends Entity<{}> {
	readonly type = 'start_portal';

	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: {}) {
		super(room, pos, data);

		this.sprite = this.room.scene.add.sprite(pos[0] * 16 - 8, pos[1] * 16 - 8, 'start_portal').setOrigin(0, 0);
	}

	destroy(): void {
		this.sprite.destroy();
	}
}
