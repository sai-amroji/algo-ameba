// ─────────────────────────────────────────────
//  AVL — pure algorithm layer (no React, no GSAP)
// ─────────────────────────────────────────────

export interface AVLNode {
  val: number;
  height: number;
  left: AVLNode | null;
  right: AVLNode | null;
}

function height(n: AVLNode | null): number {
  return n ? n.height : 0;
}

function balanceFactor(n: AVLNode): number {
  return height(n.left) - height(n.right);
}

function updateHeight(n: AVLNode): AVLNode {
  return { ...n, height: 1 + Math.max(height(n.left), height(n.right)) };
}

function rotateRight(y: AVLNode): AVLNode {
  const x = y.left!;
  const T2 = x.right;
  const newY = updateHeight({ ...y, left: T2 });
  return updateHeight({ ...x, right: newY });
}

function rotateLeft(x: AVLNode): AVLNode {
  const y = x.right!;
  const T2 = y.left;
  const newX = updateHeight({ ...x, right: T2 });
  return updateHeight({ ...y, left: newX });
}

function balance(n: AVLNode): AVLNode {
  const bf = balanceFactor(n);

  // Left heavy
  if (bf > 1) {
    if (balanceFactor(n.left!) < 0)
      return rotateRight({ ...n, left: rotateLeft(n.left!) }); // LR
    return rotateRight(n); // LL
  }

  // Right heavy
  if (bf < -1) {
    if (balanceFactor(n.right!) > 0)
      return rotateLeft({ ...n, right: rotateRight(n.right!) }); // RL
    return rotateLeft(n); // RR
  }

  return n;
}

export function avlInsert(root: AVLNode | null, val: number): AVLNode {
  if (!root) return { val, height: 1, left: null, right: null };
  if (val < root.val) root = { ...root, left: avlInsert(root.left, val) };
  else if (val > root.val) root = { ...root, right: avlInsert(root.right, val) };
  else return root; // duplicate
  return balance(updateHeight(root));
}

export function avlDelete(root: AVLNode | null, val: number): AVLNode | null {
  if (!root) return null;
  if (val < root.val) root = { ...root, left: avlDelete(root.left, val) };
  else if (val > root.val) root = { ...root, right: avlDelete(root.right, val) };
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let successor = root.right;
    while (successor.left) successor = successor.left;
    root = { ...root, val: successor.val, right: avlDelete(root.right, successor.val) };
  }
  return balance(updateHeight(root));
}

export function avlSearch(root: AVLNode | null, val: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.val);
    if (val === cur.val) return path;
    cur = val < cur.val ? cur.left : cur.right;
  }
  return path;
}

/** Convert AVLNode tree to d3-hierarchy-compatible object */
export function avlToD3(node: AVLNode | null): any {
  if (!node) return null;
  const obj: any = { val: node.val, height: node.height };
  const children = [];
  if (node.left) children.push(avlToD3(node.left));
  if (node.right) children.push(avlToD3(node.right));
  if (children.length) obj.children = children;
  return obj;
}

// Default seed tree
export const DEFAULT_AVL: AVLNode = (() => {
  let t: AVLNode | null = null;
  for (const v of [44, 17, 62, 8, 32, 50, 78, 28, 38, 72, 88]) t = avlInsert(t, v);
  return t!;
})();
