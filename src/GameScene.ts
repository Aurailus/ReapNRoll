import { Scene } from 'phaser';
import { vec2 } from 'gl-matrix';

import Player from './Player';

import player from '../res/player.png';
import tile_wall_dirt from '../res/tile_low.png';
import ground from '../res/ground.png';
import map_img from '../res/map.png';
import spike_off from '../res/spike_off.png';
import spike_on from '../res/spike_on.png';
import health_full from '../res/health_full.png';
import health_empty from '../res/health_empty.png';
import star from '../res/star.png';

import DungeonRoom, { readRoomFromImage } from './DungeonRoom';
import Room from './Room';
import getPath from './AStar';

export default class GameScene extends Scene {
	player: Player = null as any;
	map: DungeonRoom = null as any;
	room: Room = null as any;
	lastTime = 0;

	preload() {
		this.load.image('tile_wall_dirt', tile_wall_dirt);
		this.load.image('player', player);
		this.load.image('spike_off', spike_off);
		this.load.image('spike_on', spike_on);
		this.load.image('health_full', health_full);
		this.load.image('health_empty', health_empty);
		this.load.image('tile_ground', ground);
		this.load.spritesheet('star_particle', star, { frameWidth: 16, frameHeight: 16 });

	}

	create() {
		this.cameras.main.setZoom(4);
		let hudCamera = this.cameras.add(0, 0, undefined, undefined, false, 'hud');
		hudCamera.setScroll(-10000, 0);

		readRoomFromImage(map_img).then(mapData => {
			this.map = mapData;

			this.map.entities.push({
				type: 'timer',
				pos: [ 4, 4 ],
				data: {
					out: 'a'
				}
			}, {
				type: 'timer',
				pos: [ 4, 4 ],
				data: {
					in: 'a',
					delay: 1000,
					out: 'b'
				}
			}, {
				type: 'timer',
				pos: [ 4, 4 ],
				data: {
					in: 'b',
					delay: 1000,
					out: 'a'
				}
			}, {
				type: 'spike',
				pos: [ 6, 3 ],
				data: {
					activate: 'a',
					deactivate: 'b'
				}
			}, {
				type: 'spike',
				pos: [ 6, 2 ],
				data: {
					activate: 'a',
					deactivate: 'b'
				}
			}, {
				type: 'spike',
				pos: [ 6, 1 ],
				data: {
					activate: 'a',
					deactivate: 'b'
				}
			},
			// {
			// 	type: 'enemy',
			// 	pos: [ 12, 8 ],
			// 	data: {}
			// }
			)

			let hud = this.add.container(0, 0).setScrollFactor(0).setScale(4);
			this.player = new Player(this, vec2.fromValues(12 * 16, 8 * 16), this.map, hud)

			this.room = new Room(this, this.map, this.player);

			this.cameras.main.startFollow(this.player.sprite, true, 1, 1);

			// console.log(getPath([ 8, 4 ], [ 2, 2 ], this.map));

			// this.add.sprite(-10000, 0, 'health_full').setOrigin(0, 0);
			// this.add.sprite(0, 0, 'health_full').setOrigin(0, 0).setScrollFactor(0);

			console.log('go');
		});

		// setTimeout(() => {
		// 	this.player.damage(1);
		// }, 1000);
	}

	update() {
		this.player?.update(0.016);
		this.room?.update(0.016);
	}
}
