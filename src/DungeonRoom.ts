import { vec2 } from 'gl-matrix';

export interface Entity {
	type: string;
	pos: vec2;
	data: Record<string, any>;
}

export default interface DungeonRoom {
	size: vec2;
	start: vec2,
	end: vec2,
	solid: number[];
	entities: Entity[];
}

export async function readRoomFromImage(src: string, map: Map<number, Entity>): Promise<DungeonRoom> {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d')!;

	const img = document.createElement('img');
	const ready = new Promise((res) => img.onload = res);
	img.src = src;

	await ready;

	canvas.width = img.width;
	canvas.height = img.height;
	ctx.drawImage(img, 0, 0);

	let { data: imageData } = ctx.getImageData(0, 0, img.width, img.height);

	let top = img.height, left = img.width, bottom = 0, right = 0;

	for (let i = 0; i < img.width; i++) {
		for (let j = 0; j < img.height; j++) {
			let color = imageData[(j * img.width + i) * 4];
			if (color > 0) {
				top = Math.min(top, j);
				left = Math.min(left, i);
				bottom = Math.max(bottom, j);
				right = Math.max(right, i);
			}
		}
	}

	let mapData: number[] = [];
	let width = right - left + 4;
	let height = bottom - top + 4;
	let start = vec2.create();
	let end = vec2.create();
	let entities: Entity[] = [];

	for (let j = top - 1; j <= bottom + 2; j++) {
		for (let i = left - 1; i <= right + 2; i++) {
			let coordinate = vec2.fromValues(i - left, j - top);

			const color = (imageData[(j * img.width + i) * 4] << 16) |
				(imageData[(j * img.width + i) * 4 + 1] << 8) |
				imageData[(j * img.width + i) * 4 + 2];

			let solid = color === 0x000000;
			mapData.push(solid ? 1 : 0);

			if (color === 0x0000ff) {
				start = coordinate;
			}
			else if (color === 0xff0000) {
				end = coordinate;
			}
			else if (map.has(color)) {
				entities.push({ ...JSON.parse(JSON.stringify(map.get(color)!)), pos: coordinate });
			}
			else if (color === 0xffffff || color === 0x000000) {}
			else {
				console.warn('Unknown color code', color);
			}
		}
	}

	return {
		solid: mapData,
		size: [ width, height ],
		start,
		end,
		entities
	};
}
