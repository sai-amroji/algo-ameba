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
import { useRef, useMemo, useState, useEffect } from "react";
import * as d3 from "d3";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup";
import { pushToHeap, popFromHeap, buildTreeFromArray } from "./heapAlgorithms";
import { type HeapNode, type RenderNode,type RenderEdge } from "./heapTypes";

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
      id: `${link.source.data.id}-${link.target.data.id}`,
      d: pathGenerator(link) as string,
    }));

    return { nodes: calculatedNodes, edges: calculatedEdges };
  }, [heapRoot]);

  // ─── GSAP SETUP ─────────────────────────────────────────────────────────

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

  // ─── HANDLERS ───────────────────────────────────────────────────────────

  const onInsert = (val: string) => {
    const num = Number(val);
    if (val.trim() === "" || isNaN(num)) {
      alert("Please enter a valid number.");
      return;
    }
    setHeap((prevHeap) => pushToHeap(prevHeap, num, algo === "Max-Heap"));
    setInputValue("");
  };

  const onDelete = contextSafe(() => {
    if (heap.length === 0) return;
    
    // Animate the root node leaving before updating state
    gsap.to(".node circle", {
      scale: 1.2,
      fill: "#e53e3e",
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        setHeap((prevHeap) => popFromHeap(prevHeap, algo === "Max-Heap"));
      }
    });
  });

  const onRandom = () => {
    let currentHeap: number[] = [];
    const randomValues = new Set<number>();
    
    while (randomValues.size < 10) {
      randomValues.add(Math.floor(Math.random() * 100));
    }
    
    randomValues.forEach((val) => {
      currentHeap = pushToHeap(currentHeap, val, algo === "Max-Heap");
    });
    
    setHeap(currentHeap);
  };



  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-slate-950">
      <div className="sticky w-full border-slate-800/70 bg-slate-950/95 backdrop-blur">
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2 px-3 py-2 mx-2">
            <Input
              className="border-2 w-[400px]"
              placeholder="Enter Number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onInsert(inputValue)}
            />
            <div className="flex justify-center items-center gap-2 text-white">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white rounded-sm border-0"
                onClick={() => onInsert(inputValue)}
              >
                Heappush
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-sm border-0"
                onClick={onRandom}
              >
                Random
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white rounded-sm border-0"
                onClick={onDelete}
              >
                Heappop (Root)
              </Button>
              <Button
                className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-sm border-0"
              >
                Heapify
              </Button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <Select value={algo} onValueChange={setAlgo}>
              <SelectTrigger className="w-44 bg-algo-select-bg border-algo-select-border text-algo-select-fg h-9 hover:border-algo-border transition-colors font-mono text-sm">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="bg-algo-select-bg border-algo-select-border text-algo-select-fg">
                <SelectGroup>
                  <SelectLabel className="text-algo-muted-text font-mono text-xs">
                    Select Algorithm
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

            <div className="flex justify-center items-center gap-2">
              <button className="flex h-fit w-fit px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600">
                Run
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-row justify-center items-center bg-slate-900 overflow-auto">
        <div className="flex flex-row tree-container justify-center items-center w-full min-h-full">
          <svg
            ref={containerRef}
            className="tree bg-slate-950 flex-grow"
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
                  stroke="#555"
                  strokeWidth="2"
                  fill="none"
                />
              ))}

              {nodes.map((node: RenderNode) => (
                <g key={node.id} className="node" transform={`translate(${node.x}, ${node.y})`}>
                  <circle
                    id={node.id}
                    r={20}
                    fill="#4A90E2"
                    stroke="#2c5a8e"
                    strokeWidth="2"
                  />
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill="#fff"
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