import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';
import { intersects } from '../Collides';
import { renderCardSelector, renderChoice } from '../CardRenderer';
import { pauseTimeouts, resumeTimeouts } from '../PauseableTimeout';
import { Card, CardModifiers, CardModifierValues, CardTypes, generateCards } from '../card/Card';

export interface Props {
	value: number;
	cost: number;
}

let budgets = {
	1: 50,
	2: 150,
	3: 500
};

export default class LootChest extends Entity<Props> {
	readonly type = 'loot_chest';

	private active = false;

	private size = vec2.fromValues(19, 15);
	private pos: vec2;
	private sprite: Phaser.GameObjects.Sprite;
	private text: Phaser.GameObjects.Text;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);
		this.pos = vec2.scale(vec2.create(), pos, 16);

		this.sprite = this.room.scene.add.sprite(this.pos[0], this.pos[1], 'loot_chest').setOrigin(0);
		this.text = this.room.scene.add.text(this.pos[0] + this.sprite.width / 2, this.pos[1] - 8, data.cost.toString(), {
			fontFamily: 'sans-serif',
			fontSize: '24px',
			fontStyle: 'bold',
			color: this.room.player.getCurrency() >= this.data.cost ? 'white' : '#f0798f',
			stroke: this.room.player.getCurrency() >= this.data.cost ? '#16abff' : '#871f5a',
			strokeThickness: 4
		}).setScale(1/4).setOrigin(0.5, 0.5);
	}

	update() {
		if (this.active) return;

		const playerPos = vec2.add(vec2.create(), this.room.player.pos,
			vec2.scale(vec2.create(), this.room.player.size, 0.5));

		const thisPos = vec2.add(vec2.create(), this.pos,
			vec2.scale(vec2.create(), this.size, 0.5));

		if (vec2.dist(playerPos, thisPos) < 16) {
			if (this.room.player.getCurrency() >= this.data.cost) {
				this.activate();
				this.active = true;
			}
			else {
				this.knockback();
			}
		}
	}

	activate() {
		const valueString = this.data.value === 1 ? 'Common' : this.data.value === 2 ? 'Rare' : 'Mythic';
		renderChoice(`Manifest ${valueString} Booster Pack?`,
			`Exchange ${this.data.cost} souls for a ${valueString} Booster Pack. Contains 3 random cards.`,
			'Exchange', 'Cancel', async (primary) => {

			if (primary) {
				this.room.player.setCurrency(this.room.player.getCurrency() - this.data.cost);
				this.room.entities.filter(e => e.type === 'loot_chest').forEach(e => e.destroy());

				const newCards: Card[] = generateCards(budgets[this.data.value as keyof typeof budgets]);
				document.querySelector('.choice-container')?.remove();

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

				newCards.forEach(card =>this.room.player.addCard(card));
				this.deactivate();
			}
			else {
				this.room.player.updateCards();
				this.deactivate();
			}
		});

		pauseTimeouts();
		this.room.scene.scene.pause();
		document.getElementById('card-shelf')?.remove();
		document.getElementsByTagName('canvas')[0]!.classList.add('spellcasting');
	}

	deactivate() {
		resumeTimeouts();
		this.room.scene.scene.resume();
		document.getElementsByTagName('canvas')[0]!.classList.remove('spellcasting');
		document.querySelector('.choice-container')?.remove();

		setTimeout(() => this.active = false, 300);
		this.knockback();
	}

	knockback() {
		const height = Math.abs(this.room.player.pos[1] - this.pos[1] - 15) / 45;
		this.room.player.damage(0, vec2.fromValues(0, 7 + height * 25));
	}

	destroy() {
		this.text.destroy();
		this.sprite.destroy();
		this.room.destroyEntity(this);
	}
}
