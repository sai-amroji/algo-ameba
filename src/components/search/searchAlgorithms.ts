export type SearchMode = "linear" | "binary";

export type SearchBar = {
  id: string;
  value: number;
};

export type SearchBarState = "checking" | "found";

export type SearchFrame = {
  states: Record<string, SearchBarState>;
  duration: number;
};

export type SearchRunResult = {
  initialBars: SearchBar[];
  frames: SearchFrame[];
};

const linearSearch = (bars: SearchBar[], target: number): SearchRunResult => {
  const frames: SearchFrame[] = [];
  let foundId: string | undefined;

  for (let index = 0; index < bars.length; index++) {
    const current = bars[index];
    frames.push({
      states: { [current.id]: "checking" },
      duration: 0.35,
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
    });
  } else {
    frames.push({
      states: {},
      duration: 0.2,
    });
  }

  return {
    initialBars: bars,
    frames,
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
    const states: Record<string, SearchBarState> = {};

    activeIds.forEach((id) => {
      states[id] = "checking";
    });

    frames.push({
      states,
      duration: 0.35,
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
    frames.push({
      states: { [foundId]: "found" },
      duration: 0.2,
    });
  } else {
    frames.push({
      states: {},
      duration: 0.2,
    });
  }

  return {
    initialBars: sortedBars,
    frames,
  };
};

export const searchAlgorithms: Record<SearchMode, (bars: SearchBar[], target: number) => SearchRunResult> = {
  linear: linearSearch,
  binary: binarySearch,
};
