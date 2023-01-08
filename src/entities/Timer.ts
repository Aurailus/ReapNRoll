import { vec2 }	from 'gl-matrix';
import setPausableTimeout from '../PauseableTimeout';

import Room from '../Room';
import Entity from './Entity';

export interface Props {
	in?: string;
	delay?: number;
	out: string;
}

export default class Timer extends Entity<Props> {
	readonly type = 'timer';

	timeout: ReturnType<typeof setPausableTimeout> | null = null;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);

		if (data.in) {
			this.room.event.bind(data.in, () => {
				if (this.timeout) return;
				this.timeout = setPausableTimeout(() => {
					this.room.event.emit(data.out);
				}, data.delay || 0);
			});
		}
		else {
			this.timeout = setPausableTimeout(() => {
				this.room.event.emit(data.out);
			}, data.delay || 0);
		}
	}

	destroy() {
		this.timeout?.kill();
	}
}
