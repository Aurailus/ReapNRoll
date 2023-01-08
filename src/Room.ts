import { vec2 } from 'gl-matrix';
import { GameObjects } from 'phaser';

import DungeonRoom from './DungeonRoom';
import Enemy from './entities/Enemy';
import Entity from './entities/Entity';
import Spike from './entities/Spike';
import Timer from './entities/Timer';
import EventEmitter from './EventEmitter';
import Player from './Player';
import StarParticle from './StarParticle';
import { roundTo, clamp } from './Util';

const TILE_TRANSFORMER = [ -1, 12, 10, 11, 2, 7, 13, 3, 0, 14, 5, 4, 1, 8, 9, 6 ];

const ENTITY_CONSTRUCTORS: Record<string, typeof Entity<any>> = {
		timer: Timer,
		spike: Spike,
		enemy: Enemy
}

export default class Room {
	private group: GameObjects.Group;
	readonly entities: Entity<any>[] = [];
	readonly event = new EventEmitter();
	private tileSprite: GameObjects.TileSprite;
	private tilemap: Phaser.Tilemaps.Tilemap;

	constructor(readonly scene: Phaser.Scene, readonly data: DungeonRoom, readonly player: Player) {
		this.group = this.scene.add.group();
		this.group.runChildUpdate = true;

		let tiles = [];
		for (let i = 1; i < this.data.size[1]; i++) {
			let tileRow = [];
			for (let j = 1; j < this.data.size[0]; j++) {

				let indexTopLeft = (i - 1) * this.data.size[0] + j - 1;
				let indexBottomLeft = i * this.data.size[0] + j - 1;
				let indexTopRight = indexTopLeft + 1;
				let indexBottomRight = indexBottomLeft + 1;

				let index =
					(this.data.solid[indexTopLeft] ? 1 : 0) +
					(this.data.solid[indexTopRight] ? 2 : 0) +
					(this.data.solid[indexBottomLeft] ? 4 : 0) +
					(this.data.solid[indexBottomRight] ? 8 : 0);

				tileRow.push(TILE_TRANSFORMER[index]);
			}
			tiles.push(tileRow);
		}

		this.tilemap = this.scene.make.tilemap({ data: tiles, tileWidth: 16, tileHeight: 16 });

		this.tileSprite = this.scene.add.tileSprite(0, 0,
			(this.scene.game.config.width as number / 4) + 48,
			(this.scene.game.config.height as number / 4) + 48, 'tile_ground').setOrigin(0);

		this.tilemap.addTilesetImage('tile_wall_dirt');
		let layer = this.tilemap.createLayer(0, 'tile_wall_dirt', -8, -8);
		this.group.add(layer, true);

		for (let entData of data.entities) {
			let entity = new (ENTITY_CONSTRUCTORS[entData.type] as any)(this, entData.pos, entData.data);
			this.entities.push(entity);
		}
	}

	update(delta: number) {
		for (let entity of this.entities) {
			entity.update(delta);
		}

		this.tileSprite.setPosition(
			roundTo(clamp(this.scene.cameras.main.scrollX + this.scene.cameras.main.width / 3 + 32,
				0, (this.data.size[0] - 1) * 16 - this.tileSprite.width), 32),
				roundTo(clamp(this.scene.cameras.main.scrollY + this.scene.cameras.main.height / 3 + 32,
				0, (this.data.size[1] - 2) * 16 - this.tileSprite.height), 32)
		);

		if (Math.random() > 0.4) {
			let randPos = vec2.fromValues(Math.floor(Math.random() * this.data.size[0]),
				Math.floor(Math.random() * this.data.size[1]));

			let tileIndex = this.tilemap.getTileAt(randPos[0], randPos[1])?.index;
			if (tileIndex === 6) {
				this.scene.add.existing(new StarParticle(this.scene, randPos));
			}
		}
	}

	destroyEntity(entity: Entity<any>) {
		this.entities.splice(this.entities.indexOf(entity), 1);
	}
}
