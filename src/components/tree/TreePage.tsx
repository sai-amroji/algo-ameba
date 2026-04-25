// ─────────────────────────────────────────────────────────────────────────────
//  TreePage.tsx — visual + animation layer only
//
//  Layering:
//    1. Algorithm  → bstAlgo.ts / avlAlgo.ts   (pure TS, no React/GSAP)
//    2. Layout     → treeLayout.ts              (D3 computes x/y, no DOM)
//    3. Visual     → this file                  (React renders SVG, GSAP animates)
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState, useMemo } from "react";
import gsap from "@/gsapSetup";
import { useGSAP } from "@gsap/react";

// ── Algorithm layer ──────────────────────────────────────────────────────────
import {
  type BSTNode,
  bstInsert, bstDelete, bstSearch, bstInorder, bstToD3,
  DEFAULT_BST,
} from "./bstAlgo";
import {
  type AVLNode,
  avlInsert, avlDelete, avlSearch, avlToD3,
  DEFAULT_AVL,
} from "./avlAlgo";

// ── Layout layer ─────────────────────────────────────────────────────────────
import { computeBSTLayout, computeAVLLayout,type  LayoutResult } from "./treeLayout";

// ─────────────────────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  node: "#378ADD", nodeS: "#185FA5",
  vis: "#1D9E75", visS: "#0F6E56",
  active: "#D85A30",
  edgeDraw: "#BA7517",
  cmp: "#9F77DD",
  txt: "#fff",
  search: "#E8C84A",
};

type Mode = "bst" | "avl";

const MODES: { id: Mode; label: string }[] = [
  { id: "bst", label: "Binary Search Tree" },
  { id: "avl", label: "AVL Tree" },
];

const INFO: Record<Mode, string> = {
  bst: "D3 tree layout → node positions. GSAP timeline → sequential insert + in-order traversal.",
  avl: "D3 cluster layout → balanced spacing. GSAP DrawSVG reveals edges after rotations.",
};

// ─────────────────────────────────────────────────────────────────────────────
//  Code snippets (display only)
// ─────────────────────────────────────────────────────────────────────────────

const CODE: Record<Mode, string> = {
  bst: `// bstAlgo.ts — pure insert (no React, no GSAP)
export function bstInsert(root: BSTNode | null, val: number): BSTNode {
  if (!root) return { val, left: null, right: null };
  if (val < root.val) return { ...root, left: bstInsert(root.left, val) };
  if (val > root.val) return { ...root, right: bstInsert(root.right, val) };
  return root; // duplicate — no-op
}

// treeLayout.ts — D3 computes (x, y) positions, no DOM
const hier = d3.hierarchy(bstToD3(tree));
d3.tree().size([620, 210])(hier);

// TreePage.tsx — GSAP only animates, never touches data
tl.to(\`.link-50-30\`, { drawSVG: "0% 100%", duration: 0.4 });
tl.to(\`.node-50\`,    { scale: 1, ease: "back.out(1.7)" });`,

  avl: `// avlAlgo.ts — self-balancing insert
export function avlInsert(root: AVLNode | null, val: number): AVLNode {
  if (!root) return { val, height: 1, left: null, right: null };
  if (val < root.val) root = { ...root, left: avlInsert(root.left, val) };
  else if (val > root.val) root = { ...root, right: avlInsert(root.right, val) };
  else return root; // duplicate
  return balance(updateHeight(root)); // ← rotations happen here
}

// treeLayout.ts — D3 cluster for uniform leaf depth
const hier = d3.hierarchy(avlToD3(tree));
d3.cluster().size([640, 220])(hier);

// TreePage.tsx — GSAP stagger reveals nodes then edges
tl.to(".tree-node", { scale: 1, stagger: 0.08, ease: "back.out(1.5)" });
tl.to(".tree-link", { drawSVG: "0% 100%", stagger: 0.07 }, 0.5);`,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function CodePanel({ mode }: { mode: Mode }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-6 rounded-xl border-[0.5px] border-blue-200 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 border-b-[0.5px] border-slate-700 bg-slate-900">
        <span className="text-sm font-mono text-slate-300">{mode}Algo.ts + treeLayout.ts + TreePage.tsx</span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(CODE[mode]).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            });
          }}
          className="text-xs px-3 py-1.5 rounded-md border-[0.5px] border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre className="m-0 px-6 py-4 font-mono text-xs leading-relaxed text-slate-200 overflow-x-auto whitespace-pre max-h-[280px] bg-slate-950">
        <code>{CODE[mode]}</code>
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BST Visual — handles its own GSAP timeline
// ─────────────────────────────────────────────────────────────────────────────

interface BSTVisualProps {
  layout: LayoutResult;
  replayKey: number;
  speed: number;
  highlightPath: number[];   // nodes to highlight (search / insert path)
}

function BSTVisual({ layout, replayKey, speed, highlightPath }: BSTVisualProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!layout.nodes.length) return;

    // Reset
    gsap.set(".tree-node", { scale: 0, transformOrigin: "center center" });
    gsap.set(".tree-link", { drawSVG: "0% 0%" });
    gsap.set(".tree-circle", { fill: C.node, stroke: C.nodeS });
    gsap.set(".traverse-dot", { opacity: 0 });

    const tl = gsap.timeline({ timeScale: speed });

    // ── Insert animation: nodes appear in BFS order ──
    // Build BFS order from link ids (parent always precedes child)
    const appeared = new Set<number>();
    const insertOrder: number[] = [];

    // Root has no link — add it first
    const rootNode = layout.nodes.find(
      n => !layout.links.some(l => l.id.split("-")[1] === String(n.id))
    );
    if (rootNode) insertOrder.push(rootNode.id);

    // BFS via links
    let frontier = rootNode ? [rootNode.id] : [];
    while (frontier.length) {
      const next: number[] = [];
      for (const pid of frontier) {
        for (const l of layout.links) {
          const [src, tgt] = l.id.split("-").map(Number);
          if (src === pid && !appeared.has(tgt)) {
            appeared.add(tgt);
            insertOrder.push(tgt);
            next.push(tgt);
          }
        }
      }
      frontier = next;
    }

    let t = 0;
    insertOrder.forEach((v, i) => {
      // Draw edge to this node (if not root)
      const parentLink = layout.links.find(l => Number(l.id.split("-")[1]) === v);
      if (parentLink) {
        tl.to(`.link-${parentLink.id}`, {
          drawSVG: "0% 100%", duration: 0.35, ease: "power2.inOut"
        }, t);
        t += 0.2;
      }
      tl.to(`.node-${v}`, { scale: 1, duration: 0.35, ease: "back.out(1.7)" }, t);
      t += 0.4;
    });

    // ── In-order traversal dot ──
    t += 0.4;
    const inorder = layout.nodes
      .slice()
      .sort((a, b) => a.id - b.id); // in-order by value for BST

    tl.to(".traverse-dot", { opacity: 1, duration: 0.2 }, t);
    inorder.forEach((n, i) => {
      tl.to(".traverse-dot", {
        attr: { cx: n.x, cy: n.y },
        duration: i === 0 ? 0.01 : 0.45,
        ease: "power2.inOut",
      }, t);
      t += i === 0 ? 0 : 0.35;
      tl.to(`.circle-${n.id}`, { fill: C.vis, stroke: C.visS, duration: 0.2 }, t);
      t += 0.3;
    });
    tl.to(".traverse-dot", { opacity: 0, duration: 0.3 }, t);

    // ── Highlight search path (overlay, runs after main timeline) ──
    if (highlightPath.length) {
      highlightPath.forEach((v, i) => {
        const found = i === highlightPath.length - 1;
        tl.to(`.circle-${v}`, {
          fill: found ? C.search : C.active,
          stroke: found ? "#b8960a" : "#a03010",
          duration: 0.25,
        }, t + i * 0.35);
      });
    }

  }, { dependencies: [layout, replayKey, speed, highlightPath], scope: svgRef, revertOnUpdate: true });

  return (
    <svg ref={svgRef} className="w-full h-auto block overflow-visible" viewBox="0 0 680 300">
      <g className="edges-layer">
        {layout.links.map(l => (
          <path
            key={l.id}
            className={`tree-link link-${l.id}`}
            d={l.d}
            stroke={C.edgeDraw}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g className="nodes-layer">
        {layout.nodes.map(n => (
          <g key={n.id} className={`tree-node node-${n.id}`} transform={`translate(${n.x}, ${n.y})`}>
            <circle
              className={`tree-circle circle-${n.id}`}
              r="20"
              fill={C.node}
              stroke={C.nodeS}
              strokeWidth="1.5"
            />
            <text y="5" textAnchor="middle" fill={C.txt} fontSize="12" fontWeight="500">
              {n.id}
            </text>
          </g>
        ))}
      </g>
      <circle className="traverse-dot" r="7" fill={C.active} opacity="0" cx="0" cy="0" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  AVL Visual — handles its own GSAP timeline
// ─────────────────────────────────────────────────────────────────────────────

interface AVLVisualProps {
  layout: LayoutResult;
  replayKey: number;
  speed: number;
  highlightPath: number[];
}

function AVLVisual({ layout, replayKey, speed, highlightPath }: AVLVisualProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useGSAP(() => {
    if (!layout.nodes.length) return;

    gsap.set(".tree-node", { scale: 0, transformOrigin: "center center" });
    gsap.set(".tree-link", { drawSVG: "0% 0%" });
    gsap.set(".tree-circle", { fill: C.node, stroke: C.nodeS });

    const tl = gsap.timeline({ timeScale: speed });

    layout.nodes.forEach((n, i) => {
      tl.to(`.node-${n.id}`, { scale: 1, duration: 0.3, ease: "back.out(1.5)" }, i * 0.07);
    });

    layout.links.forEach((l, i) => {
      tl.to(`.link-${l.id}`, {
        drawSVG: "0% 100%", duration: 0.3, ease: "power2.inOut"
      }, 0.5 + i * 0.06);
    });

    // Highlight search/insert path
    if (highlightPath.length) {
      const baseT = 0.5 + layout.links.length * 0.06 + 0.3;
      highlightPath.forEach((v, i) => {
        const found = i === highlightPath.length - 1;
        tl.to(`.circle-${v}`, {
          fill: found ? C.search : C.active,
          duration: 0.25,
        }, baseT + i * 0.3);
      });
    }

  }, { dependencies: [layout, replayKey, speed, highlightPath], scope: svgRef, revertOnUpdate: true });

  return (
    <svg ref={svgRef} className="w-full h-auto block overflow-visible" viewBox="0 0 680 300">
      <g className="edges-layer">
        {layout.links.map(l => (
          <path
            key={l.id}
            className={`tree-link link-${l.id}`}
            d={l.d}
            stroke={C.edgeDraw}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />
        ))}
      </g>
      <g className="nodes-layer">
        {layout.nodes.map(n => (
          <g key={n.id} className={`tree-node node-${n.id}`} transform={`translate(${n.x}, ${n.y})`}>
            <circle
              className={`tree-circle circle-${n.id}`}
              r="17"
              fill={C.node}
              stroke={C.nodeS}
              strokeWidth="1.5"
            />
            <text y="4" textAnchor="middle" fill={C.txt} fontSize="10" fontWeight="500">
              {n.id}
            </text>
            {/* Height badge */}
            <text y="-22" textAnchor="middle" fill={C.cmp} fontSize="9" opacity="0.8">
              h{n.meta?.height}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────────────────────

const TreePage = () => {
  const [mode, setMode] = useState<Mode>("bst");
  const [speed, setSpeed] = useState(1);
  const [showCode, setShowCode] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [highlightPath, setHighlightPath] = useState<number[]>([]);

  // ── Separate tree state per mode ─────────────────────────────────────────
  const [bstTree, setBstTree] = useState<BSTNode>(DEFAULT_BST);
  const [avlTree, setAvlTree] = useState<AVLNode>(DEFAULT_AVL);

  // ── Layout (D3 computation, no DOM) ──────────────────────────────────────
  const layout = useMemo<LayoutResult>(() => {
    if (mode === "bst") {
      const d3Root = bstToD3(bstTree);
      return d3Root ? computeBSTLayout(d3Root) : { nodes: [], links: [] };
    } else {
      const d3Root = avlToD3(avlTree);
      return d3Root ? computeAVLLayout(d3Root) : { nodes: [], links: [] };
    }
  }, [mode, bstTree, avlTree]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const parseInput = (): number | null => {
    const n = parseInt(inputValue, 10);
    if (isNaN(n) || n < 0 || n > 999) {
      setStatusMsg("⚠ Enter a whole number 0–999");
      return null;
    }
    return n;
  };

  const triggerReplay = () => setReplayKey(k => k + 1);

  const handleInsert = () => {
    const n = parseInput();
    if (n === null) return;
    if (mode === "bst") setBstTree(prev => bstInsert(prev, n));
    else              setAvlTree(prev => avlInsert(prev, n));
    setHighlightPath([]);
    setStatusMsg(`✓ Inserted ${n}`);
    setInputValue("");
    triggerReplay();
  };

  const handleDelete = () => {
    const n = parseInput();
    if (n === null) return;
    if (mode === "bst") setBstTree(prev => bstDelete(prev, n) ?? DEFAULT_BST);
    else              setAvlTree(prev => avlDelete(prev, n) ?? DEFAULT_AVL);
    setHighlightPath([]);
    setStatusMsg(`✓ Deleted ${n}`);
    setInputValue("");
    triggerReplay();
  };

  const handleSearch = () => {
    const n = parseInput();
    if (n === null) return;
    const path = mode === "bst"
      ? bstSearch(bstTree, n)
      : avlSearch(avlTree, n);

    const found = path.length > 0 && path[path.length - 1] === n;
    setHighlightPath(path);
    setStatusMsg(found
      ? `✓ Found ${n} (path: ${path.join(" → ")})`
      : `✗ ${n} not found (searched: ${path.join(" → ")})`
    );
    triggerReplay();
  };

  const handleReset = () => {
    if (mode === "bst") setBstTree(DEFAULT_BST);
    else              setAvlTree(DEFAULT_AVL);
    setHighlightPath([]);
    setStatusMsg("Reset to default tree");
    triggerReplay();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleInsert();
  };

  // ── Inorder display (BST only) ────────────────────────────────────────────
  const inorderStr = mode === "bst"
    ? bstInorder(bstTree).join(", ")
    : "";

  return (
    <div className="w-full min-h-screen bg-slate-950 text-white p-4 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-lg font-semibold text-slate-200">Tree Visualiser</h1>
          <div className="flex gap-2">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id); setHighlightPath([]); setStatusMsg(""); triggerReplay(); }}
                className={`text-sm px-4 py-1.5 rounded-lg border-[0.5px] transition-all
                  ${mode === m.id
                    ? "border-blue-500 bg-blue-600 text-white font-medium"
                    : "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <input
            placeholder="0–999"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-24 px-3 h-9 bg-slate-800 text-white rounded-lg border border-slate-600 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button onClick={handleInsert}
            className="h-9 px-3 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm border border-green-700 transition-all">
            Insert
          </button>
          <button onClick={handleDelete}
            className="h-9 px-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-sm border border-orange-700 transition-all">
            Delete
          </button>
          <button onClick={handleSearch}
            className="h-9 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm border border-violet-700 transition-all">
            Search
          </button>
          <button onClick={handleReset}
            className="h-9 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm border border-slate-600 transition-all">
            Reset
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-xs text-slate-400">Speed</label>
            <input
              type="range" min={0.25} max={2} step={0.25} value={speed}
              onChange={e => setSpeed(+e.target.value)}
              className="w-20 accent-blue-500 cursor-pointer"
            />
            <span className="text-xs text-slate-400 min-w-[28px]">{speed}x</span>
            <button onClick={triggerReplay}
              className="h-9 px-3 rounded-md border border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700 text-sm transition-all">
              ↺
            </button>
            <button
              onClick={() => setShowCode(s => !s)}
              className={`h-9 px-3 rounded-md border text-sm transition-all
                ${showCode ? "border-blue-500 bg-blue-900 text-blue-300" : "border-slate-600 bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {showCode ? "Hide code" : "Show code"}
            </button>
          </div>
        </div>

        {/* ── Status / Info ── */}
        <div className="flex justify-between items-center mb-3 text-xs flex-wrap gap-1">
          <span className="text-slate-400">{INFO[mode]}</span>
          {statusMsg && (
            <span className={`font-mono px-2 py-0.5 rounded ${statusMsg.startsWith("✓") ? "text-green-400" : statusMsg.startsWith("✗") ? "text-red-400" : "text-yellow-400"}`}>
              {statusMsg}
            </span>
          )}
        </div>

        {/* ── SVG Canvas ── */}
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden p-1">
          {mode === "bst" ? (
            <BSTVisual layout={layout} replayKey={replayKey} speed={speed} highlightPath={highlightPath} />
          ) : (
            <AVLVisual layout={layout} replayKey={replayKey} speed={speed} highlightPath={highlightPath} />
          )}
        </div>

        {/* ── In-order display (BST) ── */}
        {mode === "bst" && inorderStr && (
          <div className="mt-2 text-xs text-slate-500 font-mono">
            In-order: <span className="text-slate-300">{inorderStr}</span>
          </div>
        )}

        {/* ── Legend ── */}
        <div className="flex gap-4 mt-4 flex-wrap">
          {[
            { color: C.node, label: "unvisited" },
            { color: C.vis, label: "visited" },
            { color: C.active, label: "cursor / path" },
            { color: C.search, label: "found" },
            { color: C.edgeDraw, label: "edge" },
            { color: C.cmp, label: "AVL height" },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
        </div>

        {/* ── Code panel ── */}
        {showCode && <CodePanel mode={mode} />}
      </div>
    </div>
  );
};

export default TreePage;