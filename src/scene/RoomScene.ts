import { Scene } from 'phaser';
import { vec2 } from 'gl-matrix';

import Room from '../Room';
import Player from '../Player';
import DungeonRoom from '../DungeonRoom';
import { CardTypes, generateCards } from '../card/Card';

interface RoomData {
	room: DungeonRoom;
	player?: Player;
}

export default class RoomScene extends Scene {
	constructor() { super('room'); }

	room: Room = null as any;

	// private pauseEvent: ((evt: KeyboardEvent) => void) | null = null;

	init(data: RoomData) {
		const hasPlayer = !!data.player;
		const player = data.player ?? new Player(this, vec2.create());
		this.room = new Room(this, data.room, player);
		player.setRoom(this.room);
		player.setPosition(vec2.fromValues(data.room.start[0] * 16, data.room.start[1] * 16));
		if (!hasPlayer) generateCards(50).forEach(c => player.addCard(c));
	}

	create() {
		this.cameras.main.setZoom(4);

		// this.pauseEvent = (evt: KeyboardEvent) => {
		// 	if (evt.key === 'Escape') {
		// 		this.paused = !this.paused;
		// 		if (this.paused) {
		// 			pauseTimeouts();
		// 			this.scene.pause();
		// 		}
		// 		else {
		// 			resumeTimeouts();
		// 			this.scene.resume();
		// 		}
		// 	}
		// };

		// document.addEventListener('keydown', this.pauseEvent);

		// this.player.addDice({ sides: 6, modifier: null, durability: 3 });
		// this.player.addDice({ sides: 20, modifier: 'cursed', durability: 3 });
		this.room.player.addDice({ sides: 16, modifier: 'weighted', durability: 3 });
		// this.player.addDice({ sides: 20, modifier: null, durability: 3 });

		this.cameras.main.startFollow(this.room.player.sprite, true, 1, 1);
	}

	update() {
		this.room?.update(0.016);
	}

	stop() {
		// console.log('destroying the scene!!!');
		// document.removeEventListener('keydown', this.pauseEvent!);
	}
}
