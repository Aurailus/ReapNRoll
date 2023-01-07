import { vec2, vec4 } from 'gl-matrix';
import { GameObjects, Input } from 'phaser';

import DungeonRoom from './DungeonRoom';
import { collides } from './Collides';

export default class Player {
	sprite: GameObjects.Sprite;

	vel: vec2 = [ 0, 0 ];
	pos: vec2 = [ 0, 0 ];
	size: vec2 = [ 14, 14 ];

	private health: number = 20;
	private maxHealth: number = 20;
	private healthElements: GameObjects.Sprite[] = [];

	private invincibilityTime: number = 0;
	private noControlTime: number = 0;

	private keys: {
		left: Input.Keyboard.Key;
		right: Input.Keyboard.Key;
		up: Input.Keyboard.Key;
		down: Input.Keyboard.Key;
	};

	constructor(private scene: Phaser.Scene, pos: vec2, private map: DungeonRoom, private hud: GameObjects.Container) {
		this.sprite = this.scene.add.sprite(pos[0], pos[1], 'player').setOrigin(0).setDepth(10);
		this.pos = pos;

		this.keys = {
			left: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
			right: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.E),
			up: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.COMMA),
			down: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.O)
		}

		this.updateHealth();
	}

	update(delta: number) {
		const speed = 2;
		const friction = 0.6;

		let newVel = vec2.create();

		if (this.noControlTime === 0) {
			if (this.scene.input.keyboard.checkDown(this.keys.right)) newVel[0] = 1;
			if (this.scene.input.keyboard.checkDown(this.keys.left)) newVel[0] = -1;
			if (this.scene.input.keyboard.checkDown(this.keys.up)) newVel[1] = -1;
			if (this.scene.input.keyboard.checkDown(this.keys.down)) newVel[1] = 1;
		}
		else {
			this.noControlTime = Math.max(this.noControlTime - delta, 0);
		}

		vec2.scale(newVel, vec2.normalize(newVel, newVel), speed);
		vec2.add(this.vel, vec2.scale(this.vel, this.vel, friction), vec2.scale(newVel, newVel, 1-friction));

		let currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
			this.pos[0] + this.size[0], this.pos[1] + this.size[1]);

		let totalVel = this.vel[0];
		while (Math.abs(totalVel) > 0) {
			let offsetX = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(offsetX, 0, offsetX, 0)), this.map)) {
				this.setPosition(vec2.fromValues(this.pos[0] + offsetX, this.pos[1]));
				currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
					this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		totalVel = this.vel[1];
		while (Math.abs(totalVel) > 0) {
			let offsetY = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(0, offsetY, 0, offsetY)), this.map)) {
				this.setPosition(vec2.fromValues(this.pos[0], this.pos[1] + offsetY));
				currentBounds = vec4.fromValues(this.pos[0], this.pos[1],
					this.pos[0] + this.size[0], this.pos[1] + this.size[1]);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		if (this.invincibilityTime > 0) {
			this.invincibilityTime = Math.max(this.invincibilityTime - delta, 0);
			this.sprite.setAlpha((Math.floor(this.invincibilityTime * 18) % 2) == 0 ? 1 : 0);
		}
		else {
			this.sprite.setAlpha(1);
		}
	}

	damage(amount: number, knockback: vec2 = vec2.create()) {
		if (this.invincibilityTime > 0) return;

		this.health -= amount;
		this.vel = knockback;
		this.invincibilityTime = 0.5;
		this.noControlTime = 0.15;

		this.updateHealth();
	}

	setPosition(pos: vec2) {
		this.sprite.setPosition(Math.round(pos[0]), Math.round(pos[1]));
		this.pos = pos;
	}

	updateHealth() {
		if (this.healthElements.length < this.maxHealth) {
			for (let i = this.healthElements.length; i < this.maxHealth; i++) {
				let elem = this.scene.add.sprite(16 * i, 0, 'health_filled').setOrigin(0);
				this.hud.add(elem);
				this.healthElements.push(elem);
			}
		}

		for (let i = 0; i < this.maxHealth; i++) {
			this.healthElements[i].setTexture(i < this.health ? 'health_full' : 'health_empty');
		}
	}

	getBounds(): vec4 {
		return vec4.fromValues(this.pos[0], this.pos[1], this.pos[0] + 14, this.pos[1] + 14);
	}
}

