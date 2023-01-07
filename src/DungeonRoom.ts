import { vec2 } from 'gl-matrix';

interface Entity {
	type: string;
	pos: vec2;
	data: Record<string, any>;
}

export default interface DungeonRoom {
	size: vec2;
	solid: number[];
	entities: Entity[];
}

export async function readRoomFromImage(src: string): Promise<DungeonRoom> {
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
	let width = right - left + 3;
	let height = bottom - top + 3;

	for (let j = top - 1; j <= bottom + 1; j++) {
		for (let i = left - 1; i <= right + 1; i++) {
			let color = imageData[(j * img.width + i) * 4];
			mapData.push(color > 0 ? 0 : 1);
		}
	}

	return {
		solid: mapData,
		size: [ width, height ],
		entities: []
	};
}
