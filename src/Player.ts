import { vec2, vec4 } from 'gl-matrix';
import { GameObjects, Input } from 'phaser';

import DungeonRoom from './DungeonRoom';
import { collides, intersects } from './Collides';
import Enemy, { ENEMIES } from './entities/Enemy';
import { canExecuteCard, Card, executeCard } from './card/Card';
import { Dice, rollDice } from './Dice';
import { renderCards, renderCurrency, renderDiceChooser, renderHealth } from './CardRenderer';

import cursor_normal from '../res/cursor_normal_scaled.png';
import cursor_spell from '../res/cursor_spell_scaled.png';
import Room from './Room';
import StatusText from './StatusText';
import { clamp } from './Util';

export default class Player {
	sprite: GameObjects.Sprite = null as any;

	vel: vec2 = [ 0, 0 ];
	pos: vec2 = [ 0, 0 ];
	size: vec2 = [ 14, 14 ];

	private health: number = 20;
	private maxHealth: number = 20;

	private clicked = false;
	private charged = false;
	private rightClicked = false;

	private invincibilityTime: number = 0;
	private noControlTime: number = 0;
	private dodgeCooldown: number = 0;
	private attackCooldown: number = 0;
	private dodgeTime: number = 0;
	private dodgeHit: Enemy[] = [];

	private room: Room = null as any;

	cards: Card[] = [];
	dice:  Dice[] = [];
	private currency = 1000;
	private defaultDice: Dice = { sides: 12, modifier: null, durability: null };
	private activeCard: number | null = null;

	private keys: {
		left: Input.Keyboard.Key;
		right: Input.Keyboard.Key;
		up: Input.Keyboard.Key;
		down: Input.Keyboard.Key;
	} = {} as any;

	constructor(private scene: Phaser.Scene, pos: vec2) {
		this.pos = pos;

		this.scene.input.mouse.disableContextMenu();

		this.updateHealth();
		renderCurrency(this.currency);
	}

	setRoom(room: Room) {
		this.sprite = this.scene.add.sprite(this.pos[0], this.pos[1], 'player').setDepth(10);

		this.sprite.anims.create({ key: 'idle', repeat: -1, frameRate: 6, frames: [ { key: 'reaper', frame: 0 } ] });
		this.sprite.anims.create({ key: 'walk', repeat: -1, frameRate: 9, frames: [ { key: 'reaper', frame: 0 }, { key: 'reaper', frame: 1 }, { key: 'reaper', frame: 2 }, { key: 'reaper', frame: 3 } ] });
		this.sprite.anims.create({ key: 'attack', repeat: 0, frameRate: 9, frames: [ { key: 'reaper', frame: 4 }, { key: 'reaper', frame: 5 }, { key: 'reaper', frame: 6 },  { key: 'reaper', frame: 7 } ] });

		this.room = room;
		this.room.scene.add.existing(this.sprite);

		const dvorak = window.localStorage.getItem('dvorak') !== null;

		this.keys = {
			left: this.scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.A),
			right: this.scene.input.keyboard.addKey(dvorak ? Input.Keyboard.KeyCodes.E : Input.Keyboard.KeyCodes.D),
			up: this.scene.input.keyboard.addKey(dvorak ? Input.Keyboard.KeyCodes.COMMA : Input.Keyboard.KeyCodes.W),
			down: this.scene.input.keyboard.addKey(dvorak ? Input.Keyboard.KeyCodes.O : Input.Keyboard.KeyCodes.S),
		}

		this.scene.input.keyboard.on('keydown', (evt: KeyboardEvent) => {
			const num = Number.parseInt(evt.key, 10);
			if (isNaN(num)) return;
			if (this.activeCard === null || num - 1 !== this.activeCard) {
				if (num > this.cards.length) return;
				this.activeCard = num - 1;
			}
			else this.activeCard = null;
			this.updateCards();
		});

		this.scene.input.on('pointerdown', (evt: MouseEvent) => {
			if (evt.button === 0 && this.attackCooldown === 0) {
				this.clicked = true;
				if (this.activeCard === null) {
					const evt = this.room.scene.time.addEvent({ delay: 350, callback: () => this.charged = true });
					this.scene.input.once('pointerup', () => this.room.scene.time.removeEvent(evt));
				}
			}
			else if (evt.button === 2 && this.dodgeCooldown === 0) {
				this.rightClicked = true;
			}
		});
	}

	update(delta: number) {
		const speed = 2;
		const friction = 0.3;

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

		this.dodgeCooldown = Math.max(this.dodgeCooldown - delta, 0);
		this.attackCooldown = Math.max(this.attackCooldown - delta, 0);
		this.dodgeTime = Math.max(this.dodgeTime - delta, 0);

		const scaledFriction = clamp(friction * (delta * 60), 0, 1)

		if (Math.abs(newVel[0]) + Math.abs(newVel[1]) > 0) {
			if (this.sprite.anims.currentAnim?.key === 'idle' || !this.sprite.anims.isPlaying)
				this.sprite.anims.play('walk');
		}
		else {
			if (this.sprite.anims.currentAnim?.key === 'walk' || !this.sprite.anims.isPlaying)
				this.sprite.anims.play('idle');
		}

		if (newVel[0] > 0) {
			this.sprite.scaleX = -1;
		}
		else if (newVel[0] < 0) {
			this.sprite.scaleX = 1;
		}

		vec2.scale(newVel, vec2.normalize(newVel, newVel), speed);
		vec2.add(this.vel, vec2.scale(this.vel, this.vel, 1-scaledFriction), vec2.scale(newVel, newVel, (scaledFriction)));

		let currentBounds = vec4.fromValues(this.pos[0] - this.size[0] / 2, this.pos[1] - this.size[1] / 2,
			this.pos[0] + this.size[0] /2, this.pos[1] + this.size[1] / 2);

		let totalVel = this.vel[0] * delta * (60/1);
		while (Math.abs(totalVel) > 0) {
			let offsetX = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(offsetX, 0, offsetX, 0)), this.room.data)) {
				this.setPosition(vec2.fromValues(this.pos[0] + offsetX, this.pos[1]));
				currentBounds = vec4.fromValues(this.pos[0] - this.size[0] / 2, this.pos[1] - this.size[1] / 2,
					this.pos[0] + this.size[0] /2, this.pos[1] + this.size[1] / 2);
			}
			totalVel = Math.sign(totalVel) * Math.max(Math.abs(totalVel) - 1, 0);
		}

		totalVel = this.vel[1] * delta * (60/1);
		while (Math.abs(totalVel) > 0) {
			let offsetY = Math.sign(totalVel) * Math.min(Math.abs(totalVel), 1);
			if (!collides(vec4.add(vec4.create(), currentBounds, vec4.fromValues(0, offsetY, 0, offsetY)), this.room.data)) {
				this.setPosition(vec2.fromValues(this.pos[0], this.pos[1] + offsetY));
				currentBounds = vec4.fromValues(this.pos[0] - this.size[0] / 2, this.pos[1] - this.size[1] / 2,
					this.pos[0] + this.size[0] /2, this.pos[1] + this.size[1] / 2);
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

		if (this.clicked) {
			this.clicked = false;
			if (this.activeCard === null) this.handleAttack();
			else this.handleCast();
		}
		if (this.charged) {
			this.handleChargeAttack();
		}
		if (this.rightClicked && !this.noControlTime) {
			this.handleDodge();
		}

		if (this.dodgeTime > 0) {
			this.handleDodgeAttack();
		}
		else if (this.dodgeHit.length) {
			this.dodgeHit = [];
		}
	}

	private handleAttack() {
		const { x: mouseX, y: mouseY } = this.scene.input.mousePointer
		.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
		const mousePos = vec2.fromValues(mouseX, mouseY);
		const diff = vec2.sub(vec2.create(), mousePos,
		vec2.add(vec2.create(), this.pos, vec2.scale(vec2.create(), this.size, 0.5)));
		this.sprite.anims.setProgress(0);
		this.sprite.anims.play('attack');

		const angle = Math.atan2(diff[1], diff[0]);
		const variance = Math.PI / 2;
		const steps = 6;
		const distance = 28;
		const radius = 8;

		this.scene.sound.play('attack', { volume: 0.5 });

		this.attackCooldown = 0.2;

		this.sprite.setFrame(1);
		this.scene.time.addEvent({ delay: 100, callback: () => this.sprite.setFrame(0) });

		for (let i = 0; i < steps; i++) {
			const thisAngle = angle + (variance * ((i - steps / 2) / steps));
			const originPos = vec2.fromValues(this.pos[0] + Math.cos(thisAngle) * distance,
				this.pos[1] + Math.sin(thisAngle) * distance);
			const bounds = vec4.fromValues(originPos[0] - radius, originPos[1] - radius,
				originPos[0] + radius, originPos[1] + radius);

			for (let enemy of ENEMIES) {
				if (!intersects(bounds, enemy.getBounds())) continue;
				const kb = vec2.fromValues(this.pos[0], this.pos[1]);
				vec2.sub(kb, enemy.pos, kb);
				vec2.normalize(kb, kb);
				vec2.scale(kb, kb, 7);
				enemy.damage(10, kb);
			}
		}
	}

	private async handleCast(force = false) {
		const { x: mouseX, y: mouseY } = this.scene.input.mousePointer
		.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
		const target = vec2.fromValues(mouseX, mouseY);
		const card = this.cards[this.activeCard!];

		const ctx = { room: this.room, target };
		if (!force && !canExecuteCard(card, ctx)) return;

		document.getElementById('card-shelf')?.remove();
		document.getElementsByTagName('canvas')[0]!.classList.add('spellcasting');
		this.scene.scene.pause();

		let oldDice = JSON.parse(JSON.stringify(this.dice));
		let rollValues: number[] = [];

		let promise: Promise<void>;

		try {
			for (let i = 0; i < card.type.rolls.length; i++) {
				if (card.modifier === 'wild') {
					await new Promise<void>(resolve => {
						let roll = Math.floor(Math.random() * 20);
						rollValues.push(roll);

						const rollText = document.createElement('h1');
						rollText.innerText = roll.toString();
						rollText.classList.add('roll-text');
						document.body.appendChild(rollText);

						setTimeout(() => {
							rollText.remove();
							resolve();
						}, 200);
					});
				}
				else {
					await new Promise<void>((resolve, reject) => {
						renderDiceChooser(this.defaultDice, this.dice, card.type.name, (index) => {
							let die = index === -1 ? this.defaultDice : this.dice[index];
							let value = rollDice(die);
							this.scene.sound.play('roll');
							rollValues.push(value);
							if (die.durability) die.durability--;
							if (die.durability === 0) this.dice.splice(index, 1);
							document.getElementById('dice-chooser')?.remove();

							const rollText = document.createElement('h1');
							rollText.innerText = value.toString();
							rollText.classList.add('roll-text');
							document.body.appendChild(rollText);

							setTimeout(() => {
								rollText.remove();
								resolve();
							}, 500);
						}, () => {
							if (force) resolve();
							else reject();
						});
					});
				}
			}

			if (card.modifier === 'preserved') {
				card.modifier = null;
				this.activeCard = null;
			}
			else {
				this.cards.splice(this.activeCard!, 1);
				this.activeCard = null;
			}


			promise = new Promise(resolve => {
				setTimeout(() => {
					let res = executeCard(card, rollValues, ctx)

					if (card.modifier === 'binding') {
						this.noControlTime = 1;
					}
					else if (card.modifier === 'ravenous') {
						this.damage(2, vec2.create(), true);
					}
					else if (card.modifier === 'vampiric') {
						const healAmount = Math.floor(res.damage / 20);
						if (healAmount) this.heal(healAmount);
					}
					this.sprite.anims.setProgress(0);
					this.scene.sound.play('cast');

					resolve();
				}, 200);
			})
		}
		catch (_) {
			this.dice = oldDice;

			promise = new Promise(res => res());
		}

		this.updateCards();
		setTimeout(() => this.scene.scene.resume(), 200);
		document.getElementById('dice-chooser')?.remove();
		document.getElementsByTagName('canvas')[0]!.classList.remove('spellcasting');

		await promise;
	}

	private handleChargeAttack() {
		this.charged = false;
		this.attackCooldown = 0.5;
		const radius = 2.5 * 16;

		this.sprite.anims.setProgress(0);
		this.sprite.anims.play('attack');
		this.scene.sound.play('attack');
		this.sprite.setFrame(2);
		this.scene.time.addEvent({ delay: 100, callback: () => this.sprite.setFrame(0) });

		const circle = this.scene.add.circle(this.pos[0], this.pos[1],
		radius, 0xff0000, 0.3);
		this.scene.time.addEvent({ callback: () => circle.destroy(), delay: 100 });

		for (let enemy of ENEMIES) {
			if (vec2.dist(enemy.pos, this.pos) >= radius) continue;
			const kb = vec2.fromValues(this.pos[0], this.pos[1]);
			vec2.sub(kb, vec2.add(vec2.create(), enemy.pos, vec2.scale(vec2.create(), enemy.size, 0.5)), kb);
			vec2.normalize(kb, kb);
			vec2.scale(kb, kb, 15);
			enemy.damage(15, kb);
		}
	}

	giveInvincibility(time: number) {
		this.invincibilityTime = Math.max(time, this.invincibilityTime);
	}

	private handleDodge() {
		this.rightClicked = false;

		this.noControlTime = 0.1;
		this.dodgeCooldown = 0.5;
		this.dodgeTime = 0.2;
		this.invincibilityTime = 0.3;
		this.sprite.setFrame(3);
		this.scene.time.addEvent({ delay: 300, callback: () => this.sprite.setFrame(0) });
		this.sprite.anims.setProgress(0);
		this.sprite.anims.play('attack');
		this.scene.sound.play('boltfire');

		const { x: mouseX, y: mouseY } = this.scene.input.mousePointer
			.positionToCamera(this.scene.cameras.main) as Phaser.Math.Vector2;
		const mousePos = vec2.fromValues(mouseX, mouseY);
		const diff = vec2.sub(vec2.create(), mousePos, this.pos);
		vec2.normalize(diff, diff);
		vec2.scale(diff, diff, 20);
		this.sprite.scaleX = diff[0] < 0 ? 1 : -1;
		this.vel = diff;
	}

	private handleDodgeAttack() {
		const enemiesColliding = [...ENEMIES.values()]
			.filter(enemy => this.dodgeHit.indexOf(enemy) === -1 && intersects(enemy.getBounds(), this.getBounds()));

			if (enemiesColliding.length)
			this.scene.sound.play('attack', { volume: 0.5 });
		enemiesColliding.forEach(enemy => {
			this.dodgeHit.push(enemy);
			const kb = vec2.sub(vec2.create(), enemy.pos, this.pos);
			vec2.normalize(kb, kb);
			vec2.scale(kb, kb, 7);
			enemy.damage(5, kb);
		});
	}

	damage(amount: number, knockback: vec2 = vec2.create(), force: boolean = false) {
		if (this.invincibilityTime > 0 && !force) return;

		this.health = Math.max(this.health - amount, 0);
		this.vel = knockback;
		this.invincibilityTime = 0.5;
		this.noControlTime = 0.15;
		this.scene.sound.play('attack', { volume: 0.5, rate: 1.5 });

		this.updateHealth();

		if (this.health === 0) this.handleDeath();
	}

	heal(amount: number) {
		this.health = Math.min(this.health + amount, this.maxHealth);

		this.room.scene.add.existing(new StatusText(this.room.scene, vec2.fromValues(
			this.pos[0], this.pos[1] - 4), amount, '#16abff'));

		this.invincibilityTime = 0.2;
		this.updateHealth();
	}

	setPosition(pos: vec2) {
		this.sprite.setPosition(Math.round(pos[0]), Math.round(pos[1]));
		this.pos = pos;
	}

	private updateHealth() {
		renderHealth(this.health, this.maxHealth);
	}

	private async handleDeath() {
		let reviveCard = this.cards.filter(card => card.type.name === 'Revive')[0];

		while (reviveCard) {
			this.activeCard = this.cards.indexOf(reviveCard);
			await this.handleCast(true);
			if (this.health > 0) break;
			reviveCard = this.cards.filter(card => card.type.name === 'Revive')[0];
		}

		if (this.health > 0) return;

		this.scene.scene.start('death');
	}

	getBounds(): vec4 {
		return vec4.fromValues(this.pos[0] - this.size[0] / 2, this.pos[1] - this.size[1] / 2, this.pos[0] + this.size[0] / 2, this.pos[1] + this.size[1] / 2);
	}

	addCard(card: Card): boolean {
		if (this.cards.length >= 7) return false;
		this.cards.push(card);
		this.updateCards();
		return true;
	}

	addDice(die: Dice): boolean {
		if (this.dice.length >= 5) return false;
		this.dice.push(die);

		// this.updateDice();
		return true;
	}

	updateCards() {
		renderCards(this.cards, this.activeCard, (i) => {
			this.activeCard = (this.activeCard === i) ? null : i;
			this.updateCards();
		});

		document.body.style.cursor = this.activeCard !== null ?
			`url(${cursor_spell}) 26 26, auto` : `url(${cursor_normal}) 26 26, auto`;
	}

	getHealth() {
		return this.health;
	}

	getMaxHealth() {
		return this.maxHealth;
	}

	getCurrency() {
		return this.currency;
	}

	setCurrency(value: number) {
		this.currency = value;
		renderCurrency(this.currency);
	}
}

