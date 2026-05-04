import { Select } from '@radix-ui/react-select';
import { Input } from '../ui/input';
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useGSAP } from '@gsap/react';
import gsap from '../../gsapSetup';
import { toast } from 'sonner';
import { pushToHeap, popFromHeap, buildTreeFromArray } from './heapAlgorithms';
import { type HeapNode, type RenderNode, type RenderEdge } from './heapTypes';

const HeapPage = () => {
  const MAX_HEAP_SIZE = 15;
  const [algo, setAlgo] = useState('Min-Heap');
  const [inputValue, setInputValue] = useState('');

  const [heap, setHeap] = useState<number[]>([]);

  const containerRef = useRef<SVGSVGElement>(null);

  const algorithms: Record<string, string[]> = {
    'Min-Heap': [],
    'Max-Heap': [],
  };

  const heapRoot = useMemo(() => buildTreeFromArray(heap), [heap]);

  useEffect(() => {
    if (heap.length == 0) {
      onRandom();
    }
  }, [heap]);

  const { nodes, edges } = useMemo(() => {
    if (!heapRoot)
      return { nodes: [] as RenderNode[], edges: [] as RenderEdge[] };

    const hierarchyRoot = d3.hierarchy(heapRoot, (d) => {
      const children = [];
      if (d.left) children.push(d.left);
      if (d.right) children.push(d.right);
      return children.length > 0 ? children : null;
    });

    const treeLayout = d3.tree<HeapNode>().nodeSize([80, 100]);
    treeLayout(hierarchyRoot);

    const pathGenerator = d3
      .linkVertical<any, any>()
      .x((d) => d.x)
      .y((d) => d.y);

    const calculatedNodes: RenderNode[] = hierarchyRoot
      .descendants()
      .map((d) => ({
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

  const pendingAnimationRef = useRef<{
    type: 'push' | 'pop';
    animateNodes: { childIdx: number; parentIdx: number }[];
    newIndex?: number;
  } | null>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (nodes.length === 0) return;

      gsap.fromTo(
        '.edge',
        { opacity: 0 },
        { opacity: 1, duration: 0.5, stagger: 0.05, ease: 'power1.out' }
      );

      gsap.fromTo(
        '.node circle',
        { scale: 0, transformOrigin: '50% 50%' },
        { scale: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(1.7)' }
      );
    },
    { scope: containerRef, dependencies: [nodes, edges] }
  );

  const playPendingAnimation = (
    pending: typeof pendingAnimationRef.current,
    onComplete?: () => void
  ) => {
    if (!pending) {
      onComplete?.();
      return;
    }

    const heapTimeline = gsap.timeline({
      onComplete: () => {
        pendingAnimationRef.current = null;
        onComplete?.();
      },
    });

    heapTimeline.addLabel('reset');
    heapTimeline.to('.node circle', {
      fill: 'var(--node)',
      stroke: 'var(--node-stroke)',
      filter: 'none',
      scale: 1,
      duration: 0.5,
    });
    heapTimeline.to(
      '.edge',
      { stroke: 'var(--edge)', strokeWidth: 2, duration: 0.5 },
      '<'
    );

    if (
      pending.type === 'push' &&
      pending.animateNodes.length === 0 &&
      pending.newIndex !== undefined
    ) {
      heapTimeline.addLabel('inserted');
      heapTimeline.to(
        `#node-${pending.newIndex}`,
        {
          fill: 'var(--node-visited)',
          scale: 1.12,
          duration: 0.4,
          yoyo: true,
          repeat: 1,
        },
        '<'
      );
      heapTimeline.to(
        `#node-${pending.newIndex}`,
        { scale: 1.05, duration: 0.3, yoyo: true, repeat: 1 },
        '>'
      );
    } else {
      pending.animateNodes.forEach(({ childIdx, parentIdx }, i) => {
        heapTimeline.addLabel(`swap-${i}`);
        heapTimeline.to(
          `#node-${parentIdx}`,
          {
            fill: 'var(--compare)',
            scale: 1.1,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
          },
          i === 0 ? '<' : '>'
        );
        heapTimeline.to(
          `#edge-${parentIdx}-${childIdx}`,
          { stroke: 'var(--node-visited)', strokeWidth: 4, duration: 0.4 },
          '+=0.1'
        );
        heapTimeline.to(
          `#node-${childIdx}`,
          {
            fill: 'var(--node-visited)',
            scale: 1.08,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
          },
          '<'
        );
        heapTimeline.to({}, { duration: 0.2 });
      });
    }

    heapTimeline.addLabel('cleanup');
    heapTimeline.to(
      '.edge',
      { stroke: 'var(--edge)', strokeWidth: 2, duration: 0.8 },
      '>'
    );
    heapTimeline.to(
      '.node circle',
      {
        fill: 'var(--node)',
        stroke: 'var(--node-stroke)',
        strokeWidth: 2,
        filter: 'none',
        scale: 1,
        duration: 0.5,
        ease: 'power1.out',
      },
      '<'
    );
  };

  const onInsert = contextSafe((val: string) => {
    const values = val
      .split(',')
      .map((v) => Number(v.trim()))
      .filter((v) => !isNaN(v) && val.trim() !== '');
    if (values.length === 0) {
      toast.error('Please enter valid numbers', {
        position: 'bottom-right',
        closeButton: true,
      });
      return;
    }
    if (heap.length + values.length > MAX_HEAP_SIZE) {
      toast.error(`Heap is full! (max ${MAX_HEAP_SIZE} nodes)`, {
        position: 'bottom-right',
        closeButton: true,
      });
      return;
    }

    if (values.length === 1) {
      const num = values[0];
      const { newHeap, animateNodes } = pushToHeap(
        heap,
        num,
        algo === 'Max-Heap'
      );

      console.log(`🔺 ${algo} Heappush: Inserting [${num}]`);
      console.log(`  Before: [${heap.join(', ')}]`);

      if (animateNodes.length > 0) {
        const path = animateNodes
          .map(({ childIdx }) => newHeap[childIdx])
          .join(' ← ');
        console.log(`  Bubble path: ${num} ← ${path}`);
      } else {
        console.log(`  Inserted at end (no bubbling needed)`);
      }

      pendingAnimationRef.current = {
        type: 'push',
        animateNodes,
        newIndex: newHeap.length - 1,
      };

      gsap.delayedCall(0.1, () => {
        setHeap(newHeap);
      });

      setInputValue('');

      gsap.delayedCall(0.5 + animateNodes.length * 0.6, () => {
        console.log(`  After:  [${newHeap.join(', ')}]`);
      });
    } else {
      let currentHeap = [...heap];
      for (const num of values) {
        currentHeap = pushToHeap(currentHeap, num, algo === 'Max-Heap').newHeap;
      }
      setHeap(currentHeap);
      setInputValue('');
    }
  });

  const onDelete = contextSafe(() => {
    if (heap.length === 0) return;

    const rootValue = heap[0];
    const { newHeap, animateNodes } = popFromHeap(heap, algo === 'Max-Heap');

    console.log(`🔻 ${algo} Heappop: Removing root [${rootValue}]`);
    console.log(`  Before: [${heap.join(', ')}]`);

    pendingAnimationRef.current = {
      type: 'pop',
      animateNodes,
    };

    gsap.to('#node-0', {
      fill: '#ef4444',
      stroke: '#dc2626',
      strokeWidth: 4,
      filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.9))',
      scale: 1.15,
      duration: 0.45,
      ease: 'power2.out',
    });

    const replacementIdx = Math.max(0, heap.length - 1);
    gsap.delayedCall(0.35, () => {
      gsap.to(`#node-${replacementIdx}`, {
        fill: 'var(--node-visited)',
        scale: 1.12,
        duration: 0.35,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });

      gsap.delayedCall(0.45, () => {
        const pending = pendingAnimationRef.current;
        playPendingAnimation(pending, () => {
          setHeap(newHeap);
          console.log(`  After:  [${newHeap.join(', ')}]`);
        });
      });
    });
  });

  const onRandom = () => {
    let currentHeap: number[] = [];
    const randomValues = new Set<number>();

    while (randomValues.size < 10) {
      randomValues.add(Math.floor(Math.random() * 100));
    }

    for (const val of randomValues) {
      currentHeap = pushToHeap(currentHeap, val, algo === 'Max-Heap').newHeap;
    }

    setHeap(currentHeap);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-audiowide">
      <div className="sticky w-full backdrop-blur z-10">
        <div className="flex justify-between items-center">
          <div className="flex justify-start items-center gap-2 px-3 py-2 mx-2">
            <Input
              className="input w-[400px]"
              placeholder="Enter Number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onInsert(inputValue)}
            />
            <div className="flex justify-center items-center gap-2 text-white">
              <button
                className="btn-primary"
                onClick={() => onInsert(inputValue)}
              >
                Heappush
              </button>
              <button className="btn-neutral" onClick={onRandom}>
                Generate Random
              </button>
              <button className="btn-danger" onClick={onDelete}>
                Heappop (Root)
              </button>
              <button className="btn-success">Heapify</button>
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
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex justify-center items-center gap-2">
              <button className="btn-success h-fit px-4 py-2">Run</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 flex-row justify-center items-start viz-canvas overflow-auto bg-background">
        <div className="flex flex-row tree-container justify-center items-start w-full min-h-full pt-5 ">
          <svg
            ref={containerRef}
            className="tree canvas flex overflow-hidden justify-center items-start border-0  w-full h-full m-0 p-0 max-h-[800px]"
            width="100%"
            height="100%"
            viewBox="0 0 700 450"
            preserveAspectRatio="xMidYMin meet"
          >
            <g transform="translate(350, 60)">
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
                <g
                  key={`grp-${node.id}`}
                  className="node"
                  transform={`translate(${node.x}, ${node.y})`}
                >
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
                    fontSize="16px"
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
