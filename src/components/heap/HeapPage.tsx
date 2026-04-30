import { Select } from "@radix-ui/react-select";
import { Input } from "../ui/input";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useRef, useMemo, useState, useEffect } from "react";
import * as d3 from "d3";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup";
import { pushToHeap, popFromHeap, buildTreeFromArray } from "./heapAlgorithms";
import { type HeapNode, type RenderNode, type RenderEdge } from "./heapTypes";

// ─── REACT COMPONENT ──────────────────────────────────────────────────────

const HeapPage = () => {
  const [algo, setAlgo] = useState("Min-Heap");
  const [inputValue, setInputValue] = useState("");
  
  
  // Single source of truth for the heap data structure
  const [heap, setHeap] = useState<number[]>([]);
  
  const containerRef = useRef<SVGSVGElement>(null);

  // useEffect(() => {
  //   window.scrollTo(0, 0);
  // }, []);

  const algorithms: Record<string, string[]> = {
    "Min-Heap": ["Preorder", "Inorder", "Postorder"],
    "Max-Heap": ["Preorder", "Inorder", "Postorder"],
  };

  // Automatically rebuild the node tree whenever the array changes
  const heapRoot = useMemo(() => buildTreeFromArray(heap), [heap]);

  // ─── D3 LAYOUT ENGINE ───────────────────────────────────────────────────


  useEffect(() => {

   if(heap.length == 0) {
     onRandom()
   }
  },[heap])

  const { nodes, edges } = useMemo(() => {
    if (!heapRoot) return { nodes: [] as RenderNode[], edges: [] as RenderEdge[] };

    const hierarchyRoot = d3.hierarchy(heapRoot, (d) => {
      const children = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    const treeLayout = d3.tree<HeapNode>().nodeSize([60, 80]);
    treeLayout(hierarchyRoot);

    const pathGenerator = d3
      .linkVertical<any, any>()
      .x((d) => d.x)
      .y((d) => d.y);

    const calculatedNodes: RenderNode[] = hierarchyRoot.descendants().map((d) => ({
      id: d.data.id,
      val: d.data.val,
      x: d.x ?? 0,
      y: d.y ?? 0,
    }));

    const calculatedEdges: RenderEdge[] = hierarchyRoot.links().map((link) => ({
      id: `${link.source.data.index}-${link.target.data.index}`,
      d: pathGenerator(link) as string,
    }));

    return { nodes: calculatedNodes, edges: calculatedEdges };
  }, [heapRoot]);

  // ─── GSAP SETUP ─────────────────────────────────────────────────────────

  const pendingAnimationRef = useRef<
    | { type: "push" | "pop"; animateNodes: { childIdx: number; parentIdx: number }[]; newIndex?: number }
    | null
  >(null);

  const { contextSafe } = useGSAP(
    () => {
      if (nodes.length === 0) return;

      gsap.fromTo(
        ".edge",
        { opacity: 0 },
        { opacity: 1, duration: 0.5, stagger: 0.05, ease: "power1.out" }
      );

      gsap.fromTo(
        ".node circle",
        { scale: 0, transformOrigin: "50% 50%" },
        { scale: 1, duration: 0.4, stagger: 0.04, ease: "back.out(1.7)" }
      );
    },
    { scope: containerRef, dependencies: [nodes, edges] }
  );

  useGSAP(
    () => {
      const pending = pendingAnimationRef.current;
      if (!pending) return;

      const heapTimeline = gsap.timeline();
      heapTimeline.addLabel("reset");
      // Fade in nodes/edges quickly
      heapTimeline.to(".node circle", {
        fill: "var(--node)",
        stroke: "var(--node-stroke)",
        filter: "none",
        scale: 1,
        duration: 0.5
      });
      heapTimeline.to(".edge", { stroke: "var(--edge)", strokeWidth: 2, duration: 0.5 }, "<");

      if (pending.type === "push" && pending.animateNodes.length === 0 && pending.newIndex !== undefined) {
          heapTimeline.addLabel("inserted");
        // Highlight the newly inserted node with a brief pulse (breathe)
        heapTimeline.to(
          `#node-${pending.newIndex}`,
          { fill: "var(--node-visited)", scale: 1.12, duration: 0.4, yoyo: true, repeat: 1 },
          "<"
        );
        // Add a subtle breathing after insertion to let the user see it
        heapTimeline.to(
          `#node-${pending.newIndex}`,
          { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 },
          ">"
        );
      } else {
        pending.animateNodes.forEach(({ childIdx, parentIdx }, i) => {
            heapTimeline.addLabel(`swap-${i}`);
            // First highlight the parent node that will be swapped
            heapTimeline.to(
              `#node-${parentIdx}`,
              { fill: "var(compare)", scale: 1.1, duration: 0.3, yoyo: true, repeat: 1 },
              i === 0 ? "<" : ">"
            );
            // Then highlight the edge
            heapTimeline.to(
              `#edge-${parentIdx}-${childIdx}`,
              { stroke: "var(--node-visited)", strokeWidth: 4, duration: 0.4 },
              "+=0.1"
            );
            // Finally change the child node color with a brief pulse
            heapTimeline.to(
              `#node-${childIdx}`,
              { fill: "var(--node-visited)", scale: 1.08, duration: 0.3, yoyo: true, repeat: 1 },
              "<"
            );
            // Small pause before next swap to avoid rushing
            heapTimeline.to({}, { duration: 0.2 });
        });
      }

      heapTimeline.addLabel("cleanup");
      heapTimeline.to(
        ".edge",
        { stroke: "var(--edge)", strokeWidth: 2, duration: 0.8 },
        ">"
      );
      heapTimeline.to(".node circle", {
        fill: "var(--node)",
        stroke: "var(--node-stroke)",
        strokeWidth: 2,
        filter: "none",
        scale: 1,
        duration: 0.5,
        ease: "power1.out"
      }, "<");

      pendingAnimationRef.current = null;
    },
    { scope: containerRef, dependencies: [heap] }
  );

  // ─── HANDLERS ───────────────────────────────────────────────────────────

  const onInsert = contextSafe((val: string) => {
    const num = Number(val);
    if (val.trim() === "" || isNaN(num)) {
      alert("Please enter a valid number.");
      return;
    }
    const { newHeap, animateNodes } = pushToHeap(heap, num, algo === "Max-Heap");
    
    console.log(`🔺 ${algo} Heappush: Inserting [${num}]`);
    console.log(`  Before: [${heap.join(", ")}]`);
    
    // Log the bubble-up path
    if (animateNodes.length > 0) {
      const path = animateNodes.map(({ childIdx }) => newHeap[childIdx]).join(" ← ");
      console.log(`  Bubble path: ${num} ← ${path}`);
    } else {
      console.log(`  Inserted at end (no bubbling needed)`);
    }

    // Set pending animation first
    pendingAnimationRef.current = {
      type: "push",
      animateNodes,
      newIndex: newHeap.length - 1,
    };
    
    // DELAY heap update so animation plays on current DOM structure first
    gsap.delayedCall(0.1, () => {
      setHeap(newHeap);
    });
    
    setInputValue("");

    gsap.delayedCall(0.5 + animateNodes.length * 0.6, () => {
      console.log(`  After:  [${newHeap.join(", ")}]`);
    });
  });

  const onDelete = contextSafe(() => {
    if (heap.length === 0) return;

    const rootValue = heap[0];
    const { newHeap, animateNodes } = popFromHeap(heap, algo === "Max-Heap");
    
    console.log(
      `🔻 ${algo} Heappop: Removing root [${rootValue}]`
    );
    console.log(`  Before: [${heap.join(", ")}]`);

    // Set pending animation BEFORE updating heap
    pendingAnimationRef.current = {
      type: "pop",
      animateNodes,
    };

    // Pre-highlight the root node
    gsap.to("#node-0", {
      fill: "#ef4444",
      stroke: "#dc2626",
      strokeWidth: 4,
      filter: "drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))",
      scale: 1.15,
      duration: 0.5,
      ease: "power2.out",
    });

    // DELAY heap update until animation is about to complete
    // Allow animations to play first, then update heap
    gsap.delayedCall(0.8 + animateNodes.length * 0.6, () => {
      setHeap(newHeap);
      console.log(`  After:  [${newHeap.join(", ")}]`);
    });
  });

  const onRandom = () => {
    let currentHeap: number[] = [];
    const randomValues = new Set<number>();
    
    while (randomValues.size < 10) {
      randomValues.add(Math.floor(Math.random() * 100));
    }
    
    for (const val of randomValues) {
      currentHeap = pushToHeap(currentHeap, val, algo === "Max-Heap").newHeap;
    }

    setHeap(currentHeap);
  };



  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="sticky w-full backdrop-blur z-10">
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2 px-3 py-2 mx-2">
            <Input
              className="input w-[400px]"
              placeholder="Enter Number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onInsert(inputValue)}
            />
            <div className="flex justify-center items-center gap-2 text-white">
              <button
                className="btn-primary"
                onClick={() => onInsert(inputValue)}
              >
                Heappush
              </button>
              <button
                className="btn-neutral"
                onClick={onRandom}
              >
                Generate Random
              </button>
              <button
                className="btn-danger"
                onClick={onDelete}
              >
                Heappop (Root)
              </button>
              <button
                className="btn-success"
              >
                Heapify
              </button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <Select value={algo} onValueChange={setAlgo}>
              <SelectTrigger className="w-44 select-trigger">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectGroup>
                  <SelectLabel>Heap Algorithm</SelectLabel>
                  {Object.keys(algorithms).map((a) => (
                    <SelectItem
                      key={a}
                      value={a}
                    >
                      {a}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex justify-center items-center gap-2">
              <button className="btn-success h-fit px-4 py-2">
                Run
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-row justify-center items-center viz-canvas overflow-auto">
        <div className="flex flex-row tree-container justify-center items-center w-full min-h-full">
          <svg
            ref={containerRef}
            className="tree canvas border-0 flex-grow"
            width="100%"
            height="100%"
            viewBox="0 0 800 800"
          >
            <g transform="translate(400, 50)">
              {edges.map((edge: RenderEdge) => (
                <path
                  className="edge"
                  key={edge.id}
                  d={edge.d}
                  id={`edge-${edge.id}`}
                  stroke="var(--edge)"
                  strokeWidth="2"
                  fill="none"
                />
              ))}

              {nodes.map((node: RenderNode) => (
                <g key={`grp-${node.id}`} className="node" transform={`translate(${node.x}, ${node.y})`}>
                  <circle
                    id={node.id}
                    r={20}
                    fill="var(--node)"
                    stroke="var(--node-stroke)"
                    strokeWidth="2"
                  />
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill="var(--text)"
                    fontSize="13px"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                  >
                    {node.val}
                  </text>
                </g>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default HeapPage;