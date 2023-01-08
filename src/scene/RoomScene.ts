import { Scene } from 'phaser';
import { vec2 } from 'gl-matrix';

import Room from '../Room';
import Player from '../Player';
import DungeonRoom from '../DungeonRoom';
import { generateCards } from '../card/Card';

interface RoomData {
	room: DungeonRoom;
	player?: Player;
}

export default class RoomScene extends Scene {
	constructor() { super('room'); }

	room: Room = null as any;
	private lastTime = performance.now();
	private lastDelta = 0;

	init(data: RoomData) {
		const hasPlayer = !!data.player;
		const player = data.player ?? new Player(this, vec2.create());
		this.room = new Room(this, data.room, player);
		player.setRoom(this.room);
		player.setPosition(vec2.fromValues(data.room.start[0] * 16 + 8, data.room.start[1] * 16 + 8));
		if (!hasPlayer) generateCards(50).forEach(c => player.addCard(c));
	}

	create() {
		this.cameras.main.setZoom(4);
		this.cameras.main.startFollow(this.room.player.sprite, true, 1, 1);
	}

	update(time: number) {
		let delta = (time - this.lastTime) / 1000;
		if (delta > 1/30) {
			console.warn('delta too large: ' + delta);
			this.lastTime = time;
			delta = this.lastDelta;
		}
		this.room?.update(delta);
		this.lastTime = time;
		this.lastDelta = delta;
	}
}
