export const ROUTES = {
  landing: "/",
  home: "/home",
  algorithms: "/algorithms",
  about: "/about",
  sort: "/sort",
  mergeSort: "/merge",
  search: "/search",
  binarySearch: "/binary",
  selectionSort: "/selection",
  insertionSort: "/insertion",
  insertionSortLegacy: "/insert",
  queue: "/queue",
  stack: "/stack",
  linkedlist: "/linkedlist",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
