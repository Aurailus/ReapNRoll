import { vec2 }	from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';

export interface Props {
	in?: string;
	delay?: number;
	out: string;
}

export default class Timer extends Entity<Props> {
	timeout: number = 0;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);

		if (data.in) {
			this.room.event.bind(data.in, () => {
				this.timeout = setTimeout(() => {
					this.room.event.emit(data.out);
				}, data.delay || 0) as any as number;
			});
		}
		else {
			this.timeout = setTimeout(() => {
				this.room.event.emit(data.out);
			}, data.delay || 0) as any as number;
		}
	}

	destroy() {
		if (this.timeout) clearTimeout(this.timeout);
	}
}
