import { vec2, vec4 }	from 'gl-matrix';
import DungeonRoom from './DungeonRoom';

const TILE_SIZE = 16;

export function collides(bounds: vec4, map: DungeonRoom): boolean {
	const left = Math.floor(bounds[0] / TILE_SIZE);
	const top = Math.floor(bounds[1] / TILE_SIZE);
	const right = Math.ceil(bounds[2] / TILE_SIZE);
	const bottom = Math.ceil(bounds[3] / TILE_SIZE);

	for (let i = top; i < bottom; i++) {
		for (let j = left; j < right; j++) {
			if (map.solid[(i + 1) * map.size[0] + (j + 1)]) return true;
		}
	}

	return false;
}

export function rayCollides(start: vec2, end: vec2, map: DungeonRoom): boolean {
	let max = vec2.dist(start, end) * 10;
	for (let i = 0; i < max; i++) {
		let checkPos = vec2.add(vec2.create(), start, vec2.scale(vec2.create(),
			vec2.sub(vec2.create(), end, start), i / max));
		let tileCheckPos = vec2.round(vec2.create(), vec2.scale(vec2.create(), checkPos, 1 / TILE_SIZE));
		if (map.solid[(tileCheckPos[1] + 1) * map.size[0] + (tileCheckPos[0] + 1)]) return true;
	}
	return false;
}

export function intersects(a: vec4, b: vec4) {
	return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}
