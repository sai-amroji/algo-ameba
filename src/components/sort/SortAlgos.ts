export type SortAlgorithmKey = "bubble" | "selection" | "insertion" | "merge" | "quick";

export type SortBar = {
	id: string;
	value: number;
};

export type SortBarState =
	| "default"
	| "checking"
	| "comparing"
	| "swapping"
	| "sorted"
	| "splitting"
	| "merging"
	| "placed"
	| "active"
	| "pivot"; // quick sort: the chosen pivot element

/**
 * xFraction: -1 = fully left, 0 = centre, +1 = fully right.
 * The animation layer multiplies this by a spread constant.
 * yLevel: 0 = base row, positive = elevated above base row (for merge "pick" animation).
 */
export type BarOffset = {
	xFraction: number; // -1 … +1 spread fraction
	yLevel: number;    // 0 = home row, 1 = lifted
};

export type SortFrame = {
	bars: SortBar[];
	states: Record<string, SortBarState>;
	duration: number;
	// Merge-sort spatial layout — undefined for other algos (Flip handles them)
	offsets?: Record<string, BarOffset>;
	// For merge frames: which bar is the current left/right pointer
	leftPtr?: string;
	rightPtr?: string;
	// Label shown above the bars for educational context
	phaseLabel?: string;
};

const cloneBars = (bars: SortBar[]) => bars.map((bar) => ({ ...bar }));

const pushFrame = (
	frames: SortFrame[],
	bars: SortBar[],
	states: Record<string, SortBarState>,
	duration = 0.6,
	offsets?: Record<string, BarOffset>,
	extra: Partial<SortFrame> = {}
) => {
	frames.push({
		bars: cloneBars(bars),
		states: { ...states },
		duration,
		offsets: offsets
			? Object.fromEntries(
					Object.entries(offsets).map(([id, o]) => [id, { ...o }])
			  )
			: undefined,
		...extra,
	});
};

// ─── Bubble Sort ────────────────────────────────────────────────────────────
export const buildBubbleSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	pushFrame(frames, bars, {}, 0.3);

	for (let i = 0; i < bars.length - 1; i++) {
		for (let j = 0; j < bars.length - 1 - i; j++) {
			const states: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => { states[id] = "sorted"; });
			states[bars[j].id] = "comparing";
			states[bars[j + 1].id] = "comparing";
			pushFrame(frames, bars, states, 0.55);

			if (bars[j].value > bars[j + 1].value) {
				[bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];
				const swapStates: Record<string, SortBarState> = {};
				sortedIds.forEach((id) => { swapStates[id] = "sorted"; });
				swapStates[bars[j].id] = "swapping";
				swapStates[bars[j + 1].id] = "swapping";
				pushFrame(frames, bars, swapStates, 0.6);
			}
		}

		sortedIds.add(bars[bars.length - 1 - i].id);
		const passStates: Record<string, SortBarState> = {};
		sortedIds.forEach((id) => { passStates[id] = "sorted"; });
		pushFrame(frames, bars, passStates, 0.4);
	}

	if (bars.length > 0) sortedIds.add(bars[0].id);
	const endStates: Record<string, SortBarState> = {};
	sortedIds.forEach((id) => { endStates[id] = "sorted"; });
	pushFrame(frames, bars, endStates, 0.5);

	return frames;
};

// ─── Selection Sort ──────────────────────────────────────────────────────────
export const buildSelectionSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	pushFrame(frames, bars, {}, 0.3);

	for (let i = 0; i < bars.length - 1; i++) {
		let minIndex = i;

		for (let j = i + 1; j < bars.length; j++) {
			const states: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => { states[id] = "sorted"; });
			states[bars[minIndex].id] = "checking";
			states[bars[j].id] = "comparing";
			pushFrame(frames, bars, states, 0.5);

			if (bars[j].value < bars[minIndex].value) {
				minIndex = j;
				const minStates: Record<string, SortBarState> = {};
				sortedIds.forEach((id) => { minStates[id] = "sorted"; });
				minStates[bars[minIndex].id] = "checking";
				pushFrame(frames, bars, minStates, 0.45);
			}
		}

		if (minIndex !== i) {
			[bars[i], bars[minIndex]] = [bars[minIndex], bars[i]];
			const swapStates: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => { swapStates[id] = "sorted"; });
			swapStates[bars[i].id] = "swapping";
			swapStates[bars[minIndex].id] = "swapping";
			pushFrame(frames, bars, swapStates, 0.6);
		}

		sortedIds.add(bars[i].id);
		const passStates: Record<string, SortBarState> = {};
		sortedIds.forEach((id) => { passStates[id] = "sorted"; });
		pushFrame(frames, bars, passStates, 0.35);
	}

	if (bars.length > 0) sortedIds.add(bars[bars.length - 1].id);
	const endStates: Record<string, SortBarState> = {};
	sortedIds.forEach((id) => { endStates[id] = "sorted"; });
	pushFrame(frames, bars, endStates, 0.5);

	return frames;
};

// ─── Insertion Sort ──────────────────────────────────────────────────────────
export const buildInsertionSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	pushFrame(frames, bars, {}, 0.3);

	for (let i = 1; i < bars.length; i++) {
		let j = i;

		while (j > 0) {
			const left = bars[j - 1];
			const right = bars[j];

			const compareStates: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => { compareStates[id] = "sorted"; });
			compareStates[left.id] = "comparing";
			compareStates[right.id] = "checking";
			pushFrame(frames, bars, compareStates, 0.5);

			if (left.value <= right.value) break;

			[bars[j - 1], bars[j]] = [bars[j], bars[j - 1]];
			const swapStates: Record<string, SortBarState> = {};
			sortedIds.forEach((id) => { swapStates[id] = "sorted"; });
			swapStates[bars[j - 1].id] = "swapping";
			swapStates[bars[j].id] = "swapping";
			pushFrame(frames, bars, swapStates, 0.55);

			j -= 1;
		}

		for (let k = 0; k <= i; k++) sortedIds.add(bars[k].id);
		const passStates: Record<string, SortBarState> = {};
		sortedIds.forEach((id) => { passStates[id] = "sorted"; });
		pushFrame(frames, bars, passStates, 0.35);
	}

	const endStates: Record<string, SortBarState> = {};
	bars.forEach((bar) => { endStates[bar.id] = "sorted"; });
	pushFrame(frames, bars, endStates, 0.5);

	return frames;
};

// ─── Merge Sort ──────────────────────────────────────────────────────────────
/**
 * Visual design philosophy:
 *
 * SPLIT phase: The range being divided physically spreads apart.
 *   Left half slides -xFraction, right half slides +xFraction.
 *   Deeper recursion = wider spread. Each half is coloured "splitting" (purple).
 *   This makes the divide tree *physical* and immediately readable.
 *
 * MERGE phase: The two sub-arrays slide back toward each other.
 *   Left pointer (checking) and right pointer (comparing) are highlighted.
 *   The winning bar is physically LIFTED (yLevel=1) then written to its
 *   output slot. No ghost/duplicate confusion — the bar moves.
 *   Placed bars turn "placed" (cyan). When the merge is complete the whole
 *   range turns "sorted" (green) and settles back to yLevel=0.
 *
 * Frame.offsets carries { xFraction, yLevel } per bar.
 * SortPage translates these to real pixels:
 *   x = xFraction * SPREAD_PX  (SPREAD_PX = containerWidth * 0.35 / maxDepth)
 *   y = yLevel * -LIFT_PX      (negative = upward)
 */
export const buildMergeSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];

	if (bars.length === 0) return frames;

	const maxDepth = Math.ceil(Math.log2(bars.length));

	/**
	 * Compute the xFraction for each bar in a range, given which side it is on.
	 * At depth d, we spread by (d / maxDepth) * sign.
	 * Bars within the same half stay clustered around their midpoint.
	 */
	const buildOffsets = (
		low: number,
		high: number,
		overrides: Record<string, Partial<BarOffset>> = {},
		defaultOffset: BarOffset = { xFraction: 0, yLevel: 0 }
	): Record<string, BarOffset> => {
		const result: Record<string, BarOffset> = {};
		for (let i = low; i <= high; i++) {
			const id = bars[i].id;
			result[id] = { ...defaultOffset, ...(overrides[id] ?? {}) };
		}
		return result;
	};

	/**
	 * Build offsets for a split frame.
	 * Left half: xFraction = -spreadFrac, right half: xFraction = +spreadFrac.
	 */
	const buildSplitOffsets = (
		low: number,
		mid: number,
		high: number,
		depth: number
	): Record<string, BarOffset> => {
		// Spread increases with depth — first split is subtle, deepest is widest
		const spreadFrac = (depth / maxDepth) * 0.85 + 0.15; // range 0.15..1.0
		const result: Record<string, BarOffset> = {};

		for (let i = low; i <= mid; i++) {
			result[bars[i].id] = { xFraction: -spreadFrac, yLevel: 0 };
		}
		for (let i = mid + 1; i <= high; i++) {
			result[bars[i].id] = { xFraction: +spreadFrac, yLevel: 0 };
		}
		return result;
	};

	/**
	 * Build offsets when two halves have come back together for merging.
	 * All bars in range are at xFraction=0 but may have yLevel overrides.
	 */
	const buildMergeOffsets = (
		low: number,
		high: number,
		yOverrides: Record<string, number> = {}
	): Record<string, BarOffset> => {
		const result: Record<string, BarOffset> = {};
		for (let i = low; i <= high; i++) {
			const id = bars[i].id;
			result[id] = { xFraction: 0, yLevel: yOverrides[id] ?? 0 };
		}
		return result;
	};

	// ── Recursive split/merge ──────────────────────────────────────────────────

	const mergeRange = (low: number, mid: number, high: number, depth: number) => {
		const left  = bars.slice(low, mid + 1).map((b) => ({ ...b }));
		const right = bars.slice(mid + 1, high + 1).map((b) => ({ ...b }));
		let li = 0, ri = 0, wi = low;

		// Bars that have been placed into output position — tracked for state colouring
		const placedIds = new Set<string>();

		const rangeStates = (overrides: Record<string, SortBarState> = {}): Record<string, SortBarState> => {
			const s: Record<string, SortBarState> = {};
			for (let i = low; i <= high; i++) {
				s[bars[i].id] = placedIds.has(bars[i].id) ? "placed" : "merging";
			}
			Object.assign(s, overrides);
			return s;
		};

		while (li < left.length && ri < right.length) {
			const lBar = left[li];
			const rBar = right[ri];

			// ── Show the two candidates highlighted, both halves back together ──
			pushFrame(
				frames, bars,
				rangeStates({ [lBar.id]: "checking", [rBar.id]: "comparing" }),
				1.0, // hold so user can read both candidates
				buildMergeOffsets(low, high),
				{ leftPtr: lBar.id, rightPtr: rBar.id }
			);

			let winner: SortBar;
			if (lBar.value <= rBar.value) {
				winner = lBar;
				// Lift the winner before writing
				pushFrame(
					frames, bars,
					rangeStates({ [lBar.id]: "checking" }),
					0.5,
					buildMergeOffsets(low, high, { [lBar.id]: 1 }), // lift lBar
				);
				bars[wi] = { ...lBar };
				li++;
			} else {
				winner = rBar;
				pushFrame(
					frames, bars,
					rangeStates({ [rBar.id]: "comparing" }),
					0.5,
					buildMergeOffsets(low, high, { [rBar.id]: 1 }),
				);
				bars[wi] = { ...rBar };
				ri++;
			}

			placedIds.add(winner.id);
			// Settle winner into output slot (yLevel back to 0, now "placed")
			pushFrame(
				frames, bars,
				rangeStates({ [bars[wi].id]: "placed" }),
				0.65,
				buildMergeOffsets(low, high),
			);
			wi++;
		}

		// Drain remaining left
		while (li < left.length) {
			const lBar = left[li];
			pushFrame(
				frames, bars,
				rangeStates({ [lBar.id]: "checking" }),
				0.55,
				buildMergeOffsets(low, high, { [lBar.id]: 1 }),
			);
			bars[wi] = { ...lBar };
			placedIds.add(lBar.id);
			pushFrame(
				frames, bars,
				rangeStates({ [bars[wi].id]: "placed" }),
				0.5,
				buildMergeOffsets(low, high),
			);
			li++; wi++;
		}

		// Drain remaining right
		while (ri < right.length) {
			const rBar = right[ri];
			pushFrame(
				frames, bars,
				rangeStates({ [rBar.id]: "comparing" }),
				0.55,
				buildMergeOffsets(low, high, { [rBar.id]: 1 }),
			);
			bars[wi] = { ...rBar };
			placedIds.add(rBar.id);
			pushFrame(
				frames, bars,
				rangeStates({ [bars[wi].id]: "placed" }),
				0.5,
				buildMergeOffsets(low, high),
			);
			ri++; wi++;
		}

		// Whole range is now sorted — green flash
		const sortedStates: Record<string, SortBarState> = {};
		for (let i = low; i <= high; i++) sortedStates[bars[i].id] = "sorted";
		pushFrame(
			frames, bars,
			sortedStates,
			0.8,
			buildOffsets(low, high, {}, { xFraction: 0, yLevel: 0 }),
			{ phaseLabel: `Merged [${low}…${high}]` }
		);
	};

	const sortRange = (low: number, high: number, depth: number) => {
		if (low === high) {
			// Single element — trivially sorted, brief green flash
			const s: Record<string, SortBarState> = { [bars[low].id]: "sorted" };
			pushFrame(frames, bars, s, 0.5,
				{ [bars[low].id]: { xFraction: 0, yLevel: 0 } }
			);
			return;
		}

		const mid = Math.floor((low + high) / 2);

		// ── SPLIT FRAME: show the range splitting into two halves ──
		const splitStates: Record<string, SortBarState> = {};
		for (let i = low; i <= high; i++) splitStates[bars[i].id] = "splitting";
		pushFrame(
			frames, bars,
			splitStates,
			1.1, // breathe — user reads the split
			buildSplitOffsets(low, mid, high, depth + 1),
			{ phaseLabel: `Split [${low}…${high}] → [${low}…${mid}] + [${mid + 1}…${high}]` }
		);

		sortRange(low, mid, depth + 1);
		sortRange(mid + 1, high, depth + 1);

		// ── PRE-MERGE FRAME: bring both halves back together ──
		const mergeStates: Record<string, SortBarState> = {};
		for (let i = low; i <= high; i++) mergeStates[bars[i].id] = "merging";
		pushFrame(
			frames, bars,
			mergeStates,
			0.8,
			buildOffsets(low, high, {}, { xFraction: 0, yLevel: 0 }),
			{ phaseLabel: `Merging [${low}…${high}]` }
		);

		mergeRange(low, mid, high, depth);
	};

	// Kick off with a breath
	pushFrame(frames, bars, {}, 0.4);
	sortRange(0, bars.length - 1, 0);

	// Final sweep — all sorted, cascade green left-to-right
	const allSorted: Record<string, SortBarState> = {};
	bars.forEach((bar) => { allSorted[bar.id] = "sorted"; });
	pushFrame(frames, bars, allSorted, 1.0,
		buildOffsets(0, bars.length - 1, {}, { xFraction: 0, yLevel: 0 })
	);

	return frames;
};

// ─── Quick Sort ───────────────────────────────────────────────────────────────
/**
 * Visual design philosophy:
 *
 * Lomuto partition scheme (pivot = rightmost element of range).
 *
 * PIVOT SELECTION: The pivot bar is highlighted with the "pivot" state (gold).
 *   Everything in the current partition is "active" (dimmed blue), everything
 *   outside is "default" (neutral) — so the eye locks on the active range.
 *
 * SCAN: j (right scanner) steps through each bar as "comparing" (amber).
 *   i (partition boundary) sits as "checking" (red) — it marks where the
 *   next smaller-than-pivot element will land.
 *
 * SWAP: When arr[j] ≤ pivot, i advances and bars[i] ↔ bars[j] swap with
 *   the rose "swapping" flash.
 *
 * PIVOT PLACEMENT: After the scan, the pivot physically lifts (yLevel=1)
 *   then drops into position i+1 with a "placed" flash, then turns "sorted".
 *   This makes the pivot-in-final-slot moment unmistakable.
 *
 * RECURSION: Left and right sub-partitions recurse independently — you see
 *   the sorted green region grow from the middle outward.
 */
export const buildQuickSortFrames = (initialBars: SortBar[]): SortFrame[] => {
	const bars = cloneBars(initialBars);
	const frames: SortFrame[] = [];
	const sortedIds = new Set<string>();

	if (bars.length === 0) return frames;

	/**
	 * Build a per-bar state map for the current partition frame.
	 * Bars inside [low, high] get `inner`, bars outside get `outer`.
	 * Any id in `overrides` gets that specific state instead.
	 */
	const rangeStates = (
		low: number,
		high: number,
		inner: SortBarState,
		overrides: Record<string, SortBarState> = {}
	): Record<string, SortBarState> => {
		const s: Record<string, SortBarState> = {};
		bars.forEach((bar, idx) => {
			if (sortedIds.has(bar.id)) {
				s[bar.id] = "sorted";
			} else if (idx >= low && idx <= high) {
				s[bar.id] = inner;
			} else {
				s[bar.id] = "default";
			}
		});
		Object.assign(s, overrides);
		return s;
	};

	const partition = (low: number, high: number): number => {
		const pivotBar = bars[high];
		const pivotId  = pivotBar.id;
		let i = low - 1;

		// ── Announce the pivot ──────────────────────────────────────────────────
		pushFrame(
			frames, bars,
			rangeStates(low, high, "active", { [pivotId]: "pivot" }),
			1.0, // let the user read: "this is the pivot"
			undefined,
			{ phaseLabel: `Pivot: ${pivotBar.value}  (partition [${low}…${high}])` }
		);

		// ── Scan j across the partition ─────────────────────────────────────────
		for (let j = low; j < high; j++) {
			const scanOverrides: Record<string, SortBarState> = {
				[pivotId]: "pivot",
				[bars[j].id]: "comparing",
			};
			if (i >= low) scanOverrides[bars[i].id] = "checking";

			pushFrame(
				frames, bars,
				rangeStates(low, high, "active", scanOverrides),
				0.65 // per-element scan — a little breath
			);

			if (bars[j].value <= pivotBar.value) {
				i++;
				if (i !== j) {
					// Swap i and j
					[bars[i], bars[j]] = [bars[j], bars[i]];
					const swapOverrides: Record<string, SortBarState> = {
						[pivotId]: "pivot",
						[bars[i].id]: "swapping",
						[bars[j].id]: "swapping",
					};
					pushFrame(
						frames, bars,
						rangeStates(low, high, "active", swapOverrides),
						0.7 // swap is meaningful — let it breathe
					);
				}
			}
		}

		// ── Place pivot into its final slot (i + 1) ─────────────────────────────
		const pivotFinalIdx = i + 1;

		if (pivotFinalIdx !== high) {
			// Lift pivot visually before placing it
			const liftOffsets: Record<string, { xFraction: number; yLevel: number }> = {};
			bars.forEach((b) => { liftOffsets[b.id] = { xFraction: 0, yLevel: 0 }; });
			liftOffsets[pivotId] = { xFraction: 0, yLevel: 1 };

			pushFrame(
				frames, bars,
				rangeStates(low, high, "active", { [pivotId]: "pivot" }),
				0.55,
				liftOffsets
			);

			// Perform the actual swap into final position
			[bars[pivotFinalIdx], bars[high]] = [bars[high], bars[pivotFinalIdx]];

			// Settle pivot into its slot (placed = cyan flash)
			const settleOffsets: Record<string, { xFraction: number; yLevel: number }> = {};
			bars.forEach((b) => { settleOffsets[b.id] = { xFraction: 0, yLevel: 0 }; });

			pushFrame(
				frames, bars,
				rangeStates(low, high, "active", { [bars[pivotFinalIdx].id]: "placed" }),
				0.6,
				settleOffsets
			);
		} else {
			// Pivot was already in the right place — just swap without lift animation
			[bars[pivotFinalIdx], bars[high]] = [bars[high], bars[pivotFinalIdx]];
		}

		// Mark pivot as sorted
		sortedIds.add(bars[pivotFinalIdx].id);
		pushFrame(
			frames, bars,
			rangeStates(low, high, "active", { [bars[pivotFinalIdx].id]: "sorted" }),
			0.7,
			undefined,
			{ phaseLabel: `${bars[pivotFinalIdx].value} is in its final position` }
		);

		return pivotFinalIdx;
	};

	const sortRange = (low: number, high: number) => {
		if (low >= high) {
			// Single remaining element is trivially sorted
			if (low === high && !sortedIds.has(bars[low].id)) {
				sortedIds.add(bars[low].id);
				const s: Record<string, SortBarState> = {};
				bars.forEach((b) => { s[b.id] = sortedIds.has(b.id) ? "sorted" : "default"; });
				pushFrame(frames, bars, s, 0.5);
			}
			return;
		}

		const pivotIdx = partition(low, high);
		sortRange(low, pivotIdx - 1);
		sortRange(pivotIdx + 1, high);
	};

	// Initial breath
	pushFrame(frames, bars, {}, 0.4);
	sortRange(0, bars.length - 1);

	// Final green sweep — confirm everything is sorted
	const allSorted: Record<string, SortBarState> = {};
	bars.forEach((bar) => { allSorted[bar.id] = "sorted"; });
	pushFrame(frames, bars, allSorted, 1.0);

	return frames;
};

// ─── Registry ────────────────────────────────────────────────────────────────
export const sortAlgorithmBuilders: Record<SortAlgorithmKey, (bars: SortBar[]) => SortFrame[]> = {
	bubble:    buildBubbleSortFrames,
	selection: buildSelectionSortFrames,
	insertion: buildInsertionSortFrames,
	merge:     buildMergeSortFrames,
	quick:     buildQuickSortFrames,
};
