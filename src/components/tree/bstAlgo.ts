// ─────────────────────────────────────────────
//  BST — pure algorithm layer (no React, no GSAP)
// ─────────────────────────────────────────────

export interface BSTNode {
  val: number;
  left: BSTNode | null;
  right: BSTNode | null;
}

export function bstInsert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: bstInsert(root.left, val) };
  if (val > root.val) return { ...root, right: bstInsert(root.right, val) };
  return root; // duplicate — no-op
}

export function bstDelete(root: BSTNode | null, val: number): BSTNode | null {
  if (!root) return null;
  if (val < root.val) return { ...root, left: bstDelete(root.left, val) };
  if (val > root.val) return { ...root, right: bstDelete(root.right, val) };

  // Node to delete found
  if (!root.left) return root.right;
  if (!root.right) return root.left;

  // Two children: replace with in-order successor (min of right subtree)
  let successor = root.right;
  while (successor.left) successor = successor.left;
  return {
    val: successor.val,
    left: root.left,
    right: bstDelete(root.right, successor.val),
  };
}

/** Returns path of values visited during search */
export function bstSearch(root: BSTNode | null, val: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.val);
    if (val === cur.val) return path;
    cur = val < cur.val ? cur.left : cur.right;
  }
  return path; // not found — still return visited path
}

/** In-order traversal (sorted order) */
export function bstInorder(root: BSTNode | null): number[] {
  if (!root) return [];
  return [...bstInorder(root.left), root.val, ...bstInorder(root.right)];
}

/** Convert nested BSTNode to d3-hierarchy-compatible object */
export function bstToD3(node: BSTNode | null): any {
  if (!node) return null;
  const obj: any = { val: node.val };
  const children = [];
  if (node.left) children.push(bstToD3(node.left));
  if (node.right) children.push(bstToD3(node.right));
  if (children.length) obj.children = children;
  return obj;
}

// Default seed tree
export const DEFAULT_BST: BSTNode = (() => {
  let t: BSTNode | null = null;
  for (const v of [50, 30, 70, 20, 40, 60, 80]) t = bstInsert(t, v);
  return t!;
})();
