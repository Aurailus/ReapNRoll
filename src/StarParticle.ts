import { vec2 } from 'gl-matrix';
import { GameObjects, Scene } from 'phaser';

export default class StarParticle extends GameObjects.Sprite {
	constructor(scene: Scene, pos: vec2) {
		super(scene, pos[0] * 16 + Math.random() * 8 - 4, pos[1] * 16 + Math.random() * 8 - 4,
			'star_particle', Math.floor(Math.random() * 4));

		this.setOrigin(0.5, 0.5);

		this.setAlpha(0.2);
		setTimeout(() => this.setAlpha(0.4), 200);
		setTimeout(() => this.setAlpha(0.6), 500);
		setTimeout(() => this.setAlpha(1), 7000);
		setTimeout(() => this.setAlpha(0.6), 1500);
		setTimeout(() => this.setAlpha(0.4), 1800);
		setTimeout(() => this.setAlpha(0.2), 2000);
		setTimeout(() => this.destroy(), 2200);
	}
}
