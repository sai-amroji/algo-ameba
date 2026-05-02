export const ROUTES = {
  landing: '/',
  home: '/home',
  algorithms: '/algorithms',
  about: '/about',
  sort: '/sort',
  search: '/search',
  queue: '/queue',
  stack: '/stack',
  linkedlist: '/linkedlist',
  graph: '/graph',
  tree: '/tree',
  heap: '/heap',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
