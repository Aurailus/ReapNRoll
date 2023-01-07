import { vec4 }	from 'gl-matrix';
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

export function intersects(a: vec4, b: vec4) {
	return a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
}
