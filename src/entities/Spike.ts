import { vec2, vec4 } from 'gl-matrix';

import Room from '../Room';
import Entity from './Entity';
import { intersects } from '../Collides';

export interface Props {
	activate: string;
	deactivate: string;
}

export default class Spike extends Entity<Props> {
	private active = true;
	private sprite: Phaser.GameObjects.Sprite;

	private onActivateCallback?: () => void;
	private onDeactivateCallback?: () => void;

	constructor(room: Room, pos: vec2, data: Props) {
		super(room, pos, data);

		if (data.activate) this.active = false;

		if (this.data.activate) this.onActivateCallback = this.room.event.bind(data.activate, () => {
			this.active = true;
			this.updateState();
		});

		if (this.data.deactivate) this.onDeactivateCallback = this.room.event.bind(data.deactivate, () => {
			this.active = false;
			this.updateState();
		});

		this.sprite = this.room.scene.add.sprite(pos[0], pos[1], 'spike_off');
		this.sprite.setOrigin(0, 0);
		this.sprite.setPosition(pos[0] * 16, pos[1] * 16);

		this.updateState();
	}

	update() {
		if (intersects(
			this.room.player.getBounds(),
			vec4.fromValues(this.sprite.x, this.sprite.y, this.sprite.x + 16, this.sprite.y + 16))) {

			let thisPos = vec2.fromValues(this.sprite.x + 8, this.sprite.y + 8);
			let diff = vec2.sub(vec2.create(), this.room.player.pos, thisPos);
			let multiple = 1 - (Math.min(Math.abs(vec2.len(diff)), 32) / 32);
			vec2.normalize(diff, diff);
			vec2.scale(diff, diff, 2 + multiple * 20);
			if (this.active) this.room.player.damage(1, diff);
		}
	}

	private updateState() {
		this.sprite.setTexture(this.active ? 'spike_on' : 'spike_off')
	}

	destroy(): void {
		if (this.onActivateCallback) this.room.event.unbind('activate', this.onActivateCallback);
		if (this.onDeactivateCallback) this.room.event.unbind('deactivate', this.onDeactivateCallback);
	}
}
