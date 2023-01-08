import { Game } from 'phaser';

import './style.css';

import GameScene from './GameScene';

new Game({
	antialias: false,
	type: Phaser.WEBGL,
	width: window.innerWidth,
	height: window.innerHeight,
	version: '0.0.1',
	scene: [
		GameScene
	]
})
