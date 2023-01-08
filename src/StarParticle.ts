import { vec2 } from 'gl-matrix';
import { GameObjects, Scene } from 'phaser';

export default class StarParticle extends GameObjects.Sprite {
	constructor(scene: Scene, pos: vec2, color: string) {
		super(scene, pos[0] * 16 + Math.random() * 8 - 4, pos[1] * 16 + Math.random() * 8 - 4,
			'star_' + color, Math.floor(Math.random() * 4));

		this.setOrigin(0.5, 0.5);

		this.setAlpha(0.2);
		this.scene.time.addEvent({ callback: () => this.setAlpha(0.4), delay: 200 });
		this.scene.time.addEvent({ callback: () => this.setAlpha(0.6), delay: 500 });
		this.scene.time.addEvent({ callback: () => this.setAlpha(1), delay: 7000 });
		this.scene.time.addEvent({ callback: () => this.setAlpha(0.6), delay: 1500 });
		this.scene.time.addEvent({ callback: () => this.setAlpha(0.4), delay: 1800 });
		this.scene.time.addEvent({ callback: () => this.setAlpha(0.2), delay: 2000 });
		this.scene.time.addEvent({ callback: () => this.destroy(), delay: 2200 });
	}
}
