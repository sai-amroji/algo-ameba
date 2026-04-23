// Tree algorithm frame definitions

export interface TreeFrame {
  nodes: Array<{
    id: string;
    value: number;
    state: "active" | "visited" | "unvisited" | "found";
    position?: { x: number; y: number };
  }>;
  edges: Array<{
    source: string;
    target: string;
    state: "active" | "visited" | "unvisited";
  }>;
  description: string;
}

// BST Insert
export const bstInsertFrames = (values: number[]): TreeFrame[] => {
  const frames: TreeFrame[] = [];
  const nodes: TreeFrame["nodes"] = [];
  const edges: TreeFrame["edges"] = [];
  const nodeMap = new Map<number, string>();

  frames.push({
    nodes: [],
    edges: [],
    description: "Starting to build Binary Search Tree",
  });

  values.forEach((val, idx) => {
    const nodeId = `node-${idx}`;
    nodeMap.set(val, nodeId);
    nodes.push({
      id: nodeId,
      value: val,
      state: "active",
    });

    frames.push({
      nodes: nodes.map((n) => ({
        ...n,
        state: n.value === val ? "active" : "visited",
      })),
      edges: [...edges],
      description: `Inserting value ${val} into BST`,
    });
  });

  return frames;
};

// In-order Traversal
export const inorderTraversalFrames = (nodes: Array<{ id: string; value: number }>): TreeFrame[] => {
  const frames: TreeFrame[] = [];
  const visited: string[] = [];

  frames.push({
    nodes: nodes.map((n) => ({ ...n, state: "unvisited" })),
    edges: [],
    description: "Starting In-order Traversal (Left, Root, Right)",
  });

  // Simulate traversal
  const traverse = (idx: number) => {
    if (idx >= nodes.length) return;

    // Left
    if (idx * 2 + 1 < nodes.length) {
      traverse(idx * 2 + 1);
    }

    // Root
    visited.push(nodes[idx].id);
    frames.push({
      nodes: nodes.map((n) => ({
        ...n,
        state: visited.includes(n.id) ? "visited" : "unvisited",
      })),
      edges: [],
      description: `Visiting node with value ${nodes[idx].value}`,
    });

    // Right
    if (idx * 2 + 2 < nodes.length) {
      traverse(idx * 2 + 2);
    }
  };

  traverse(0);

  return frames;
};

// Pre-order Traversal
export const preorderTraversalFrames = (
  nodes: Array<{ id: string; value: number }>
): TreeFrame[] => {
  const frames: TreeFrame[] = [];
  const visited: string[] = [];

  frames.push({
    nodes: nodes.map((n) => ({ ...n, state: "unvisited" })),
    edges: [],
    description: "Starting Pre-order Traversal (Root, Left, Right)",
  });

  const traverse = (idx: number) => {
    if (idx >= nodes.length) return;

    // Root
    visited.push(nodes[idx].id);
    frames.push({
      nodes: nodes.map((n) => ({
        ...n,
        state: visited.includes(n.id) ? "visited" : "unvisited",
      })),
      edges: [],
      description: `Visiting node with value ${nodes[idx].value}`,
    });

    // Left
    if (idx * 2 + 1 < nodes.length) {
      traverse(idx * 2 + 1);
    }

    // Right
    if (idx * 2 + 2 < nodes.length) {
      traverse(idx * 2 + 2);
    }
  };

  traverse(0);

  return frames;
};

// Post-order Traversal
export const postorderTraversalFrames = (
  nodes: Array<{ id: string; value: number }>
): TreeFrame[] => {
  const frames: TreeFrame[] = [];
  const visited: string[] = [];

  frames.push({
    nodes: nodes.map((n) => ({ ...n, state: "unvisited" })),
    edges: [],
    description: "Starting Post-order Traversal (Left, Right, Root)",
  });

  const traverse = (idx: number) => {
    if (idx >= nodes.length) return;

    // Left
    if (idx * 2 + 1 < nodes.length) {
      traverse(idx * 2 + 1);
    }

    // Right
    if (idx * 2 + 2 < nodes.length) {
      traverse(idx * 2 + 2);
    }

    // Root
    visited.push(nodes[idx].id);
    frames.push({
      nodes: nodes.map((n) => ({
        ...n,
        state: visited.includes(n.id) ? "visited" : "unvisited",
      })),
      edges: [],
      description: `Visiting node with value ${nodes[idx].value}`,
    });
  };

  traverse(0);

  return frames;
};
