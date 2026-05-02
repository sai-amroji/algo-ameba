export type SearchMode = 'linear' | 'binary';

export type SearchBar = {
  id: string;
  value: number;
};

export type SearchBarState = 'checking' | 'found' | 'discarded';

export type SearchFrame = {
  states: Record<string, SearchBarState>;
  duration: number;
  activeIds?: string[];
  discardedIds?: string[];
  // Binary search: which side was just eliminated
  leftDiscardedIds?: string[]; // fly to -x
  rightDiscardedIds?: string[]; // fly to +x
  focusId?: string;
  isFinalFound?: boolean; // triggers celebration animation
  isNotFound?: boolean; // triggers all-grey ending
};

export type SearchRunResult = {
  initialBars: SearchBar[];
  frames: SearchFrame[];
  found: boolean;
  foundId?: string;
};

const linearSearch = (bars: SearchBar[], target: number): SearchRunResult => {
  const frames: SearchFrame[] = [];
  let foundId: string | undefined;

  for (let index = 0; index < bars.length; index++) {
    const current = bars[index];
    frames.push({
      states: { [current.id]: 'checking' },
      duration: 0.8, // enough for the highlight to be seen clearly
      activeIds: [current.id],
      discardedIds: bars
        .filter((bar) => bar.id !== current.id)
        .map((bar) => bar.id),
      focusId: current.id,
    });

    if (current.value === target) {
      foundId = current.id;
      break;
    }
  }

  if (foundId) {
    frames.push({
      states: { [foundId]: 'found' },
      duration: 1.2,
      activeIds: [foundId],
      discardedIds: bars
        .filter((bar) => bar.id !== foundId)
        .map((bar) => bar.id),
      focusId: foundId,
    });
  } else {
    frames.push({
      states: {},
      duration: 0.8,
      activeIds: [],
      discardedIds: bars.map((bar) => bar.id),
    });
  }

  return {
    initialBars: bars,
    frames,
    found: Boolean(foundId),
    foundId,
  };
};

const binarySearch = (bars: SearchBar[], target: number): SearchRunResult => {
  const sortedBars = [...bars].sort((left, right) => left.value - right.value);
  const frames: SearchFrame[] = [];
  let low = 0;
  let high = sortedBars.length - 1;
  let foundId: string | undefined;

  // Accumulate eliminated IDs with their side so every frame carries full history
  const eliminatedLeft = new Set<string>(); // bars eliminated from the left side (fly -x)
  const eliminatedRight = new Set<string>(); // bars eliminated from the right side (fly +x)

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const activeIds = sortedBars.slice(low, high + 1).map((bar) => bar.id);
    const discardedIds = sortedBars
      .filter((_, i) => i < low || i > high)
      .map((bar) => bar.id);

    const states: Record<string, SearchBarState> = {};
    activeIds.forEach((id) => {
      states[id] = 'checking';
    });
    discardedIds.forEach((id) => {
      states[id] = 'discarded';
    });

    frames.push({
      states,
      // 1.8s hold — animation itself takes ~1.1s, this gives ~0.7s of breath before next frame
      duration: 1.8,
      activeIds,
      discardedIds,
      leftDiscardedIds: [...eliminatedLeft],
      rightDiscardedIds: [...eliminatedRight],
      focusId: sortedBars[mid].id,
    });

    if (sortedBars[mid].value === target) {
      foundId = sortedBars[mid].id;
      break;
    }

    if (sortedBars[mid].value < target) {
      // Left half (low..mid) is now useless — slide them left (-x)
      for (let i = low; i <= mid; i++) eliminatedLeft.add(sortedBars[i].id);
      low = mid + 1;
    } else {
      // Right half (mid..high) is now useless — slide them right (+x)
      for (let i = mid; i <= high; i++) eliminatedRight.add(sortedBars[i].id);
      high = mid - 1;
    }
  }

  if (foundId) {
    const discardedIds = sortedBars
      .filter((bar) => bar.id !== foundId)
      .map((bar) => bar.id);
    frames.push({
      states: {
        ...Object.fromEntries(
          discardedIds.map((id) => [id, 'discarded' as const])
        ),
        [foundId]: 'found',
      },
      // 2.5s — celebration animation (bars return + found rises) needs this room
      duration: 2.5,
      activeIds: [foundId],
      discardedIds,
      leftDiscardedIds: [...eliminatedLeft],
      rightDiscardedIds: [...eliminatedRight],
      focusId: foundId,
      isFinalFound: true,
    });
  } else {
    frames.push({
      states: Object.fromEntries(
        sortedBars.map((bar) => [bar.id, 'discarded' as const])
      ),
      duration: 1.5,
      activeIds: [],
      discardedIds: sortedBars.map((bar) => bar.id),
      leftDiscardedIds: [...eliminatedLeft],
      rightDiscardedIds: [...eliminatedRight],
      isNotFound: true,
    });
  }

  return {
    initialBars: sortedBars,
    frames,
    found: Boolean(foundId),
    foundId,
  };
};

export const searchAlgorithms: Record<
  SearchMode,
  (bars: SearchBar[], target: number) => SearchRunResult
> = {
  linear: linearSearch,
  binary: binarySearch,
};
