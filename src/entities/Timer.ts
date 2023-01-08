import { vec2 }	from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';

export interface Props {
	in?: string;
	delay?: number;
	out: string;
}

export default class Timer extends Entity<Props> {
	readonly type = 'timer';

	event: Phaser.Time.TimerEvent | null = null;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);

		if (data.in) {
			this.room.event.bind(data.in, () => {
				if (this.event) return;
				this.event = this.room.scene.time.addEvent({ delay: data.delay ?? 0, callback: () => {
					this.room.event.emit(data.out);
				} });
			});
		}
		else {
			this.event = room.scene.time.addEvent({ callback: () => {
				this.room.event.emit(data.out);
			}, delay: data.delay || 0 });
		}
	}

	destroy() {
		if (this.event) this.room.scene.time.removeEvent(this.event);
	}
}
