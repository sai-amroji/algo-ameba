export type ListType =
  | 'singly'
  | 'doubly'
  | 'singly-circular'
  | 'doubly-circular';

export type LLNode = {
  id: number;
  value: number;
  addr: number;
  prevAddr?: number;
};

export type ListConfig = {
  type: ListType;
  isCircular: boolean;
  isDoubly: boolean;
  label: string;
};

export const listTypeConfig: Record<ListType, ListConfig> = {
  singly: {
    type: 'singly',
    isCircular: false,
    isDoubly: false,
    label: 'Singly Linked List',
  },
  doubly: {
    type: 'doubly',
    isCircular: false,
    isDoubly: true,
    label: 'Doubly Linked List',
  },
  'singly-circular': {
    type: 'singly-circular',
    isCircular: true,
    isDoubly: false,
    label: 'Circular Linked List',
  },
  'doubly-circular': {
    type: 'doubly-circular',
    isCircular: true,
    isDoubly: true,
    label: 'Doubly Circular Linked List',
  },
};
