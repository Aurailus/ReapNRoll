export default class EventEmitter {
	private map: Map<string, Set<() => void>> = new Map();

	bind(eventName: string, callback: () => void) {
		if (!this.map.has(eventName)) this.map.set(eventName, new Set());
		this.map.get(eventName)!.add(callback);
		return callback;
	}

	unbind(eventName: string, callback: () => void) {
		if (!this.map.has(eventName)) return;
		this.map.get(eventName)!.delete(callback);
	}

	emit(eventName: string) {
		if (!this.map.has(eventName)) return;
		for (const callback of this.map.get(eventName)!) callback();
	}
}
