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

interface TreeNode {
  id: string;
  val: number;
  right: TreeNode | null;
  left: TreeNode | null;
}

export interface RenderNode {
  id: string;
  val: number;
  x: number;
  y: number;
}

export interface RenderEdge {
  id: string;
  d: string;
}

// ─── PURE ALGORITHM FUNCTIONS ────────────────────────────────────────────────

function insertBST(node: TreeNode | null | undefined, val: number): TreeNode {
  if (!node) {
    return { id: crypto.randomUUID(), val, left: null, right: null };
  }
  if (val < node.val) {
    return { ...node, left: insertBST(node.left, val) };
  }
  if (val > node.val) {
    return { ...node, right: insertBST(node.right, val) };
  }
  return node;
}

function deleteBST(
  node: TreeNode | null,
  val: number
): { tree: TreeNode | null; successorId: string | null } {
  function _delete(
    node: TreeNode | null,
    val: number,
    successorId: { current: string | null }
  ): TreeNode | null {
    if (!node) return null;
    if (val < node.val) {
      return { ...node, left: _delete(node.left, val, successorId) };
    }
    if (val > node.val) {
      return { ...node, right: _delete(node.right, val, successorId) };
    }
    if (!node.left) return node.right;
    if (!node.right) return node.left;

    let successor = node.right;
    while (successor.left) {
      successor = successor.left;
    }
    successorId.current = successor.id;

    return {
      ...node,
      val: successor.val,
      id: successor.id,
      right: _delete(node.right, successor.val, successorId),
    };
  }

  const successorId = { current: null as string | null };
  const tree = _delete(node, val, successorId);
  return { tree, successorId: successorId.current };
}

function searchBST(node: TreeNode | null, val: number): string | null {
  if (!node) return null;
  if (val === node.val) return node.id;
  return val < node.val ? searchBST(node.left, val) : searchBST(node.right, val);
}

function inOrderTraversal(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  inOrderTraversal(node.left, result);
  result.push(node.val);
  inOrderTraversal(node.right, result);
  return result;
}

function preOrderTraversal(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  result.push(node.val);
  preOrderTraversal(node.left, result);
  preOrderTraversal(node.right, result);
  return result;
}

function postOrderTraversal(node: TreeNode | null, result: number[] = []): number[] {
  if (!node) return result;
  postOrderTraversal(node.left, result);
  postOrderTraversal(node.right, result);
  result.push(node.val);
  return result;
}

function levelOrderTraversal(root: TreeNode | null): number[] {
  const result: number[] = [];
  if (!root) return result;
  const queue: TreeNode[] = [root];
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}

// ─── REACT COMPONENT ────────────────────────────────────────────────────────

const TreePage = () => {
  const [algo, setAlgo] = useState("Binary Search Tree");
  const [traversal, setTraversal] = useState("Preorder");
  const [inputValue, setInputValue] = useState("");
  const [treeRoot, setTreeRoot] = useState<TreeNode | null>(null);
  const containerRef = useRef<SVGSVGElement>(null);

  

  const traversalOptions: Record<string, (node: TreeNode | null) => number[]> = {
    "Preorder": preOrderTraversal,
    "Inorder": inOrderTraversal,
    "Postorder": postOrderTraversal,
    "LevelOrder": levelOrderTraversal,
  };

  const algorithms: Record<string, string[]> = {
    "Binary Tree": ["Preorder", "Inorder", "Postorder"],
    "Binary Search Tree": ["Preorder", "Inorder", "Postorder"],
    "AVL Tree": ["Preorder", "Inorder", "Postorder"],
    "Red-Black Tree": ["Preorder", "Inorder", "Postorder"],
    "Segment Tree": ["Preorder", "Inorder", "Postorder"],
    "Fenwick Tree": ["Preorder", "Inorder", "Postorder"],
  };

  // ─── D3 LAYOUT ENGINE ────────────────────────────────────────────────────

  const { nodes, edges } = useMemo(() => {
    if (!treeRoot) return { nodes: [] as RenderNode[], edges: [] as RenderEdge[] };

    const hierarchyRoot = d3.hierarchy(treeRoot, (d) => {
      const children = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    const treeLayout = d3.tree<TreeNode>().nodeSize([60, 80]);
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
      id: `${link.source.data.val}-${link.target.data.val}`,
      d: pathGenerator(link) as string,
    }));

    return { nodes: calculatedNodes, edges: calculatedEdges };
  }, [treeRoot]);

  // ─── GSAP SETUP — must come before any handler that uses contextSafe ──────
  // FIX 1: useGSAP (and therefore contextSafe) must be declared BEFORE the
  // handlers that reference it. JS hoisting does not apply to const declarations.


  useEffect(() => {
      
    if(treeRoot == null) {  
     onRandom();
    }
  },[treeRoot])
  const { contextSafe } = useGSAP(
    () => {
      if (edges.length === 0) return;

      gsap.fromTo(
        ".edge",
        { opacity: 0 },
        { opacity: 1, duration: 0.8, stagger: 0.05, ease: "power1.out" }
      );

      // FIX 4: Node entrance animation was missing — added scale-in for nodes
      gsap.fromTo(
        ".node circle",
        { scale: 0, transformOrigin: "50% 50%" },
        { scale: 1, duration: 0.5, stagger: 0.04, ease: "back.out(1.7)" }
      );
    },
    { scope: containerRef, dependencies: [edges] }
  );

  // ─── HANDLERS ────────────────────────────────────────────────────────────

  const MAX_TREE_SIZE = 20;

  const onInsert = (val: string) => {
    const num = Number(val);
    if (val.trim() === "" || isNaN(num)) {
      alert("Please enter a valid number.");
      return;
    }
    // Count current nodes in tree
    const countNodes = (node: TreeNode | null): number => {
      if (!node) return 0;
      return 1 + countNodes(node.left) + countNodes(node.right);
    };
    if (countNodes(treeRoot) >= MAX_TREE_SIZE) {
      alert(`Tree is full! (max ${MAX_TREE_SIZE} nodes)`);
      return;
    }
    setTreeRoot((prev) => insertBST(prev, num));
    setInputValue("");
  };

  const onRandom = () => {
    let newTree: TreeNode | null = null;
    const randomValues = new Set<number>();
    while (randomValues.size < 7) {
      randomValues.add(Math.floor(Math.random() * 100));
    }
    randomValues.forEach((val) => {
      newTree = insertBST(newTree, val);
    });
    setTreeRoot(newTree);
  };

  // FIX 2: Compute deleteBST result synchronously before setTreeRoot so that
  // successorId is reliably captured — setState updaters run asynchronously and
  // closures inside them are not guaranteed to write back to outer variables in
  // time for the GSAP call that follows.
  // FIX 3: Wrapped with contextSafe so the GSAP tween is tracked by the context
  // and properly cleaned up on unmount / re-render.
  const onDelete = contextSafe((val: string) => {
    if (val.trim() === "") return;

    const result = deleteBST(treeRoot, Number(val));
    setTreeRoot(result.tree);

    if (result.successorId) {
      gsap.to(`#node-${result.successorId}`, {
        fill: "#e53e3e",
        stroke: "#9b2c2c",
        strokeWidth: 4,
        duration: 1.5,
        ease: "power1.inOut",
      });
    }

    setInputValue("");
  });

  const onRun = contextSafe(() => {
    const traversalFn = traversalOptions[traversal];
    if (!treeRoot || !traversalFn) return;

    // Reset all nodes to default state first
    gsap.killTweensOf(".node circle, [id*='node-']");
    gsap.set(".node circle", {
      fill: "var(--node)",
      stroke: "var(--node-stroke)",
      strokeWidth: 2,
      filter: "none",
      r: 20,
    });

    const sequence = traversalFn(treeRoot);
    const pathStr = sequence.join(" → ");
    console.log(`🌳 ${traversal} Traversal Started: [${pathStr}]`);

    // Build GSAP timeline for detailed, breathing traversal animation
    const timeline = gsap.timeline();
    
    // Map values to node IDs
    const nodeMap = new Map<number, string>();
    nodes.forEach((node) => {
      nodeMap.set(node.val, node.id);
    });

    let stepIndex = 0;
    sequence.forEach((val) => {
      const nodeId = nodeMap.get(val);
      if (!nodeId) return;

      // ─── STEP 1: Approach animation (0.5s breathing room) ───
      const startTime = stepIndex * 1.2;
      timeline.to(
        `#node-${nodeId}`,
        {
          fill: "#fbbf24",
          stroke: "#f59e0b",
          strokeWidth: 3,
          duration: 0.4,
          ease: "power2.out",
          onStart: () => {
            console.log(`  ✓ Visiting: ${val}`);
          },
        },
        startTime
      );

      // ─── STEP 2: Active glow (0.4s - shows deliberate pause) ───
      timeline.to(
        `#node-${nodeId}`,
        {
          filter: "drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))",
          duration: 0.3,
          ease: "sine.inOut",
        },
        startTime + 0.1
      );

      // ─── STEP 3: Scale pulse during visit (emphasizes process) ───
      timeline.to(
        `#node-${nodeId}`,
        {
          r: 26,
          duration: 0.25,
          ease: "back.out",
          yoyo: true,
          repeat: 1,
        },
        startTime + 0.15
      );

      // ─── STEP 4: Mark as visited (0.3s transition) ───
      timeline.to(
        `#node-${nodeId}`,
        {
          fill: "#10b981",
          stroke: "#16a34a",
          strokeWidth: 2,
          filter: "drop-shadow(0 0 4px rgba(16, 185, 129, 0.5))",
          duration: 0.3,
          ease: "power1.inOut",
        },
        startTime + 0.65
      );

      // ─── STEP 5: Breathing pause before next node ───
      timeline.to({}, { duration: 0.15 }, startTime + 0.95);

      stepIndex++;
    });

    // Final cleanup - return all to default state
    timeline.to(
      ".node circle",
      {
        fill: "var(--node)",
        stroke: "var(--node-stroke)",
        strokeWidth: 2,
        filter: "none",
        r: 20,
        duration: 0.5,
        ease: "power1.out",
      },
      ">-0.5"
    );

    timeline.to(
      {},
      {
        onComplete: () => {
          console.log(`🌳 Complete: [${pathStr}]`);
        },
      },
      ">"
    );
  });

  const onSearch = contextSafe((val: string) => {
    if (val.trim() === "") return;
    setInputValue("");

    const id = searchBST(treeRoot, Number(val));
    if (id) {
      gsap.to(`#node-${id}`, {
        fill: "#22c55e",
        stroke: "#ffffff",
        strokeWidth: 4,
        duration: 1.3,
        yoyo: true,
        repeat: 3,
        ease: "power1.inOut",
      });
    } else {
      alert("Value not found!");
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background font-audiowide">
      <div className="sticky top-0 z-30  border-0 bg-background backdrop-blur">
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2 px-3 py-2 mx-2">
            <Input
              className="input w-[400px] md:w-[100px]"
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
                Enter
              </button>
              <button
                className="btn-neutral bg-purple"
                onClick={onRandom}
              >
                Generate Random
              </button>
              <button
                className="btn-danger"
                onClick={() => onDelete(inputValue)}
              >
                Delete
              </button>
              <button
                className="btn-neutral"
                onClick={() => onSearch(inputValue)}
              >
                Search
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
                  <SelectLabel>Tree Algorithm</SelectLabel>
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



            <Select
              value={traversal}
              onValueChange={(val) => {
                setTraversal(val);
                const fn = traversalOptions[val];
                if (fn && treeRoot) {
                  console.log(`${val}:`, fn(treeRoot));
                }
              }}
            >
              <SelectTrigger className="w-44 select-trigger">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectGroup>
                  <SelectLabel>Traversal</SelectLabel>
                  {Object.keys(traversalOptions).map((a) => (
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
            <button className="btn-success flex h-fit w-fit px-4 py-2" onClick={onRun}>
              Run
            </button>
                </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-row justify-center items-center viz-canvas overflow-auto">
        <div className="flex flex-row tree-container justify-center items-center w-full h-full">
          <svg
            ref={containerRef}
            className="tree canvas border-0"
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
                <g key={node.id} className="node" transform={`translate(${node.x}, ${node.y})`}>
                  <circle
                    id={`node-${node.id}`}
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

export default TreePage;