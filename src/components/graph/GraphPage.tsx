

// import { useEffect, useRef, useState, useCallback } from 'react';
// import { gsap } from 'gsap';
// import { useGSAP } from '@gsap/react';
// import DrawSVGPlugin from 'gsap/DrawSVGPlugin';
// import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
// import { Draggable } from 'gsap/Draggable';
// import * as d3 from 'd3';

// gsap.registerPlugin(useGSAP, DrawSVGPlugin, MotionPathPlugin, Draggable);

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface SimNode extends d3.SimulationNodeDatum {
//   id: number;
//   x: number;
//   y: number;
// }

// interface WeightedLink extends d3.SimulationLinkDatum<SimNode> {
//   source: SimNode;
//   target: SimNode;
//   weight: number;
//   domId: string; // stable DOM id built after D3 resolves source/target objects
// }

// // ─── Constants ────────────────────────────────────────────────────────────────

// const NODE_COUNT   = 12;
// const NODE_RADIUS  = 22;
// const WIDTH        = 920;
// const HEIGHT       = 480;

// const PATH_STROKE    = '#f59e0b';
// const SIGNAL_FILL    = '#fbbf24';
// const DEFAULT_STROKE = 'rgba(148,163,184,0.30)';
// const EDGE_INSET     = NODE_RADIUS + 8;

// // ─── Dijkstra ─────────────────────────────────────────────────────────────────

// interface AdjEntry { to: number; weight: number; linkIndex: number }

// function dijkstra(
//   adj: AdjEntry[][],
//   src: number,
//   dst: number,
//   n: number,
// ): { path: number[]; linkIndices: number[] } {
//   const dist  = Array(n).fill(Infinity);
//   const prev  = Array(n).fill(-1);
//   const prevL = Array(n).fill(-1);
//   const vis   = new Set<number>();
//   dist[src] = 0;

//   for (let iter = 0; iter < n; iter++) {
//     let u = -1;
//     for (let i = 0; i < n; i++) {
//       if (!vis.has(i) && (u === -1 || dist[i] < dist[u])) u = i;
//     }
//     if (u === -1 || dist[u] === Infinity) break;
//     vis.add(u);
//     for (const { to, weight, linkIndex } of adj[u]) {
//       if (dist[u] + weight < dist[to]) {
//         dist[to]  = dist[u] + weight;
//         prev[to]  = u;
//         prevL[to] = linkIndex;
//       }
//     }
//   }

//   if (dist[dst] === Infinity) return { path: [], linkIndices: [] };

//   const path: number[] = [];
//   const linkIndices: number[] = [];
//   for (let cur = dst; cur !== -1; cur = prev[cur]) {
//     path.unshift(cur);
//     if (prevL[cur] !== -1) linkIndices.unshift(prevL[cur]);
//   }
//   return { path, linkIndices };
// }

// function getShortEdgePath(source: SimNode, target: SimNode, inset = EDGE_INSET) {
//   const dx = (target.x ?? 0) - (source.x ?? 0);
//   const dy = (target.y ?? 0) - (source.y ?? 0);
//   const length = Math.hypot(dx, dy);

//   if (length <= inset * 2 || length === 0) {
//     return `M ${source.x ?? 0} ${source.y ?? 0} L ${target.x ?? 0} ${target.y ?? 0}`;
//   }

//   const offsetX = (dx / length) * inset;
//   const offsetY = (dy / length) * inset;

//   return `M ${(source.x ?? 0) + offsetX} ${(source.y ?? 0) + offsetY} L ${(target.x ?? 0) - offsetX} ${(target.y ?? 0) - offsetY}`;
// }

// function getEdgeLabelPosition(source: SimNode, target: SimNode) {
//   return {
//     x: ((source.x ?? 0) + (target.x ?? 0)) / 2,
//     y: ((source.y ?? 0) + (target.y ?? 0)) / 2 - 7,
//   };
// }


// const GraphPage = () => {
//   const [graphVersion, setGraphVersion] = useState(0);
//   const svgRef    = useRef<SVGSVGElement>(null);
//   const simRef    = useRef<d3.Simulation<SimNode, WeightedLink> | null>(null);
//   const nodesRef  = useRef<SimNode[]>([]);
//   const linksRef  = useRef<WeightedLink[]>([]);
//   const adjRef    = useRef<AdjEntry[][]>([]);
//   const edgeDataRef = useRef<{ key: string; domId: string; weight: number }[]>([]);

//   const [src, setSrc]             = useState(0);
//   const [dst, setDst]             = useState(NODE_COUNT - 1);
//   const [pathInfo, setPathInfo]   = useState<{ path: number[]; cost: number } | null>(null);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [ready, setReady]         = useState(false);
//   const traversalTlRef            = useRef<gsap.core.Timeline | null>(null);

//   // Stable node colour/id array — never changes
//   const initialNodes = useRef(
//     Array.from({ length: NODE_COUNT }, (_, i) => ({
//       id: i,
//       color: `hsl(${(i * 29 + 200) % 360}, 65%, 58%)`,
//     })),
//   ).current;

//   const generateGraph = useCallback(() => {
//     traversalTlRef.current?.kill();
//     setIsAnimating(false);
//     setPathInfo(null);
//     setReady(false);
//     setSrc(0);
//     setDst(NODE_COUNT - 1);
//     simRef.current?.stop();
//     setGraphVersion((currentVersion) => currentVersion + 1);
//   }, []);

//   // ── 1. D3 simulation ───────────────────────────────────────────────────────
//   useEffect(() => {
//     const nodes: SimNode[] = initialNodes.map((n) => ({
//       ...n,
//       x: Math.random() * (WIDTH  - NODE_RADIUS * 2) + NODE_RADIUS,
//       y: Math.random() * (HEIGHT - NODE_RADIUS * 2) + NODE_RADIUS,
//     }));

//     // Weighted edges: backbone chain + random extras, no duplicates
//     const seen = new Set<string>();
//     const rawLinks: { source: number; target: number; weight: number }[] = [];
//     const addEdge = (a: number, b: number) => {
//       const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
//       if (seen.has(key) || a === b) return;
//       seen.add(key);
//       rawLinks.push({ source: a, target: b, weight: Math.floor(Math.random() * 9) + 1 });
//     };
//     for (let i = 0; i < NODE_COUNT; i++) {
//       if (i < NODE_COUNT - 1) addEdge(i, i + 1);
//       addEdge(i, Math.floor(Math.random() * NODE_COUNT));
//       addEdge(i, Math.floor(Math.random() * NODE_COUNT));
//     }

//     // Store for JSX skeleton (needed before simulation resolves objects)
//     edgeDataRef.current = rawLinks.map((l) => ({
//       key:    `${l.source}-${l.target}`,
//       domId:  `edge-${l.source}-${l.target}`,
//       weight: l.weight,
//     }));

//     const sim = d3
//       .forceSimulation<SimNode>(nodes)
//       .force('link',
//         d3.forceLink<SimNode, WeightedLink>(rawLinks as any)
//           .id((d) => d.id)
//           .distance((l: any) => 80 + l.weight * 8),
//       )
//       .force('charge',    d3.forceManyBody<SimNode>().strength(-200))
//       .force('center',    d3.forceCenter(WIDTH / 2, HEIGHT / 2))
//       .force('collision', d3.forceCollide<SimNode>().radius(NODE_RADIUS + 10))
//       .force('bounds', () => {
//         nodes.forEach((n) => {
//           n.x = Math.max(NODE_RADIUS, Math.min(WIDTH  - NODE_RADIUS, n.x ?? 0));
//           n.y = Math.max(NODE_RADIUS, Math.min(HEIGHT - NODE_RADIUS, n.y ?? 0));
//         });
//       });

//     simRef.current  = sim;
//     nodesRef.current = nodes;

//     const resolvedLinks = (sim.force('link') as d3.ForceLink<SimNode, WeightedLink>).links();
//     resolvedLinks.forEach((l) => {
//       (l as any).domId = `edge-${(l.source as SimNode).id}-${(l.target as SimNode).id}`;
//     });
//     linksRef.current = resolvedLinks;

//     // Adjacency list (undirected)
//     const adj: AdjEntry[][] = Array.from({ length: NODE_COUNT }, () => []);
//     resolvedLinks.forEach((l, idx) => {
//       const s = (l.source as SimNode).id;
//       const t = (l.target as SimNode).id;
//       adj[s].push({ to: t, weight: l.weight, linkIndex: idx });
//       adj[t].push({ to: s, weight: l.weight, linkIndex: idx });
//     });
//     adjRef.current = adj;

//     // Tick: GSAP set() writes directly to DOM — no React re-render
//     sim.on('tick', () => {
//       const svg = svgRef.current;
//       if (!svg) return;

//       nodes.forEach((n) => {
//         const g = svg.querySelector<SVGGElement>(`#node-${n.id}`);
//         if (g) gsap.set(g, { x: n.x, y: n.y });
//       });

//       resolvedLinks.forEach((l) => {
//         const path = svg.querySelector<SVGPathElement>(`#${(l as any).domId}`);
//         if (!path) return;
//         const s = l.source as SimNode;
//         const t = l.target as SimNode;
//         gsap.set(path, { attr: { d: getShortEdgePath(s, t) } });

//         const label = svg.querySelector<SVGTextElement>(`#label-${(l as any).domId}`);
//         if (label) {
//           gsap.set(label, {
//             attr: getEdgeLabelPosition(s, t),
//           });
//         }
//       });
//     });

//     // Flip ready flag after one tick so edgeData populates the JSX
//     const readyTimer = window.setTimeout(() => setReady(true), 0);

//     return () => {
//       window.clearTimeout(readyTimer);
//       sim.stop();
//     };
//   }, [graphVersion, initialNodes]);

//   // ── 2. GSAP entrance + Draggable ──────────────────────────────────────────
//   useGSAP(() => {
//     if (!svgRef.current) return;

//     gsap.from('.graph-edge', {
//       drawSVG: '0%', duration: 1.1, stagger: 0.04, ease: 'power2.inOut', delay: 0.4,
//     });
//     gsap.from('.node-circle', {
//       scale: 0, transformOrigin: '50% 50%',
//       stagger: 0.06, duration: 0.5, ease: 'back.out(1.7)', delay: 0.2,
//     });
//     gsap.from('.weight-label', {
//       opacity: 0, duration: 0.4, stagger: 0.02, delay: 1.3,
//     });

//     gsap.delayedCall(0.08, () => {
//       const sim = simRef.current;
//       if (!sim) return;

//       Draggable.create('.node-group', {
//         type: 'x,y',
//         bounds: svgRef.current ?? undefined,

//         onDragStart(this: Draggable) {
//           const id   = parseInt((this.target as SVGElement).dataset.nodeId ?? '-1', 10);
//           const node = nodesRef.current.find((n) => n.id === id);
//           if (!node) return;
//           node.fx = node.x;
//           node.fy = node.y;
//           sim.alphaTarget(0.1).restart();
//           gsap.to(this.target.querySelector('circle'), {
//             scale: 1.28, transformOrigin: '50% 50%', duration: 0.18, ease: 'power2.out',
//           });
//         },

//         onDrag(this: Draggable) {
//           const id   = parseInt((this.target as SVGElement).dataset.nodeId ?? '-1', 10);
//           const node = nodesRef.current.find((n) => n.id === id);
//           if (!node) return;
//           node.fx = this.x;
//           node.fy = this.y;
//         },

//         onDragEnd(this: Draggable) {
//           const id   = parseInt((this.target as SVGElement).dataset.nodeId ?? '-1', 10);
//           const node = nodesRef.current.find((n) => n.id === id);
//           if (!node) return;
//           node.fx = null;
//           node.fy = null;
//           sim.alphaTarget(0).restart();
//           gsap.to(this.target.querySelector('circle'), {
//             scale: 1, transformOrigin: '50% 50%', duration: 0.4, ease: 'elastic.out(1, 0.4)',
//           });
//         },
//       });
//     });
//   }, { scope: svgRef, dependencies: [] });

//   // ── 3. Reset helper ────────────────────────────────────────────────────────
//   const reset = useCallback(() => {
//     traversalTlRef.current?.kill();
//     const svg = svgRef.current;
//     if (!svg) return;
//     svg.querySelectorAll('.path-signal').forEach((el) => el.remove());
//     gsap.to('.graph-edge',  { stroke: DEFAULT_STROKE, strokeWidth: 2, opacity: 1, duration: 0.4 });
//     gsap.to('.node-circle', { stroke: '#ffffff', strokeWidth: 2, duration: 0.3 });
//     initialNodes.forEach((n) => {
//       gsap.to(`#node-${n.id} circle`, { fill: n.color, scale: 1, duration: 0.3 });
//     });
//     setPathInfo(null);
//     setIsAnimating(false);
//   }, [initialNodes]);

//   // ── 4. Dijkstra + GSAP traversal timeline ─────────────────────────────────
//   const runDijkstra = useCallback(() => {
//     const svg   = svgRef.current;
//     const adj   = adjRef.current;
//     const links = linksRef.current;
//     if (!svg || !adj.length) return;

//     traversalTlRef.current?.kill();
//     svg.querySelectorAll('.path-signal').forEach((el) => el.remove());

//     // Reset visual state
//     gsap.set('.graph-edge',  { stroke: DEFAULT_STROKE, strokeWidth: 2, opacity: 1 });
//     gsap.set('.node-circle', { stroke: '#ffffff', strokeWidth: 2 });
//     initialNodes.forEach((n) => gsap.set(`#node-${n.id} circle`, { fill: n.color, scale: 1 }));

//     const { path, linkIndices } = dijkstra(adj, src, dst, NODE_COUNT);

//     if (!path.length) {
//       setPathInfo({ path: [], cost: 0 });
//       return;
//     }

//     const cost = linkIndices.reduce((acc, li) => acc + links[li].weight, 0);
//     setPathInfo({ path, cost });
//     setIsAnimating(true);

//     // ── Build step-by-step timeline ──────────────────────────────────────────
//     //
//     // Each hop:
//     //   1. DrawSVG grows the path edge stroke (0% → 100%)  ← DrawSVGPlugin
//     //   2. A signal dot travels along the edge              ← MotionPathPlugin
//     //   3. Destination node pulses on arrival
//     //
//     // All sequenced as one gsap.timeline() — pauseable, reversible, killable.

//     const tl = gsap.timeline({
//       defaults: { ease: 'power2.inOut' },
//       onComplete: () => setIsAnimating(false),
//     });
//     traversalTlRef.current = tl;

//     // Dim edges not on the path
//     const pathDomIds = new Set(linkIndices.map((li) => (links[li] as any).domId as string));
//     tl.to(
//       Array.from(svg.querySelectorAll<SVGPathElement>('.graph-edge'))
//         .filter((el) => !pathDomIds.has(el.id)),
//       { opacity: 0.15, duration: 0.3 },
//       0,
//     );

//     // Highlight source node
//     tl.to(`#node-${src} .node-circle`, {
//       stroke: PATH_STROKE, strokeWidth: 4, duration: 0.25,
//     }, 0.1);

//     // Per-hop animation
//     linkIndices.forEach((li, hop) => {
//       const link   = links[li];
//       const domId  = (link as any).domId as string;
//       const edgeEl = svg.querySelector<SVGPathElement>(`#${domId}`);
//       if (!edgeEl) return;
//       const shortPath = getShortEdgePath(link.source as SimNode, link.target as SimNode);

//       const nextNode = path[hop + 1];
//       const label    = `hop${hop}`;
//       tl.addLabel(label);

//       // 1. DrawSVG — stroke animates from 0% to 100% along the edge
//       tl.set(`#${domId}`, { stroke: PATH_STROKE, strokeWidth: 3.5 }, label)
//         .fromTo(
//           `#${domId}`,
//           { drawSVG: '0%' },
//           { drawSVG: '100%', duration: 0.5 },
//           label,
//         );

//       gsap.set(`#${domId}`, { attr: { d: shortPath } });

//       // 2. MotionPath signal dot
//       const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
//       dot.setAttribute('r', '7');
//       dot.setAttribute('fill', SIGNAL_FILL);
//       dot.setAttribute('class', 'path-signal');
//       dot.setAttribute('filter', 'url(#glow)');
//       svg.appendChild(dot);

//       tl.to(dot, {
//         motionPath: {
//           path:        edgeEl,
//           align:       edgeEl,
//           alignOrigin: [0.5, 0.5],
//           autoRotate:  false,
//         },
//         duration: 0.5,
//         ease:     'power1.inOut',
//       }, label);

//       // 3. Destination node pulse
//       tl.to(`#node-${nextNode} .node-circle`, {
//         scale: 1.35, transformOrigin: '50% 50%', duration: 0.16, ease: 'power2.out',
//       }, `>-0.04`)
//         .to(`#node-${nextNode} .node-circle`, {
//           scale: 1, stroke: PATH_STROKE, strokeWidth: 4, duration: 0.28, ease: 'elastic.out(1,0.5)',
//         }, '>');
//     });

//     // Final destination flash
//     tl.to(`#node-${dst} .node-circle`, {
//       scale: 1.5, fill: PATH_STROKE, transformOrigin: '50% 50%',
//       duration: 0.22, ease: 'power3.out',
//     }, '>')
//       .to(`#node-${dst} .node-circle`, {
//         scale: 1, fill: initialNodes[dst].color,
//         duration: 0.5, ease: 'elastic.out(1, 0.45)',
//       }, '>');

//   }, [src, dst, initialNodes, reset]);

//   // ── Render ─────────────────────────────────────────────────────────────────
//   const edgeData = ready ? edgeDataRef.current : [];


//   return (
//     <div>
//     <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl font-sans select-none">

//       {/* Control panel */}
//       <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center gap-3 bg-slate-900/60">

//         <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mr-1">
//           Dijkstra
//         </span>

//         <div className="flex items-center gap-1.5 text-sm">
//           <label className="text-slate-400 text-xs">From</label>
//           <select
//             value={src}
//             onChange={(e) => { reset(); setSrc(Number(e.target.value)); }}
//             className="bg-slate-800 text-slate-100 border border-slate-700 rounded-md px-2 py-1 text-xs"
//           >
//             {initialNodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
//           </select>
//         </div>

//         <div className="flex items-center gap-1.5">
//           <label className="text-slate-400 text-xs">To</label>
//           <select
//             value={dst}
//             onChange={(e) => { reset(); setDst(Number(e.target.value)); }}
//             className="bg-slate-800 text-slate-100 border border-slate-700 rounded-md px-2 py-1 text-xs"
//           >
//             {initialNodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
//           </select>
//         </div>

//         <button
//           onClick={runDijkstra}
//           disabled={isAnimating || src === dst}
//           className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400
//                      disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 transition-colors shadow-sm"
//         >
//           ▶ Run
//         </button>

//         <button
//           onClick={generateGraph}
//           disabled={isAnimating}
//           className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400
//                      disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 transition-colors shadow-sm"
//         >
//           Generate Graph
//         </button>

//         <button
//           onClick={reset}
//           className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 hover:bg-slate-600
//                      text-slate-200 transition-colors"
//         >
//           Reset
//         </button>

//         {pathInfo && pathInfo.path.length > 0 && (
//           <div className="ml-auto flex items-center gap-2 text-xs flex-wrap">
//             <span className="text-slate-500">path</span>
//             <span className="text-amber-400 font-mono font-bold">
//               {pathInfo.path.join(' → ')}
//             </span>
//             <span className="text-slate-600">·</span>
//             <span className="text-slate-500">cost</span>
//             <span className="text-emerald-400 font-mono font-bold">{pathInfo.cost}</span>
//           </div>
//         )}

//         {pathInfo && pathInfo.path.length === 0 && (
//           <span className="ml-auto text-red-400 text-xs">no path found</span>
//         )}

//         {src === dst && (
//           <span className="ml-auto text-amber-600 text-xs">source = target</span>
//         )}
//       </div>

//       {/* SVG canvas — D3 layout + GSAP animation write here directly */}
//       <svg
//         ref={svgRef}
//         width="100%"
//         viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
//         style={{ display: 'block' }}
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <defs>
//           {/* Glow for signal dots */}
//           <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
//             <feGaussianBlur stdDeviation="4" result="blur" />
//             <feMerge>
//               <feMergeNode in="blur" />
//               <feMergeNode in="SourceGraphic" />
//             </feMerge>
//           </filter>
//           {/* Soft node shadow */}
//           <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
//             <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.35" />
//           </filter>
//         </defs>

//         {/* Edges */}
//         <g id="edges-layer">
//           {edgeData.map((e) => (
//             <g key={e.key}>
//               <path
//                 id={e.domId}
//                 className="graph-edge"
//                 d="M 0 0 L 0 0"
//                 fill="none"
//                 stroke={DEFAULT_STROKE}
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 vectorEffect="non-scaling-stroke"
//                 strokeOpacity="0.72"
//               />
//               <text
//                 id={`label-${e.domId}`}
//                 className="weight-label"
//                 x={0} y={0}
//                 textAnchor="middle"
//                 fontSize="9.5"
//                 fontWeight="700"
//                 fill="#64748b"
//                 style={{ pointerEvents: 'none', userSelect: 'none' }}
//               >
//                 {e.weight}
//               </text>
//             </g>
//           ))}
//         </g>

//         {/* Nodes */}
//         <g id="nodes-layer">
//           {initialNodes.map((n) => (
//             <g
//               key={n.id}
//               id={`node-${n.id}`}
//               className="node-group"
//               data-node-id={String(n.id)}
//               style={{ cursor: 'grab' }}
//             >
//               {/* Halo */}
//               <circle cx={0} cy={0} r={NODE_RADIUS + 7} fill={n.color} opacity={0.1} />
//               <circle
//                 className="node-circle"
//                 cx={0} cy={0}
//                 r={NODE_RADIUS}
//                 fill={n.color}
//                 stroke="#f8fafc"
//                 strokeWidth="2.5"
//                 filter="url(#nodeShadow)"
//                 style={{ transformOrigin: '0px 0px' }}
//               />
//               <text
//                 x={0} y={0}
//                 textAnchor="middle"
//                 dominantBaseline="central"
//                 fontSize="11"
//                 fontWeight="700"
//                 fill="white"
//                 style={{ pointerEvents: 'none', userSelect: 'none' }}
//               >
//                 {n.id}
//               </text>
//             </g>
//           ))}
//         </g>
//       </svg>

//       {/* Legend */}
//     </div>
//       </div>
//   );
// }


// export default GraphPage;



import { Select } from "@radix-ui/react-select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useMemo, useState } from "react";
import * as d3 from "d3";
import { useGSAP } from "@gsap/react";


const GraphPage = () => {



  const [algo, setAlgo] = useState("Dijstras Algorithm");
  const [startNode,setStartNode] = useState();
  const [endNode,setEndNode] = useState();


  const algorithms = {
    "Dijstras Algorithm" : ["StartNode","EndPoint"],
    "Kruskal's Algorithm" : ["StartNode","EndPoint"],
    "Prim's Algorithm" : ["StartNode","EndPoint"],
    "Bellaman-Ford Algorithm" : ["StartNode","EndPoint"],
    "Floyd-Warshall Algorithm" : ["StartNode","EndPoint"],
    "Topological Sort" : ["StartNode","EndPoint"],
    "Tarjan's Algorithm" : ["StartNode","EndPoint"],
    "BFS" : ["EndNode"],
    "DFS" : ["StartNode"],



  }



  return (
    <div>
      <div className="nav w-full h-full flex justify-between items-center mt-4 ">
        <div className="left-section flex justify-center items-center gap-2 ml-10 ">
          <input className="border flex justify-center items-center border-white  p-2" placeholder="Enter Number"/>
          <div>
            <Button>Generate Random</Button>
          </div>

        </div>

          <div className="right-section flex justify-center items-center gap-4 mr-10">
                        <Select value={algo} onValueChange={setAlgo}>
              <SelectTrigger className="w-44 bg-algo-select-bg border-algo-select-border text-algo-select-fg h-9 hover:border-algo-border transition-colors font-mono text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-algo-select-bg border-algo-select-border text-algo-select-fg">
                <SelectGroup>
                  <SelectLabel className="text-algo-muted-text font-mono text-xs">
                    Algorithms
                  </SelectLabel>
                  {Object.keys(algorithms).map((a) => (
                    <SelectItem
                      key={a}
                      value={a}
                      className="capitalize font-mono text-sm focus:bg-algo-panel-soft focus:text-algo-shell-fg"
                    >
                      {a}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

        </div>

      </div>
      <div>
        <div className="flex justify-center items-center h-full w-full graph-container">

        </div>
      </div>
    </div>
  )
}


export default GraphPage;