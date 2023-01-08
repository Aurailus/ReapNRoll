import './style.css';

import { Card, modifyCard } from './card/Card';
import { Dice, getDiceName } from './Dice';

import dice_chooser from '../res/ring.png';
import card_background from '../res/card_background.png';
import dice_select from '../res/dice_select.png';
import dice_d6 from '../res/dice_d6.png';
import dice_d12 from '../res/dice_d12.png';
import dice_d16 from '../res/dice_d16.png';
import dice_d20 from '../res/dice_d20.png';
import health_full from '../res/health_full.png';
import health_empty from '../res/health_empty.png';
import cancel_button from '../res/cancel_cast.png';

export default function renderCard(card: Card, accelerator: number | null = null, active: boolean = false,
	onClick: (() => void) | null = null) {
	card = modifyCard(card);
	const elem = document.createElement('div');

	elem.classList.add('card');
	elem.style.backgroundImage = `url(${card_background})`;

	elem.innerHTML = `
		<div class='header'>
			<p class='title'>${card.type.name}</p>
			<p class='index'>${accelerator ?? ''}</p>
		</div>
		<img class='image' src='${card.type.image}'>
		<p class='description'>${card.type.description}</p>
	`;

	if (active) elem.classList.add('active');
	if (onClick) elem.addEventListener('click', onClick);

	return elem;
}

export function renderCards(cards: Card[], active: number | null, onClick: (index: number) => void) {
	let cardShelf = document.getElementById('card-shelf');
	if (cardShelf) cardShelf.innerHTML = '';
	else {
		cardShelf = document.createElement('div');
		cardShelf.id = 'card-shelf';
		document.body.appendChild(cardShelf);
	}

	for (let i = 0; i < cards.length; i++) cardShelf.appendChild(
		renderCard(cards[i], i + 1, active === i, () => onClick(i)));
}

export function renderDiceChooser(base: Dice, extra: Dice[], title: string,
	onClick: (ind: number) => void, onCancel: () => void) {

	let diceChooser = document.getElementById('dice-chooser');
	if (diceChooser) diceChooser.innerHTML = '';
	else {
		diceChooser = document.createElement('div');
		diceChooser.id = 'dice-chooser';
		diceChooser.style.backgroundImage = `url(${dice_chooser})`;
		diceChooser.style.setProperty('--dice-select', `url(${dice_select})`);
		document.body.appendChild(diceChooser);
	}

	let titleElem = document.createElement('h1');
	titleElem.innerText = title;
	titleElem.classList.add('title');
	diceChooser.appendChild(titleElem);

	let cancelButton = document.createElement('div');
	cancelButton.classList.add('cancel');
	cancelButton.style.backgroundImage = `url(${cancel_button})`;
	cancelButton.addEventListener('click', onCancel);
	diceChooser.appendChild(cancelButton);

	let baseDie = renderDice(base, 'center', () => onClick(-1));
	baseDie.style.left = '50%';
	baseDie.style.top = '50%';

	diceChooser.appendChild(baseDie);

	for (let i = 0; i < extra.length; i++) {
		let die = extra[i];
		let side: 'left' | 'right' | 'center' =
			i === extra.length / 2 || i == 0 ? 'center' : i < extra.length / 2 ? 'right' : 'left';
		let dieElem = renderDice(die, side, () => onClick(i));
		dieElem.classList.add('extra-dice');
		let angle = Math.PI * 2 * i / extra.length - Math.PI / 2;
		dieElem.style.left = `${(Math.cos(angle) * 42) + 50}%`;
		dieElem.style.top = `${(Math.sin(angle) * 42) + 50}%`;

		diceChooser.appendChild(dieElem);

	}
}

export function renderDice(dice: Dice, labelPos: 'right' | 'left' | 'center', onClick: (() => void) | null = null) {
	let diceContainer = document.createElement('div');
	diceContainer.classList.add('dice-container');
	diceContainer.innerHTML = `
		<div class='label ${labelPos}'>
			<p class='name'>${getDiceName(dice)}</p>
			${dice.durability !== null ? `<p class='durability'>${dice.durability} uses</p>` : ''}
		</div>
		<div class='image' style='background-image: url(${
			dice.sides === 6 ? dice_d6 :
			dice.sides === 12 ? dice_d12 :
			dice.sides === 16 ? dice_d16 :
			dice_d20
		});'></div>
	`;

	if (onClick) diceContainer.addEventListener('click', onClick);

	return diceContainer;
}

export function renderHealth(health: number, maxHealth: number) {
	let healthContainer = document.getElementById('health-container');
	if (healthContainer) healthContainer.innerHTML = '';
	else {
		healthContainer = document.createElement('div');
		healthContainer.id = 'health-container';
		healthContainer.style.setProperty('--bg-full', `url(${health_full})`);
		healthContainer.style.setProperty('--bg-empty', `url(${health_empty})`);
		document.body.appendChild(healthContainer);
	}

	for (let i = 0; i < maxHealth; i++) {
		let notch = document.createElement('div');
		notch.classList.add('notch');
		if (i < health) notch.classList.add('full');
		healthContainer.appendChild(notch);
	}
}
