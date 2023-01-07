export function roundTo(num: number, roundTo: number) {
	return Math.round(num / roundTo) * roundTo;
}

export function clamp(num: number, min: number, max: number) {
	return Math.min(Math.max(num, min), max);
}
