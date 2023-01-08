import { vec2 } from 'gl-matrix';
import { GameObjects, Scene } from 'phaser';

export default class StatusText extends GameObjects.Text {
	constructor(scene: Scene, pos: vec2, damage: number, color = 'red') {

		super(scene, pos[0], pos[1], damage.toString(), {
			fontFamily: 'sans-serif',
			fontSize: '48px',
			fontStyle: 'bold',
			color,
			stroke: 'white',
			strokeThickness: 4
		});

		this.setAlign('center');
		this.setOrigin(0.5, 0.5);
		this.setScale(1/4);

		this.scene.tweens.add({
			targets: this,
			y: pos[1] - 4,
			scale: 1/6,
			delay: 200,
			duration: 200
		});

		this.scene.tweens.add({
			targets: this,
			alpha: 0,
			delay: 300,
			duration: 100
		});

		this.scene.time.addEvent({ callback: () => this.destroy(), delay: 400 });
	}
}
