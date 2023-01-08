import { Scene } from 'phaser';

import player from '../../res/player.png';
import tile_wall_dirt from '../../res/tile_low.png';
import ground from '../../res/ground.png';
import spike_off from '../../res/spike_off.png';
import spike_on from '../../res/spike_on.png';
import health_full from '../../res/health_full.png';
import health_empty from '../../res/health_empty.png';
import star from '../../res/star.png';
import enemy from '../../res/enemy.png';
import magic_missile_projectile from '../../res/magic_missile_projectile.png';
import start_portal from '../../res/start_portal.png';
import end_portal from '../../res/end_portal.png';
import soul from '../../res/soul.png';
import loot_chest from '../../res/loot_chest.png';

import room_1 from '../../res/room_1.png';
import room_2 from '../../res/room_2.png';
import room_souls from '../../res/room_souls.png';

import DungeonRoom, { readRoomFromImage, Entity } from '../DungeonRoom';

export let ROOM_SOULS: DungeonRoom = null as any;
export const ROOMS: DungeonRoom[] = [];

export default class LoadScene extends Scene {
	constructor() { super('load'); }

	preload() {
		this.load.image('tile_wall_dirt', tile_wall_dirt);
		this.load.image('enemy', enemy);
		this.load.spritesheet('player', player, { frameWidth: 16, frameHeight: 16 });
		this.load.image('spike_off', spike_off);
		this.load.image('spike_on', spike_on);
		this.load.image('health_full', health_full);
		this.load.image('health_empty', health_empty);
		this.load.image('tile_ground', ground);
		this.load.spritesheet('star_particle', star, { frameWidth: 16, frameHeight: 16 });
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
				type: 'loot_chest',
				pos: [ 0, 0 ],
				data: {
					value: 1,
					cost: 5000
				}
			}], [ 0xffd900, {
				type: 'loot_chest',
				pos: [ 0, 0 ],
				data: {
					value: 2,
					cost: 10000
				}
			}], [ 0xffa448, {
				type: 'loot_chest',
				pos: [ 0, 0 ],
				data: {
					value: 3,
					cost: 20000
				}
			}]
		]);

		ROOM_SOULS = await readRoomFromImage(room_souls, objMap);

		ROOMS.push(...(await Promise.all([
			readRoomFromImage(room_1, objMap).then(room => {
				room.entities.push({
					type: 'timer',
					pos: [ 0, 0 ],
					data: {
						out: 'deactivate',
						delay: 1000
					}
				}, {
					type: 'timer',
					pos: [ 0, 0 ],
					data: {
						in: 'activate',
						out: 'deactivate',
						delay: 1000
					}
				}, {
					type: 'timer',
					pos: [ 0, 0 ],
					data: {
						in: 'deactivate',
						out: 'activate',
						delay: 1000
					}
				});
				return room;
			}),
			readRoomFromImage(room_2, objMap)
		])));

		this.scene.start('room', { room: ROOMS[0] });
	}
}
