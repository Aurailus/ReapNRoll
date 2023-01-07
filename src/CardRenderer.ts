import './style.css';

import { Card, modifyCard } from './Card';
import { Dice, getDiceName } from './Dice';

import dice_chooser from '../res/ring.png';
import card_background from '../res/card_background.png';
import dice_d6 from '../res/dice_d6.png';
import dice_d12 from '../res/dice_d12.png';
import dice_d16 from '../res/dice_d16.png';
import dice_d20 from '../res/dice_d20.png';


export default function renderCard(card: Card) {
	card = modifyCard(card);
	const elem = document.createElement('div');

	elem.classList.add('card');
	elem.style.backgroundImage = `url(${card_background})`;

	elem.innerHTML = `
		<p class='title'>${card.type.name}</p>
		<img class='image' src='${card.type.image}'>
		<p class='description'>${card.type.description}</p>
	`;

	return elem;
}

export function renderCards(cards: Card[]) {
	let cardShelf = document.getElementById('card-shelf');
	if (cardShelf) cardShelf.innerHTML = '';
	else {
		cardShelf = document.createElement('div');
		cardShelf.id = 'card-shelf';
		document.body.appendChild(cardShelf);
	}

	for (let card of cards) cardShelf.appendChild(renderCard(card));
}

export function renderDiceChooser(base: Dice, extra: Dice[]) {
	let diceChooser = document.getElementById('dice-chooser');
	if (diceChooser) diceChooser.innerHTML = '';
	else {
		diceChooser = document.createElement('div');
		diceChooser.id = 'dice-chooser';
		diceChooser.style.backgroundImage = `url(${dice_chooser})`;
		document.body.appendChild(diceChooser);
	}

	let baseDie = renderDice(base, 'center');
	baseDie.style.left = '50%';
	baseDie.style.top = '50%';

	diceChooser.appendChild(baseDie);

	for (let i = 0; i < extra.length; i++) {
		let die = extra[i];
		let side: 'left' | 'right' | 'center' =
			i === extra.length / 2 || i == 0 ? 'center' : i < extra.length / 2 ? 'right' : 'left';
		let dieElem = renderDice(die, side);
		dieElem.classList.add('extra-dice');

		// have each die be positioned at an angle around the base die, starting at the top
		let angle = Math.PI * 2 * i / extra.length - Math.PI / 2;


		dieElem.style.left = `${(Math.cos(angle) * 40) + 50}%`;
		dieElem.style.top = `${(Math.sin(angle) * 40) + 50}%`;

		diceChooser.appendChild(dieElem);

	}
}

export function renderDice(dice: Dice, labelPos: 'right' | 'left' | 'center') {
	let diceContainer = document.createElement('div');
	diceContainer.classList.add('dice-container');
	diceContainer.innerHTML = `
		<div class='label ${labelPos}'>${getDiceName(dice)}</div>
		<div class='image' style='background-image: url(${
			dice.sides === 6 ? dice_d6 :
			dice.sides === 12 ? dice_d12 :
			dice.sides === 16 ? dice_d16 :
			dice_d20
		});'></div>
	`;

	return diceContainer;
}
