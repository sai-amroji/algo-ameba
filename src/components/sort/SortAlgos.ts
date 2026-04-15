export type SortAlgorithmKey = "bubble" | "selection" | "insertion";

export type SortBar = {
	id: string;
	value: number;
};

export type SortBarState = "default" | "checking" | "comparing" | "sorted";

export type SortFrame = {
	bars: SortBar[];
	states: Record<string, SortBarState>;
	duration: number;
};

const cloneBars = (bars: SortBar[]) => bars.map((bar) => ({ ...bar }));

const pushFrame = (
	frames: SortFrame[],
	bars: SortBar[],
	states: Record<string, SortBarState>,
	duration = 0.35
) => {
	frames.push({
		bars: cloneBars(bars),
		states: { ...states },
		duration,
	});
};

export const buildBubbleSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	pushFrame(frames, bars, {}, 0.2);

	for (let i = 0; i < bars.length - 1; i++) {
		for (let j = 0; j < bars.length - 1 - i; j++) {
			const states: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => {
				states[id] = "sorted";
			});
			states[bars[j].id] = "comparing";
			states[bars[j + 1].id] = "comparing";
			pushFrame(frames, bars, states, 0.3);

			if (bars[j].value > bars[j + 1].value) {
				[bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];
				const swappedStates: Record<string, SortBarState> = {};
				sortedIds.forEach((id) => {
					swappedStates[id] = "sorted";
				});
				swappedStates[bars[j].id] = "checking";
				swappedStates[bars[j + 1].id] = "checking";
				pushFrame(frames, bars, swappedStates, 0.35);
			}
		}

		sortedIds.add(bars[bars.length - 1 - i].id);
		const states: Record<string, SortBarState> = {};
		sortedIds.forEach((id) => {
			states[id] = "sorted";
		});
		pushFrame(frames, bars, states, 0.25);
	}

	if (bars.length > 0) {
		sortedIds.add(bars[0].id);
	}
	const endStates: Record<string, SortBarState> = {};
	sortedIds.forEach((id) => {
		endStates[id] = "sorted";
	});
	pushFrame(frames, bars, endStates, 0.2);

	return frames;
};

export const buildSelectionSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	pushFrame(frames, bars, {}, 0.2);

	for (let i = 0; i < bars.length - 1; i++) {
		let minIndex = i;

		for (let j = i + 1; j < bars.length; j++) {
			const states: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => {
				states[id] = "sorted";
			});
			states[bars[minIndex].id] = "checking";
			states[bars[j].id] = "comparing";
			pushFrame(frames, bars, states, 0.3);

			if (bars[j].value < bars[minIndex].value) {
				minIndex = j;
				const minStates: Record<string, SortBarState> = {};
				sortedIds.forEach((id) => {
					minStates[id] = "sorted";
				});
				minStates[bars[minIndex].id] = "checking";
				pushFrame(frames, bars, minStates, 0.25);
			}
		}

		if (minIndex !== i) {
			[bars[i], bars[minIndex]] = [bars[minIndex], bars[i]];
			const swappedStates: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => {
				swappedStates[id] = "sorted";
			});
			swappedStates[bars[i].id] = "checking";
			swappedStates[bars[minIndex].id] = "checking";
			pushFrame(frames, bars, swappedStates, 0.35);
		}

		sortedIds.add(bars[i].id);
		const states: Record<string, SortBarState> = {};
		sortedIds.forEach((id) => {
			states[id] = "sorted";
		});
		pushFrame(frames, bars, states, 0.2);
	}

	if (bars.length > 0) {
		sortedIds.add(bars[bars.length - 1].id);
	}
	const endStates: Record<string, SortBarState> = {};
	sortedIds.forEach((id) => {
		endStates[id] = "sorted";
	});
	pushFrame(frames, bars, endStates, 0.2);

	return frames;
};

export const buildInsertionSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];

	pushFrame(frames, bars, {}, 0.2);

	for (let i = 1; i < bars.length; i++) {
		const current = bars[i];
		let j = i - 1;

		const compareStates: Record<string, SortBarState> = {
			[current.id]: "checking",
		};
		if (bars[j]) {
			compareStates[bars[j].id] = "comparing";
		}
		pushFrame(frames, bars, compareStates, 0.3);

		while (j >= 0 && bars[j].value > current.value) {
			bars[j + 1] = bars[j];
			const shiftStates: Record<string, SortBarState> = {
				[bars[j + 1].id]: "comparing",
				[current.id]: "checking",
			};
			pushFrame(frames, bars, shiftStates, 0.3);
			j -= 1;
		}

		bars[j + 1] = current;
		const insertedStates: Record<string, SortBarState> = {
			[current.id]: "checking",
		};
		pushFrame(frames, bars, insertedStates, 0.3);
	}

	const endStates: Record<string, SortBarState> = {};
	bars.forEach((bar) => {
		endStates[bar.id] = "sorted";
	});
	pushFrame(frames, bars, endStates, 0.25);

	return frames;
};

export const sortAlgorithmBuilders: Record<SortAlgorithmKey, (bars: SortBar[]) => SortFrame[]> = {
	bubble: buildBubbleSortFrames,
	selection: buildSelectionSortFrames,
	insertion: buildInsertionSortFrames,
};
