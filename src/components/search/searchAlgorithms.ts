export type SearchMode = "linear" | "binary";

export type SearchBar = {
  id: string;
  value: number;
};

export type SearchBarState = "checking" | "found" | "discarded";

export type SearchFrame = {
  states: Record<string, SearchBarState>;
  duration: number;
  activeIds?: string[];
  discardedIds?: string[];
  focusId?: string;
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
      states: { [current.id]: "checking" },
      duration: 0.35,
      activeIds: [current.id],
      discardedIds: bars.filter((bar) => bar.id !== current.id).map((bar) => bar.id),
      focusId: current.id,
    });

    if (current.value === target) {
      foundId = current.id;
      break;
    }
  }

  if (foundId) {
    frames.push({
      states: { [foundId]: "found" },
      duration: 0.2,
      activeIds: [foundId],
      discardedIds: bars.filter((bar) => bar.id !== foundId).map((bar) => bar.id),
      focusId: foundId,
    });
  } else {
    frames.push({
      states: {},
      duration: 0.2,
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

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const activeIds = sortedBars.slice(low, high + 1).map((bar) => bar.id);
    const discardedIds = sortedBars
      .filter((_, index) => index < low || index > high)
      .map((bar) => bar.id);
    const states: Record<string, SearchBarState> = {};

    activeIds.forEach((id) => {
      states[id] = "checking";
    });
    discardedIds.forEach((id) => {
      states[id] = "discarded";
    });

    frames.push({
      states,
      duration: 0.35,
      activeIds,
      discardedIds,
      focusId: sortedBars[mid].id,
    });

    if (sortedBars[mid].value === target) {
      foundId = sortedBars[mid].id;
      break;
    }

    if (sortedBars[mid].value < target) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (foundId) {
    const discardedIds = sortedBars.filter((bar) => bar.id !== foundId).map((bar) => bar.id);
    frames.push({
      states: {
        ...Object.fromEntries(discardedIds.map((id) => [id, "discarded" as const])),
        [foundId]: "found",
      },
      duration: 0.2,
      activeIds: [foundId],
      discardedIds,
      focusId: foundId,
    });
  } else {
    frames.push({
      states: Object.fromEntries(sortedBars.map((bar) => [bar.id, "discarded" as const])),
      duration: 0.2,
      activeIds: [],
      discardedIds: sortedBars.map((bar) => bar.id),
    });
  }

  return {
    initialBars: sortedBars,
    frames,
    found: Boolean(foundId),
    foundId,
  };
};

export const searchAlgorithms: Record<SearchMode, (bars: SearchBar[], target: number) => SearchRunResult> = {
  linear: linearSearch,
  binary: binarySearch,
};
