import { vec2 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';
import SoulDrop from './SoulDrop';
import { Card, generateCards } from '../card/Card';
import { Dice, DiceModifiers, getDiceName } from '../Dice';
import { renderCardSelector, renderDiceChooser } from '../CardRenderer';

export interface Props {
	value: number;
}

export default class LootChest extends Entity<Props> {
	readonly type = 'loot_chest';

	private active = false;

	private size = vec2.fromValues(19, 15);
	private pos: vec2;
	private sprite: Phaser.GameObjects.Sprite;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);
		this.pos = vec2.scale(vec2.create(), pos, 16);
		this.sprite = this.room.scene.add.sprite(this.pos[0], this.pos[1], 'loot_chest').setOrigin(0);
		this.data.value ??= 100;
	}

	update() {
		if (this.active) return;

		const thisPos = vec2.add(vec2.create(), this.pos,
			vec2.scale(vec2.create(), this.size, 0.5));

		if (vec2.dist(this.room.player.pos, thisPos) < 16) {
			this.activate();
			this.active = true;
		}
	}

	async activate() {
		this.destroy();
		this.knockback();

		let lootType = Math.random() < 0.6 ? 'soul' : Math.random() < 0.7 ? 'dice' : 'card';

		switch (lootType) {
			case 'soul': {
				const amount = Math.round((0.8 + Math.random() * 0.4) * this.data.value / 3) * 100;
				for (let i = 0; i < amount; i += 100) this.room.entities.push(new SoulDrop(this.room, this.pos, {}));
				break;
			}
			case 'dice': {
				const dice: Dice = {
					sides: [ 6, 12, 16, 20 ][Math.floor(Math.random() * 4)],
					modifier: [...DiceModifiers, null, null ][Math.floor(Math.random() * (DiceModifiers.length + 2))],
					durability: Math.floor(Math.random() * 3) + 1
				}

				this.room.scene.scene.pause();
				document.getElementById('card-shelf')?.remove();
				document.getElementsByTagName('canvas')[0]!.classList.add('spellcasting');

				if (this.room.player.dice.length >= 5) {
					let discardChoice = -1;
					await new Promise<void>(resolve => {
						renderDiceChooser(dice, this.room.player.dice, 'New Dice! Choose one to Discard.',
							(ind) => {
								discardChoice = ind;
								resolve()
							}, () => resolve());
					});
					document.getElementById('dice-chooser')?.remove();
					if (discardChoice !== -1) this.room.player.dice[discardChoice]  = dice;
				}
				else {
					const diceText = document.createElement('h1');
					diceText.innerText = getDiceName(dice);
					diceText.classList.add('dice-text');
					document.body.appendChild(diceText);
					this.room.player.dice.push(dice);
					await new Promise<void>(resolve => setTimeout(() => resolve(), 300));
					diceText.remove();
				}

				this.room.scene.scene.resume();
				document.getElementsByTagName('canvas')[0]!.classList.remove('spellcasting');
				this.room.player.updateCards();

				break;
			}
			case 'card': {
				this.room.scene.scene.pause();
				document.getElementById('card-shelf')?.remove();
				document.getElementsByTagName('canvas')[0]!.classList.add('spellcasting');

				const newCards: Card[] = [generateCards(this.data.value)[1]];

				while (newCards.length + this.room.player.cards.length > 7) {
					let elem: HTMLElement;
					await new Promise<void>((resolve) => {
						elem = renderCardSelector(this.room.player.cards, newCards, (player: boolean, ind: number) => {
							if (player) this.room.player.cards.splice(ind, 1);
							else newCards.splice(ind, 1);
							resolve();
						});
					});
					elem!.remove();
				}

				newCards.forEach(card => this.room.player.addCard(card));
				this.room.scene.scene.resume();
				document.getElementsByTagName('canvas')[0]!.classList.remove('spellcasting');
				this.room.player.updateCards();

				break;
			}
		}
	}

	deactivate() {
		this.room.scene.time.addEvent({ callback: () => this.active = false });
		this.knockback();
	}

	knockback() {
		const height = Math.abs(this.room.player.pos[1] - this.pos[1] - 15) / 45;
		this.room.player.damage(0, vec2.fromValues(0, 7 + height * 25));
	}

	destroy() {
		this.sprite.destroy();
		this.room.destroyEntity(this);
	}
}
