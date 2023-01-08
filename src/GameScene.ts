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
import enemy from '../res/enemy.png';
import magic_missile_projectile from '../res/magic_missile_projectile.png';

import Room from './Room';
import { Card, CardTypes } from './card/Card';
import DungeonRoom, { readRoomFromImage } from './DungeonRoom';
import { pauseTimeouts, resumeTimeouts } from './PauseableTimeout';

export default class GameScene extends Scene {
	player: Player = null as any;
	map: DungeonRoom = null as any;
	room: Room = null as any;
	paused: boolean = false;
	lastTime = 0;

	private pauseEvent: ((evt: KeyboardEvent) => void) | null = null;

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
	}

	create() {
		this.cameras.main.setZoom(4);

		this.pauseEvent = (evt: KeyboardEvent) => {
			if (evt.key === 'Escape') {
				this.paused = !this.paused;
				if (this.paused) {
					pauseTimeouts();
					this.scene.pause();
				}
				else {
					resumeTimeouts();
					this.scene.resume();
				}
			}
		};

		document.addEventListener('keydown', this.pauseEvent);

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
			{
				type: 'enemy',
				pos: [ 12, 8 ],
				data: {}
			},
			{
				type: 'enemy',
				pos: [ 12, 6 ],
				data: {}
			},
			{
				type: 'enemy',
				pos: [ 14, 8 ],
				data: {}
			},
			{
				type: 'enemy',
				pos: [ 12, 10 ],
				data: {}
			}
			)

			this.player = new Player(this, vec2.fromValues(12 * 16, 8 * 16));
			this.room = new Room(this, this.map, this.player);
			this.player.setRoom(this.room);

			// const beam: Card = { type: CardTypes.get('beam')!, modifier: null };
			// this.player.addCard(beam);

			const revive: Card = { type: CardTypes.get('revive')!, modifier: null };
		this.player.addCard(revive);

			const heal: Card = { type: CardTypes.get('heal')!, modifier: null };
			this.player.addCard(heal);
			this.player.addCard({ ...heal });

			const fireball: Card = { type: CardTypes.get('fireball')!, modifier: null };
			this.player.addCard(fireball);

			const fireball2: Card = { type: CardTypes.get('fireball')!, modifier: 'crude' };
			this.player.addCard(fireball2);

			const fireball3: Card = { type: CardTypes.get('fireball')!, modifier: 'refined' };
			this.player.addCard(fireball3);

			// const magic_missile: Card = { type: CardTypes.get('magic_missile')!, modifier: null };
			// this.player.addCard(magic_missile);

			// const blink: Card = { type: CardTypes.get('blink')!, modifier: null };
			// this.player.addCard(blink);

			this.player.addDice({ sides: 6, modifier: null, durability: 3 });
			this.player.addDice({ sides: 20, modifier: 'cursed', durability: 3 });
			this.player.addDice({ sides: 16, modifier: 'weighted', durability: 3 });
			this.player.addDice({ sides: 20, modifier: null, durability: 3 });

			this.cameras.main.startFollow(this.player.sprite, true, 1, 1);

			console.log('go');
		});
	}

	update() {
		this.player?.update(0.016);
		this.room?.update(0.016);
	}

	destroy() {
		document.removeEventListener('keydown', this.pauseEvent!);
	}
}
