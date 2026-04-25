import React, { useRef, useState, useMemo } from "react";
// Assuming you have your GSAP and DrawSVG setup here:
import gsap from "@/gsapSetup"; 
import { useGSAP } from "@gsap/react";
import * as d3 from "d3";

const C = {
  node: "var(--algo-node)", nodeS: "var(--algo-node-stroke)",
  vis: "var(--algo-node-visited)", visS: "var(--algo-node-visited-stroke)",
  active: "var(--algo-node-active)",
  edgeDraw: "var(--algo-edge)",
  cmp: "var(--algo-compare)",
  txt: "var(--algo-text)",
};

const MODES = [
  { id: "bst", label: "Min-Heap Tree" },
  { id: "avl", label: "Max-Heap Tree" }
];

const INFO = {
  bst: "D3 tree layout → node positions. GSAP timeline → sequential insert animation.",
  avl: "D3 cluster layout → balanced spacing. GSAP DrawSVG reveals edges.",
  graph: "D3 force simulation → physics-based positions. GSAP DrawSVG + MotionPath.",
  sort: "D3 scaleLinear → bar heights. D3 scaleBand → bar x positions.",
};

const CODE = {
  bst: `// D3 tree layout computes (x, y) for each node
const layout = d3.tree().size([620, 210]);
const hier   = d3.hierarchy(root);
layout(hier);  // ← D3 fills in .x and .y

// React renders SVG elements based on state
// GSAP DrawSVG reveals each cubic-bezier edge path
tl.to(".link-30-20", { drawSVG: "0% 100%", duration: 0.4 });

// Nodes pop in with back.out easing
tl.to(".node-50", { scale: 1, duration: 0.4, ease: "back.out(1.7)" });`,

  avl: `// D3 cluster layout — dendrogram with uniform leaf depth
const layout = d3.cluster().size([640, 220]);
const hier   = d3.hierarchy(toHier(root));
layout(hier);

// Nodes stagger in, then edges draw after
tl = gsap.timeline({ timeScale: speed });
tl.to(".tree-node", { scale: 1, stagger: 0.08, ease: "back.out(1.5)" });
tl.to(".tree-link", { drawSVG: "0% 100%", stagger: 0.07, ease: "power2.inOut" }, 0.5);`
};

// ── Code panel ────────────────────────────────────────────────────────────────
function CodePanel({ mode }: { mode: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE[mode as keyof typeof CODE]).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div className="mt-8 rounded-xl border-[0.5px] border-algo-border overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-6 py-3 border-b-[0.5px] border-algo-border bg-algo-panel-soft">
        <span className="text-sm font-mono text-algo-shell-fg">{mode}.js — key logic</span>
        <button
          onClick={handleCopy}
          className="algo-btn-base algo-btn-neutral text-xs px-3 py-1.5"
        >
          {copied ? "✓ copied" : "copy"}
        </button>
      </div>
      <pre className="m-0 px-6 py-4 font-mono text-xs leading-relaxed text-algo-shell-fg overflow-x-auto whitespace-pre max-h-[340px] bg-algo-panel-bg">
        <code>{CODE[mode as keyof typeof CODE]}</code>
      </pre>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const HeapPage = () => {
  const [mode, setMode] = useState("bst");
  const [speed, setSpeed] = useState(1);
  const [showCode, setShowCode] = useState(true);
  const [replayKey, setReplayKey] = useState(0); 
  
  const containerRef = useRef<SVGSVGElement>(null);

  // 1. React declarative data fetching via D3 calculations (No DOM touching!)
  const treeData = useMemo(() => {
    if (mode === "bst") {
      const root = { val: 50, children: [
        { val: 30, children: [{ val: 20 }, { val: 40 }] },
        { val: 70, children: [{ val: 60 }, { val: 80 }] },
      ]};
      const hier = d3.hierarchy(root);
      d3.tree().size([620, 210])(hier);
      
      return {
        nodes: hier.descendants().map(n => ({ id: n.data.val, x: n.x + 30, y: n.y + 40 })),
        links: hier.links().map(l => {
          const p1 = { x: l.source.x + 30, y: l.source.y + 40 };
          const p2 = { x: l.target.x + 30, y: l.target.y + 40 };
          const mid = (p1.y + p2.y) / 2;
          return {
            id: `${l.source.data.val}-${l.target.data.val}`,
            d: `M${p1.x},${p1.y} C${p1.x},${mid} ${p2.x},${mid} ${p2.x},${p2.y}`
          };
        })
      };
    } else { // avl
      const root = { v: 44, c: [
        { v: 17, c: [{ v: 8, c: [] }, { v: 32, c: [{ v: 28, c: [] }, { v: 38, c: [] }] }] },
        { v: 62, c: [{ v: 50, c: [] }, { v: 78, c: [{ v: 72, c: [] }, { v: 88, c: [] }] }] },
      ]};
      const toHier = (n: any) => ({ name: n.v, children: n.c?.map(toHier) });
      const hier = d3.hierarchy(toHier(root));
      d3.cluster().size([640, 220])(hier);
      
      return {
        nodes: hier.descendants().map(n => ({ id: n.data.name, x: n.x + 20, y: n.y + 30 })),
        links: hier.links().map(l => {
          const p1 = { x: l.source.x + 20, y: l.source.y + 30 };
          const p2 = { x: l.target.x + 20, y: l.target.y + 30 };
          const pathGenerator = d3.linkVertical().x((d: any) => d[0]).y((d: any) => d[1]);
          return {
            id: `${l.source.data.name}-${l.target.data.name}`,
            d: pathGenerator({ source: [p1.x, p1.y], target: [p2.x, p2.y] }) as string
          };
        })
      };
    }
  }, [mode]);

  // 2. GSAP handles only animations using useGSAP for auto-cleanup
  useGSAP(() => {
    if (!treeData.nodes.length) return;

    const tl = gsap.timeline({ timeScale: speed });

    // Initial setup
    gsap.set(".tree-node", { scale: 0, transformOrigin: "center center" });
    gsap.set(".tree-link", { drawSVG: "0% 0%" });
    gsap.set(".tree-circle", { fill: C.node, stroke: C.nodeS });
    gsap.set(".traverse-dot", { opacity: 0 });

    if (mode === "bst") {
      let t = 0;
      const insertOrder = [50, 30, 70, 20, 40, 60, 80];
      const edgeOrder = [null, null, null, "30-20", "30-40", "70-60", "70-80"];

      // Nodes & Edges Insert
      insertOrder.forEach((v, i) => {
        if (edgeOrder[i]) { 
          tl.to(`.link-${edgeOrder[i]}`, { drawSVG: "0% 100%", duration: 0.4, ease: "power2.inOut" }, t); 
          t += 0.3; 
        }
        tl.to(`.node-${v}`, { scale: 1, duration: 0.4, ease: "back.out(1.7)" }, t);
        t += 0.45;
      });
      tl.to(`.link-50-30`, { drawSVG: "0% 100%", duration: 0.4, ease: "power2.inOut" }, 0.45);
      tl.to(`.link-50-70`, { drawSVG: "0% 100%", duration: 0.4, ease: "power2.inOut" }, 0.6);

      // Dot Traversal
      t += 0.3;
      tl.to(".traverse-dot", { opacity: 1, duration: 0.2 }, t);
      
      const inorder = [20, 30, 40, 50, 60, 70, 80];
      inorder.forEach((v, i) => {
        const p = treeData.nodes.find(n => n.id === v);
        if (p) {
          tl.to(".traverse-dot", { cx: p.x, cy: p.y, duration: i === 0 ? 0.01 : 0.5, ease: "power2.inOut" }, t);
          t += i === 0 ? 0 : 0.4;
          tl.to(`.circle-${v}`, { fill: C.vis, stroke: C.visS, duration: 0.2 }, t);
          t += 0.35;
        }
      });
      tl.to(".traverse-dot", { opacity: 0, duration: 0.3 }, t);

    } else if (mode === "avl") {
      // AVL Timeline
      treeData.nodes.forEach((n, i) => {
        tl.to(`.node-${n.id}`, { scale: 1, duration: 0.35, ease: "back.out(1.5)" }, i * 0.08);
      });
      treeData.links.forEach((l, i) => {
        tl.to(`.link-${l.id}`, { drawSVG: "0% 100%", duration: 0.35, ease: "power2.inOut" }, 0.5 + i * 0.07);
      });
    }

  }, { dependencies: [mode, replayKey, speed, treeData], scope: containerRef });

  return (


    <div className="w-full h-full bg-algo-shell text-algo-shell-fg font-audiowide">
          <div className="gap-2 p-4 bg-algo-panel-bg border-[0.5px] border-algo-border rounded-xl">
      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-4 m-2 flex-wrap">
        <div className="flex items-center gap-2">
          <input placeholder="Enter Number" className="h-9 w-32 bg-algo-input-bg border-algo-input-border text-algo-input-fg placeholder:text-algo-shell-fg/50 focus-visible:ring-0 focus-visible:border-brand font-mono text-sm rounded-lg px-3"/>
          <button className="algo-btn-base algo-btn-primary h-9 px-4 font-mono text-sm">
            Enter Number
          </button>
        </div>
        {MODES.map(m => (
          <button 
            key={m.id} 
            onClick={() => { setMode(m.id); setReplayKey(k => k + 1); }}
            className={`text-sm px-4 py-1.5 rounded-lg border-[0.5px] transition-all
              ${mode === m.id 
                ? "border-brand bg-brand/10 text-brand font-medium" 
                : "border-algo-border bg-algo-panel-soft text-algo-shell-fg hover:bg-algo-panel-bg"}`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Controls ── */}
      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <label className="text-sm text-algo-shell-fg">Speed</label>
        <input 
          type="range" min={0.25} max={2} step={0.25} value={speed}
          onChange={e => setSpeed(+e.target.value)} 
          className="w-24 accent-brand cursor-pointer" 
        />
        <span className="text-sm text-algo-shell-fg min-w-[28px]">{speed}x</span>
        
        <button 
          onClick={() => setReplayKey(k => k + 1)}
          className="algo-btn-base algo-btn-neutral px-3 py-1.5 text-sm"
        >
          ↺ Replay
        </button>
        
        <button 
          onClick={() => setShowCode(s => !s)}
          className={`algo-btn-base px-3 py-1.5 text-sm ml-auto
            ${showCode ? "algo-btn-primary" : "algo-btn-neutral"}`}
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
      </div>

      {/* ── Info ── */}
      <div className="text-sm text-algo-shell-fg mb-4 h-5 opacity-70">
        {INFO[mode as keyof typeof INFO]}
      </div>

      {/* ── React declarative SVG Canvas ── */}
      <div className="bg-algo-canvas-bg rounded-xl border-[0.5px] border-algo-canvas-border overflow-hidden">
        <svg ref={containerRef} className="w-full h-auto block overflow-visible" viewBox="0 0 680 300">
          
          <g className="edges-layer">
            {treeData.links.map(l => (
              <path
                key={l.id}
                className={`tree-link link-${l.id}`}
                d={l.d}
                stroke={C.edgeDraw}
                strokeWidth={mode === 'bst' ? "2" : "1.5"}
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>

          <g className="nodes-layer">
            {treeData.nodes.map(n => (
              <g 
                key={n.id} 
                className={`tree-node node-${n.id}`} 
                transform={`translate(${n.x}, ${n.y})`}
              >
                <circle
                  className={`tree-circle circle-${n.id}`}
                  r={mode === 'bst' ? "20" : "17"}
                  fill={C.node}
                  stroke={C.nodeS}
                  strokeWidth="1.5"
                />
                <text
                  y="5"
                  textAnchor="middle"
                  fill={C.txt}
                  fontSize={mode === 'bst' ? "12" : "11"}
                  fontWeight="500"
                >
                  {n.id}
                </text>
              </g>
            ))}
          </g>

          {/* Interactive traversal dot */}
          {mode === "bst" && (
            <circle className="traverse-dot" r="7" fill={C.active} opacity="0" />
          )}
        </svg>
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        {[
          { color: C.node, label: "unvisited" },
          { color: C.vis, label: "visited / sorted" },
          { color: C.active, label: "cursor / active" },
          { color: C.edgeDraw, label: "edge draw" },
          { color: C.cmp, label: "comparing" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-2 text-xs text-algo-shell-fg">
            <div className="w-2.5 h-2.5 rounded-full border border-algo-border" style={{ backgroundColor: l.color }} />
            {l.label}
          </div>
        ))}
      </div>

      {/* ── Code Box ── */}
      {showCode && <CodePanel mode={mode} />}
    </div>

    </div>

  );
};

export default HeapPage;