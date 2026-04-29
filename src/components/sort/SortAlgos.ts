import * as d3 from "d3-hierarchy";

export type SortAlgorithmKey = "bubble" | "selection" | "insertion" | "merge";

export type SortBar = {
	id: string;
	value: number;
};

export type SortBarState = "default" | "checking" | "comparing" | "swapping" | "sorted" | "splitting" | "merging" | "placed" | "consumed";

export type SortFrame = {
	bars: SortBar[];
	states: Record<string, SortBarState>;
	duration: number;
	offsets?: Record<string, { x: number; y: number }>;
};

const cloneBars = (bars: SortBar[]) => bars.map((bar) => ({ ...bar }));

const pushFrame = (
	frames: SortFrame[],
	bars: SortBar[],
	states: Record<string, SortBarState>,
	duration = 0.35,
	offsets?: Record<string, { x: number; y: number }>
) => {
	frames.push({
		bars: cloneBars(bars),
		states: { ...states },
		duration,
		offsets: offsets
			? Object.fromEntries(
					Object.entries(offsets).map(([id, point]) => [id, { ...point }])
			  )
			: undefined,
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
				// rose flash — bars are physically exchanging positions
				swappedStates[bars[j].id] = "swapping";
				swappedStates[bars[j + 1].id] = "swapping";
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
			// rose flash — selected minimum is swapping into its position
			swappedStates[bars[i].id] = "swapping";
			swappedStates[bars[minIndex].id] = "swapping";
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

export const buildMergeSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];

	if (bars.length === 0) {
		return frames;
	}

	const levelY = 84;

	// Pre-compute D3 tree layout for the entire merge sort hierarchy
	const computeD3TreeLayout = (): Record<string, { x: number; y: number }> => {
		const createHierarchy = (low: number, high: number, depth: number): any => {
			if (low === high) {
				return { id: bars[low].id, value: bars[low].value, depth };
			}
			const mid = Math.floor((low + high) / 2);
			return {
				id: `branch-${low}-${high}`,
				depth,
				children: [
					createHierarchy(low, mid, depth + 1),
					createHierarchy(mid + 1, high, depth + 1),
				],
			};
		};

		const hierarchyData = createHierarchy(0, bars.length - 1, 0);
		const root = d3.hierarchy(hierarchyData);
		const treeLayout = d3.tree<any>().nodeSize([70, levelY]);
		treeLayout(root);

		const positions: Record<string, { x: number; y: number }> = {};
		const collectPositions = (node: d3.HierarchyNode<any>) => {
			if (node.data.id && !node.data.id.startsWith("branch-")) {
				positions[node.data.id] = {
					x: node.x || 0,
					y: (node.depth || 0) * levelY,
				};
			}
			if (node.children) node.children.forEach(collectPositions);
		};
		collectPositions(root);
		return positions;
	};

	const d3TreeLayout = computeD3TreeLayout();

	const buildRangeOffsets = (
		low: number,
		high: number,
		depth: number,
		phase: "split" | "merge" | "sorted",
		mid?: number
	) => {
		const offsets: Record<string, { x: number; y: number }> = {};

		if (phase === "split" && typeof mid === "number") {
			// Use D3-computed positions for split phase (bars diverge into left/right branches)
			for (let index = low; index <= high; index++) {
				const barId = bars[index].id;
				const d3Pos = d3TreeLayout[barId];
				if (d3Pos) {
					offsets[barId] = { x: d3Pos.x * 0.8, y: (depth + 1) * levelY }; // Scale D3 x by 0.8 for smoothness
				} else {
					offsets[barId] = { x: 0, y: (depth + 1) * levelY };
				}
			}
		} else {
			// For merge and sorted phases, return bars to horizontal center
			for (let index = low; index <= high; index++) {
				offsets[bars[index].id] = { x: 0, y: depth * levelY };
			}
		}

		return offsets;
	};

	const pushRangeFrame = (
		low: number,
		high: number,
		state: SortBarState,
		depth: number,
		duration = 0.3,
		phase: "split" | "merge" | "sorted" = "sorted",
		mid?: number
	) => {
		const states: Record<string, SortBarState> = {};
		for (let index = low; index <= high; index++) {
			states[bars[index].id] = state;
		}
		pushFrame(frames, bars, states, duration, buildRangeOffsets(low, high, depth, phase, mid));
	};

	const mergeRange = (low: number, mid: number, high: number, depth: number) => {
		const left = bars.slice(low, mid + 1).map((bar) => ({ ...bar }));
		const right = bars.slice(mid + 1, high + 1).map((bar) => ({ ...bar }));
		let leftIndex = 0;
		let rightIndex = 0;
		let writeIndex = low;

		// Track IDs whose values have been "taken" from their original position.
		// These grow cumulatively so every subsequent frame shows them as empty.
		const consumedIds = new Set<string>();

		// Helper: build a full state map for the current range.
		// consumed positions → hollow shell, placed/checking/comparing → overlaid after.
		const rangeStates = (overrides: Record<string, SortBarState> = {}): Record<string, SortBarState> => {
			const s: Record<string, SortBarState> = {};
			for (let i = low; i <= high; i++) {
				s[bars[i].id] = consumedIds.has(bars[i].id) ? "consumed" : "merging";
			}
			// Overrides applied last (placed, checking, comparing win over consumed/merging)
			Object.assign(s, overrides);
			return s;
		};

		while (leftIndex < left.length && rightIndex < right.length) {
			// Show the two live candidates against the orange/consumed background
			pushFrame(
				frames, bars,
				rangeStates({ [left[leftIndex].id]: "checking", [right[rightIndex].id]: "comparing" }),
				0.6,
				buildRangeOffsets(low, high, depth, "merge")
			);

			let placedId: string;
			if (left[leftIndex].value <= right[rightIndex].value) {
				placedId = left[leftIndex].id;
				bars[writeIndex] = { ...left[leftIndex] };
				// Original source position for left[leftIndex] = low + leftIndex
				// Only mark consumed if it's a different slot from writeIndex
				if (writeIndex !== low + leftIndex) consumedIds.add(placedId);
				leftIndex++;
			} else {
				placedId = right[rightIndex].id;
				bars[writeIndex] = { ...right[rightIndex] };
				if (writeIndex !== mid + 1 + rightIndex) consumedIds.add(placedId);
				rightIndex++;
			}

			// Cyan flash at writeIndex; source slot fades via consumedIds
			pushFrame(
				frames, bars,
				rangeStates({ [bars[writeIndex].id]: "placed" }),
				0.45,
				buildRangeOffsets(low, high, depth, "merge")
			);

			writeIndex++;
		}

		while (leftIndex < left.length) {
			pushFrame(
				frames, bars,
				rangeStates({ [left[leftIndex].id]: "checking" }),
				0.42,
				buildRangeOffsets(low, high, depth, "merge")
			);

			const placedId = left[leftIndex].id;
			bars[writeIndex] = { ...left[leftIndex] };
			if (writeIndex !== low + leftIndex) consumedIds.add(placedId);
			leftIndex++;

			pushFrame(
				frames, bars,
				rangeStates({ [bars[writeIndex].id]: "placed" }),
				0.38,
				buildRangeOffsets(low, high, depth, "merge")
			);
			writeIndex++;
		}

		while (rightIndex < right.length) {
			pushFrame(
				frames, bars,
				rangeStates({ [right[rightIndex].id]: "checking" }),
				0.42,
				buildRangeOffsets(low, high, depth, "merge")
			);

			const placedId = right[rightIndex].id;
			bars[writeIndex] = { ...right[rightIndex] };
			if (writeIndex !== mid + 1 + rightIndex) consumedIds.add(placedId);
			rightIndex++;

			pushFrame(
				frames, bars,
				rangeStates({ [bars[writeIndex].id]: "placed" }),
				0.38,
				buildRangeOffsets(low, high, depth, "merge")
			);
			writeIndex++;
		}
	};

	const sortRange = (low: number, high: number, depth: number) => {
		if (low === high) {
			pushRangeFrame(low, high, "sorted", depth, 0.42, "sorted");
			return;
		}

		const mid = Math.floor((low + high) / 2);
		pushRangeFrame(low, high, "splitting", depth, 0.72, "split", mid);

		sortRange(low, mid, depth + 1);
		sortRange(mid + 1, high, depth + 1);

		pushRangeFrame(low, high, "merging", depth, 0.62, "merge");
		mergeRange(low, mid, high, depth);
		pushRangeFrame(low, high, "sorted", depth, 0.5, "sorted");
	};

	pushFrame(frames, bars, {}, 0.45);
	sortRange(0, bars.length - 1, 0);
	return frames;
};

export const buildInsertionSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	pushFrame(frames, bars, {}, 0.2);

	for (let i = 1; i < bars.length; i++) {
		let j = i;

		while (j > 0) {
			const left = bars[j - 1];
			const right = bars[j];

			const compareStates: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => {
				compareStates[id] = "sorted";
			});
			compareStates[left.id] = "comparing";
			compareStates[right.id] = "checking";
			pushFrame(frames, bars, compareStates, 0.25);

			if (left.value <= right.value) {
				break;
			}

			[bars[j - 1], bars[j]] = [bars[j], bars[j - 1]];

			const swapStates: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => {
				swapStates[id] = "sorted";
			});
			// rose flash — key element shifting left into correct slot
			swapStates[bars[j - 1].id] = "swapping";
			swapStates[bars[j].id] = "swapping";
			pushFrame(frames, bars, swapStates, 0.3);

			j -= 1;
		}

		for (let k = 0; k <= i; k++) {
			sortedIds.add(bars[k].id);
		}

		const passStates: Record<string, SortBarState> = {};
		sortedIds.forEach((id) => {
			passStates[id] = "sorted";
		});
		pushFrame(frames, bars, passStates, 0.2);
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
	merge: buildMergeSortFrames,
};
