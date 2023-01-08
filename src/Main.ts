import { Game } from 'phaser';

import './style.css';

import LoadScene from './scene/LoadScene';
import RoomScene from './scene/RoomScene';

new Game({
	antialias: false,
	type: Phaser.WEBGL,
	width: window.innerWidth,
	height: window.innerHeight,
	version: '0.0.1',
	scene: [
		LoadScene,
		RoomScene
	]
})
