import { vec2 } from 'gl-matrix';

import Room from '../Room';

export default class Entity<DataType> {
	constructor(protected room: Room, protected tilePos: vec2, protected data: DataType) {}

	update(delta: number): void {};

	destroy(): void {};
}
