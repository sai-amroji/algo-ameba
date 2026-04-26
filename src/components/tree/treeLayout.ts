// ─────────────────────────────────────────────
//  treeLayout.ts — D3 layout layer
//  Input:  raw algo tree (BSTNode | AVLNode)
//  Output: flat {nodes, links} ready for SVG rendering + GSAP
//  No React, no GSAP here.
// ─────────────────────────────────────────────

import * as d3 from "d3";

export interface RenderNode {
  id: number;          // node value used as unique key & CSS class suffix
  x: number;
  y: number;
  meta?: Record<string, any>; // e.g. { height } for AVL
}

export interface RenderLink {
  id: string;          // "parentVal-childVal"  used as CSS class suffix
  d: string;           // SVG path string
}

export interface LayoutResult {
  nodes: RenderNode[];
  links: RenderLink[];
}

// ── BST — d3.tree (orthogonal, non-uniform depth) ───────────────────────────
export function computeBSTLayout(d3Root: any, svgW = 680, svgH = 300): LayoutResult {
  const PAD = { x: 30, y: 40 };
  const hier = d3.hierarchy(d3Root);
  
  // Prevent negative sizes on initial load
  const w = Math.max(10, svgW - PAD.x * 2);
  const h = Math.max(10, svgH - PAD.y * 2);
  
  d3.tree().size([w, h])(hier);

  const nodes: RenderNode[] = hier.descendants().map((n: any) => ({
    id: n.data.val,
    x: n.x + PAD.x,
    y: n.y + PAD.y,
  }));

  const links: RenderLink[] = hier.links().map((l: any) => {
    const p1 = { x: l.source.x + PAD.x, y: l.source.y + PAD.y };
    const p2 = { x: l.target.x + PAD.x, y: l.target.y + PAD.y };
    const mid = (p1.y + p2.y) / 2;
    return {
      id: `${l.source.data.val}-${l.target.data.val}`,
      d: `M${p1.x},${p1.y} C${p1.x},${mid} ${p2.x},${mid} ${p2.x},${p2.y}`,
    };
  });

  return { nodes, links };
}

// ── AVL — d3.cluster (dendrogram, uniform leaf depth) ───────────────────────
export function computeAVLLayout(d3Root: any, svgW = 680, svgH = 300): LayoutResult {
  const PAD = { x: 20, y: 30 };
  const hier = d3.hierarchy(d3Root);
  
  // Prevent negative sizes on initial load
  const w = Math.max(10, svgW - PAD.x * 2);
  const h = Math.max(10, svgH - PAD.y * 2);
  
  d3.cluster().size([w, h])(hier);

  const nodes: RenderNode[] = hier.descendants().map((n: any) => ({
    id: n.data.val,
    x: n.x + PAD.x,
    y: n.y + PAD.y,
    meta: { height: n.data.height },
  }));

  const pathGen = d3.linkVertical<any, any>()
    .x((d: any) => d[0])
    .y((d: any) => d[1]);

  const links: RenderLink[] = hier.links().map((l: any) => ({
    id: `${l.source.data.val}-${l.target.data.val}`,
    d: pathGen({
      source: [l.source.x + PAD.x, l.source.y + PAD.y],
      target: [l.target.x + PAD.x, l.target.y + PAD.y],
    }) as string,
  }));

  return { nodes, links };
}
