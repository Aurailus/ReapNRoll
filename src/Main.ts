// import map_img from '../res/map.png';

import { Game } from 'phaser';

import GameScene from './GameScene';
import './Card';
import { Card, CardTypes } from './Card';
import renderCard, { renderCards, renderDiceChooser } from './CardRenderer';
import './Dice';
// import readMap from './MapReader';

document.body.style.margin = '0';
document.body.style.display = 'grid';

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


const heal: Card = { type: CardTypes.get('heal')!, modifier: null };
const refinedHeal: Card = { type: CardTypes.get('heal')!, modifier: 'refined' };

const avarice: Card = { type: CardTypes.get('room_loot')!, modifier: null };
const refinedAvarice: Card = { type: CardTypes.get('room_loot')!, modifier: 'inverted' };

renderCards([ heal, refinedHeal, avarice, refinedAvarice ]);
renderDiceChooser({ sides: 12, modifier: null }, [
	{ sides: 6, modifier: null },
	{ sides: 20, modifier: 'cursed' },
	{ sides: 16, modifier: 'weighted' },
	{ sides: 20, modifier: 'cursed' },
	{ sides: 16, modifier: 'weighted' },
]);
