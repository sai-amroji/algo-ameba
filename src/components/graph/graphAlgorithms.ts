// Graph algorithm frame definitions

export interface GraphFrame {
  nodes: Array<{
    id: number;
    state: "active" | "visited" | "unvisited" | "found";
    color?: string;
  }>;
  edges: Array<{
    source: number;
    target: number;
    state: "active" | "visited" | "unvisited";
  }>;
  queue?: number[];
  stack?: number[];
  description: string;
}

// BFS Algorithm
export const bfsFrames = (startNode: number, nodes: number[]): GraphFrame[] => {
  const frames: GraphFrame[] = [];
  const visited = new Set<number>();
  const queue = [startNode];
  visited.add(startNode);

  // Initial frame
  frames.push({
    nodes: nodes.map((n) => ({
      id: n,
      state: n === startNode ? "active" : "unvisited",
    })),
    edges: [],
    queue: [startNode],
    description: `Starting BFS from node ${startNode}`,
  });

  // Process queue
  while (queue.length > 0) {
    const current = queue.shift()!;

    // Simulate neighbor discovery (for demo)
    const neighbors = getNeighbors(current, nodes);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);

        frames.push({
          nodes: nodes.map((n) => ({
            id: n,
            state: visited.has(n) ? "visited" : n === neighbor ? "active" : "unvisited",
          })),
          edges: [],
          queue: [...queue],
          description: `Visiting node ${neighbor}`,
        });
      }
    }
  }

  return frames;
};

// DFS Algorithm
export const dfsFrames = (startNode: number, nodes: number[]): GraphFrame[] => {
  const frames: GraphFrame[] = [];
  const visited = new Set<number>();
  const stack = [startNode];

  frames.push({
    nodes: nodes.map((n) => ({
      id: n,
      state: n === startNode ? "active" : "unvisited",
    })),
    edges: [],
    stack: [startNode],
    description: `Starting DFS from node ${startNode}`,
  });

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (!visited.has(current)) {
      visited.add(current);

      frames.push({
        nodes: nodes.map((n) => ({
          id: n,
          state: visited.has(n) ? "visited" : n === current ? "active" : "unvisited",
        })),
        edges: [],
        stack: [...stack],
        description: `Processing node ${current}`,
      });

      // Simulate neighbors
      const neighbors = getNeighbors(current, nodes).reverse();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      }
    }
  }

  return frames;
};

// Helper function
const getNeighbors = (node: number, nodes: number[]): number[] => {
  // Simple demo: each node connects to next 1-2 nodes
  const neighbors: number[] = [];
  if (node + 1 < nodes.length) neighbors.push(node + 1);
  if (node + 2 < nodes.length && Math.random() > 0.5) neighbors.push(node + 2);
  return neighbors;
};
