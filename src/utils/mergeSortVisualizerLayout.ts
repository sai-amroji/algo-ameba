// Merge sort visualization layout using D3 hierarchy for tree structure
// and position computation. Feed these positions to GSAP for animation.

import * as d3 from "d3-hierarchy";

export type MergeSortBarNode = {
  id: string;
  value: number;
  depth: number;
  low: number;
  high: number;
};

export type LayoutNode = {
  id: string;
  x: number;
  y: number;
  depth: number;
};

/**
 * Compute hierarchical tree layout for merge sort visualization.
 * Uses D3's tree layout to position bars based on their merge tree level.
 *
 * @param bars - Array of bars to visualize
 * @param depth - Current depth in the recursion tree
 * @param levelHeight - Vertical spacing between levels (default 84px)
 * @returns Record mapping bar.id to { x, y } positions
 */
export const computeMergeSortLayout = (
  bars: MergeSortBarNode[],
  depth: number = 0,
  levelHeight: number = 84
): Record<string, LayoutNode> => {
  if (bars.length === 0) return {};

  // Build a tree structure that D3 can understand
  const rootData = buildMergeTreeHierarchy(bars, 0, bars.length - 1, 0);
  const root = d3.hierarchy(rootData);

  // Apply D3's tree layout algorithm
  const treeLayout = d3.tree<any>().nodeSize([60, levelHeight]);
  treeLayout(root);

  // Extract positions from D3 hierarchy
  const positions: Record<string, LayoutNode> = {};
  const normalizePositions = (node: d3.HierarchyNode<any>) => {
    if (node.data.id) {
      positions[node.data.id] = {
        id: node.data.id,
        x: node.x || 0,
        y: (node.depth || 0) * levelHeight,
        depth: node.depth || 0,
      };
    }
    if (node.children) {
      node.children.forEach(normalizePositions);
    }
  };
  normalizePositions(root);

  return positions;
};

/**
 * Build a tree hierarchy object for D3 from merge sort structure.
 * Each node represents a subarray range that will be split/merged.
 */
const buildMergeTreeHierarchy = (
  bars: MergeSortBarNode[],
  low: number,
  high: number,
  depth: number
): any => {
  if (low === high) {
    return {
      id: bars[low].id,
      value: bars[low].value,
      depth,
      children: [],
    };
  }

  const mid = Math.floor((low + high) / 2);
  return {
    id: `range-${low}-${high}`,
    depth,
    children: [
      buildMergeTreeHierarchy(bars, low, mid, depth + 1),
      buildMergeTreeHierarchy(bars, mid + 1, high, depth + 1),
    ],
  };
};

/**
 * Compute offsets for a specific range during merge sort phases.
 * Accounts for split (diverge left/right), merge (converge), and sorted states.
 */
export const computeRangeOffsets = (
  barIds: string[],
  depth: number,
  phase: "split" | "merge" | "sorted",
  levelHeight: number = 84,
  mid?: number
): Record<string, { x: number; y: number }> => {
  const offsets: Record<string, { x: number; y: number }> = {};

  if (phase === "split" && typeof mid === "number") {
    const segmentSize = barIds.length;
    const branchShift = Math.max(42, segmentSize * 13);

    barIds.forEach((id, idx) => {
      if (idx <= mid) {
        offsets[id] = {
          x: -branchShift + (idx % (mid + 1)) * 12,
          y: (depth + 1) * levelHeight,
        };
      } else {
        offsets[id] = {
          x: branchShift + ((idx - mid - 1) % (segmentSize - mid - 1)) * 12,
          y: (depth + 1) * levelHeight,
        };
      }
    });
  } else {
    // For merge and sorted phases, return to base position
    barIds.forEach((id) => {
      offsets[id] = { x: 0, y: depth * levelHeight };
    });
  }

  return offsets;
};

/**
 * Get GSAP-compatible position object from D3 layout.
 * This is what you pass directly to gsap.to() or gsap.from()
 */
export const layoutToGsapVars = (
  layoutNodes: Record<string, LayoutNode>,
  barIds: string[]
) => {
  return barIds.map((id) => ({
    id,
    x: layoutNodes[id]?.x || 0,
    y: layoutNodes[id]?.y || 0,
  }));
};
