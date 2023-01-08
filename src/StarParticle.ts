import { vec2 } from 'gl-matrix';
import { GameObjects, Scene } from 'phaser';
import setPausableTimeout from './PauseableTimeout';

export default class StarParticle extends GameObjects.Sprite {
	constructor(scene: Scene, pos: vec2, color: string) {
		super(scene, pos[0] * 16 + Math.random() * 8 - 4, pos[1] * 16 + Math.random() * 8 - 4,
			'star_' + color, Math.floor(Math.random() * 4));

		this.setOrigin(0.5, 0.5);

		this.setAlpha(0.2);
		setPausableTimeout(() => this.setAlpha(0.4), 200);
		setPausableTimeout(() => this.setAlpha(0.6), 500);
		setPausableTimeout(() => this.setAlpha(1), 7000);
		setPausableTimeout(() => this.setAlpha(0.6), 1500);
		setPausableTimeout(() => this.setAlpha(0.4), 1800);
		setPausableTimeout(() => this.setAlpha(0.2), 2000);
		setPausableTimeout(() => this.destroy(), 2200);
	}
}
