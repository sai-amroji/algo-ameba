
export interface HeapNode {
  id: string;
  index: number;
  val: number;
  right: HeapNode | null;
  left: HeapNode | null;
}

export interface RenderNode {
  id: string;
  val: number;
  x: number;
  y: number;
}

export interface RenderEdge {
  id: string;
  d: string;
}

