import { Scene } from 'phaser';

import reaper from '../../res/reaper.png';
import spike_off from '../../res/spike_off.png';
import spike_on from '../../res/spike_on.png';
import health_full from '../../res/health_full.png';
import health_empty from '../../res/health_empty.png';
import melee from '../../res/melee.png';
import ranged from '../../res/ranged.png';
import magic_missile_projectile from '../../res/magic_missile_projectile.png';
import start_portal from '../../res/start_portal.png';
import end_portal from '../../res/end_portal.png';
import soul from '../../res/soul.png';
import loot_chest from '../../res/loot_chest.png';

import tile_blue from '../../res/tile_blue.png';
import star_blue from '../../res/star_blue.png';
import ground_blue from '../../res/ground_blue.png';

import tile_purple from '../../res/tile_purple.png';
import star_purple from '../../res/star_purple.png';
import ground_purple from '../../res/ground_purple.png';

import tile_red from '../../res/tile_red.png';
import star_red from '../../res/star_red.png';
import ground_red from '../../res/ground_red.png';

import tile_orange from '../../res/tile_orange.png';
import star_orange from '../../res/star_orange.png';
import ground_orange from '../../res/ground_orange.png';

import tile_yellow from '../../res/tile_yellow.png';
import star_yellow from '../../res/star_yellow.png';
import ground_yellow from '../../res/ground_yellow.png';

import tile_green from '../../res/tile_green.png';
import star_green from '../../res/star_green.png';
import ground_green from '../../res/ground_green.png';

import tile_teal from '../../res/tile_teal.png';
import star_teal from '../../res/star_teal.png';
import ground_teal from '../../res/ground_teal.png';

import dungeon_1 from '../../res/dungeon_1.png';
import dungeon_2 from '../../res/dungeon_2.png';
import dungeon_3 from '../../res/dungeon_3.png';
import dungeon_4 from '../../res/dungeon_4.png';
import dungeon_5 from '../../res/dungeon_5.png';
import room_souls from '../../res/room_souls.png';

import DungeonRoom, { readRoomFromImage, Entity } from '../DungeonRoom';

export let ROOM_SOULS: DungeonRoom = null as any;
export const ROOMS: DungeonRoom[] = [];
export const MAP_COLORS = [ 'blue', 'purple', 'red', 'orange', 'yellow', 'green', 'teal' ];

export default class LoadScene extends Scene {
	constructor() { super('load'); }

	preload() {
		this.load.image('tile_blue', tile_blue);
		this.load.image('ground_blue', ground_blue);
		this.load.spritesheet('star_blue', star_blue, { frameWidth: 16, frameHeight: 16 });

		this.load.image('tile_purple', tile_purple);
		this.load.image('ground_purple', ground_purple);
		this.load.spritesheet('star_purple', star_purple, { frameWidth: 16, frameHeight: 16 });

		this.load.image('tile_red', tile_red);
		this.load.image('ground_red', ground_red);
		this.load.spritesheet('star_red', star_red, { frameWidth: 16, frameHeight: 16 });

		this.load.image('tile_orange', tile_orange);
		this.load.image('ground_orange', ground_orange);
		this.load.spritesheet('star_orange', star_orange, { frameWidth: 16, frameHeight: 16 });

		this.load.image('tile_yellow', tile_yellow);
		this.load.image('ground_yellow', ground_yellow);
		this.load.spritesheet('star_yellow', star_yellow, { frameWidth: 16, frameHeight: 16 });

		this.load.image('tile_green', tile_green);
		this.load.image('ground_green', ground_green);
		this.load.spritesheet('star_green', star_green, { frameWidth: 16, frameHeight: 16 });

		this.load.image('tile_teal', tile_teal);
		this.load.image('ground_teal', ground_teal);
		this.load.spritesheet('star_teal', star_teal, { frameWidth: 16, frameHeight: 16 });

		this.load.spritesheet('reaper', reaper, { frameWidth: 16, frameHeight: 16})
		this.load.spritesheet('melee', melee, { frameWidth: 16, frameHeight: 16})
		this.load.spritesheet('ranged', ranged, { frameWidth: 16, frameHeight: 16})
		this.load.image('spike_off', spike_off);
		this.load.image('spike_on', spike_on);
		this.load.image('health_full', health_full);
		this.load.image('health_empty', health_empty);
		this.load.image('magic_missile_projectile', magic_missile_projectile);
		this.load.image('start_portal', start_portal);
		this.load.image('end_portal', end_portal);
		this.load.image('soul', soul);
		this.load.image('loot_chest', loot_chest);
	}

	async create() {
		const objMap = new Map<number, Entity>([
			[ 0x1cff00, {
				type: 'melee_enemy',
				pos: [ 0, 0 ],
				data: {}
			} ],
			[ 0x00f3ff, {
				type: 'spike',
				pos: [ 0, 0 ],
				data: {
					activate: 'activate',
					deactivate: 'deactivate'
				},
			} ],
			[ 0xffc700, {
				type: 'ranged_enemy',
				pos: [ 0, 0 ],
				data: {
				}
			}], [ 0xfff09d, {
				type: 'card_drop_chest',
				pos: [ 0, 0 ],
				data: {
					value: 1,
					cost: 5000
				}
			}], [ 0xffd900, {
				type: 'card_drop_chest',
				pos: [ 0, 0 ],
				data: {
					value: 2,
					cost: 10000
				}
			}], [ 0xffa448, {
				type: 'card_drop_chest',
				pos: [ 0, 0 ],
				data: {
					value: 3,
					cost: 20000
				}
			}], [ 0xad5800, {
				type: 'loot_chest',
				pos: [ 0, 0 ],
				data: {}
			}]
		]);

		ROOM_SOULS = await readRoomFromImage(room_souls, objMap);

		ROOMS.push(...(await Promise.all([
			readRoomFromImage(dungeon_1, objMap),
			readRoomFromImage(dungeon_2, objMap),
			readRoomFromImage(dungeon_3, objMap),
			readRoomFromImage(dungeon_4, objMap),
			readRoomFromImage(dungeon_5, objMap)
		])));

		this.scene.start('room', { room: ROOMS[0] });
	}
}
