import { Scene } from 'phaser';
import { renderDeathDisplay } from '../CardRenderer';
import { ROOMS } from './LoadScene';

interface DeathData {
}

export default class DeathScene extends Scene {
	constructor() { super('death'); }

	init(data: DeathData) {
		document.querySelector('#card-shelf')?.remove();
		document.querySelector('#health-container')?.remove();
		document.querySelector('#currency-container')?.remove();
		renderDeathDisplay(() => {
			this.scene.start('room', { room: ROOMS[0] });
			document.querySelector('.death-display')?.remove();
		});
	}

	create() {
	}
}
