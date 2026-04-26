import { useRef } from "react";
import gsap from "@/gsapSetup";
import { useGSAP } from "@gsap/react";
import { type LayoutResult } from "./treeLayout";
import { useDimensions } from "../../hooks/useDimensions";

const C = {
  node: "#378ADD", nodeS: "#185FA5",
  active: "#D85A30", search: "#E8C84A",
  edgeDraw: "#BA7517", cmp: "#9F77DD", txt: "#fff",
};

interface TreeGraphProps {
  layout: LayoutResult;
  highlightPath: number[];
  speed: number;
}

export function TreeGraph({ layout, highlightPath, speed }: TreeGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useDimensions(containerRef);

  // Store refs to individual DOM elements so GSAP can animate them independently
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const linkRefs = useRef<Record<string, SVGPathElement | null>>({});

  useGSAP(() => {
    if (!width || !height) return;

    // 1. Animate Nodes
    layout.nodes.forEach((n) => {
      const el = nodeRefs.current[n.id];
      if (!el) return;

      if (!el.dataset.initialized) {
        // NEW NODE: Pop in
        gsap.set(el, { x: n.x, y: n.y, scale: 0, transformOrigin: "center center" });
        gsap.to(el, { scale: 1, duration: 0.4 / speed, ease: "back.out(1.5)" });
        el.dataset.initialized = "true";
      } else {
        // EXISTING NODE: Smoothly move to new layout position
        gsap.to(el, { x: n.x, y: n.y, duration: 0.5 / speed, ease: "power2.out" });
      }

      // Handle search/highlight path color changes smoothly
      const isHighlighted = highlightPath.includes(n.id);
      const isFound = highlightPath[highlightPath.length - 1] === n.id;
      const targetFill = isFound ? C.search : isHighlighted ? C.active : C.node;
      
      gsap.to(`.circle-${n.id}`, { fill: targetFill, duration: 0.3 });
    });

    // 2. Animate Links
    layout.links.forEach((l) => {
      const el = linkRefs.current[l.id];
      if (!el) return;

      if (!el.dataset.initialized) {
        // NEW LINK: Draw SVG in
        gsap.set(el, { attr: { d: l.d }, drawSVG: "0% 0%" });
        gsap.to(el, { drawSVG: "0% 100%", duration: 0.4 / speed, delay: 0.2 / speed });
        el.dataset.initialized = "true";
      } else {
        // EXISTING LINK: Morph path smoothly
        gsap.to(el, { attr: { d: l.d }, duration: 0.5 / speed, ease: "power2.out" });
      }
    });

  }, { dependencies: [layout, highlightPath, speed, width, height], revertOnUpdate: false }); 

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px] overflow-hidden">
      {width > 0 && height > 0 && (
        <svg width={width} height={height} className="block overflow-visible">
          <g className="edges-layer">
            {layout.links.map((l) => (
              <path
                key={l.id}
                ref={(el) => { if (el) linkRefs.current[l.id] = el; }}
                className={`tree-link link-${l.id}`}
                stroke={C.edgeDraw}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </g>
          <g className="nodes-layer">
            {layout.nodes.map((n) => (
              <g
                key={n.id}
                ref={(el) => { if (el) nodeRefs.current[n.id] = el; }}
                className={`tree-node node-${n.id}`}
              >
                <circle className={`tree-circle circle-${n.id}`} r="20" fill={C.node} stroke={C.nodeS} strokeWidth="1.5" />
                <text y="5" textAnchor="middle" fill={C.txt} fontSize="12" fontWeight="500">
                  {n.id}
                </text>
                {n.meta?.height && (
                  <text y="-25" textAnchor="middle" fill={C.cmp} fontSize="10" opacity="0.8">
                    h{n.meta.height}
                  </text>
                )}
              </g>
            ))}
          </g>
        </svg>
      )}
    </div>
  );
}
