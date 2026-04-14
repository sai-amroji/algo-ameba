export const ROUTES = {
  landing: "/",
  home: "/home",
  algorithms: "/algorithms",
  about: "/about",
  sort: "/sort",
  search: "/search",
  binarySearch: "/binary",
  selectionSort: "/selection",
  insertionSort: "/insertion",
  insertionSortLegacy: "/insert",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
