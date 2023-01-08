// let paused = false;
// const pauseCallbacks: Set<() => void> = new Set();
// const resumeCallbacks: Set<() => void> = new Set();

// export function pauseTimeouts() {
// 	paused = true;
// 	pauseCallbacks.forEach(callback => callback());
// }

// export function resumeTimeouts() {
// 	paused = false;
// 	resumeCallbacks.forEach(callback => callback());
// }

// export default function setPausableTimeout(callback: () => void, delay: number) {
// 	let active = !paused;
// 	let elapsed = 0;
// 	let lastStart = Date.now();
// 	let timeout = 0;

// 	function timeoutCallback() {
// 		callback();
// 		pauseCallbacks.delete(onPauseCallback);
// 		resumeCallbacks.delete(onResumeCallback);
// 	}

// 	if (active) {
// 		timeout = setTimeout(timeoutCallback, delay - elapsed) as any;
// 	}

// 	function onPauseCallback() {
// 		if (!active) return;
// 		clearTimeout(timeout);
// 		elapsed = Date.now() - lastStart;
// 		active = false;
// 	};

// 	function onResumeCallback() {
// 		if (active) return;
// 		setTimeout(timeoutCallback, delay - elapsed);
// 		lastStart = Date.now();
// 		active = true;
// 	};

// 	pauseCallbacks.add(onPauseCallback);
// 	resumeCallbacks.add(onResumeCallback);

// 	return {
// 		kill() {
// 			clearTimeout(timeout);
// 			pauseCallbacks.delete(onPauseCallback);
// 			resumeCallbacks.delete(onResumeCallback);
// 		}
// 	};
// }
