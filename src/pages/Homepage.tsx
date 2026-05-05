import { Input } from '@/components/ui/input.tsx';
import { ModeToggle } from '@/components/mode-toggle.tsx';
import { useNavigate } from 'react-router-dom';
import logo from '../../public/Ameba.png';
import { ROUTES } from '@/constants/routes';
import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import gsap from '@/gsapSetup';
import { useGSAP } from '@gsap/react';

const RightArrow = ({ className = 'w-5 h-5' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
    />
  </svg>
);

const graphLetters = ['G', 'R', 'A', 'P', 'H'];

const Homepage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgHeapRef = useRef<SVGSVGElement>(null); // Added ref for Heap
  const searchCardRef = useRef<HTMLDivElement>(null);
  const searchHoverTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const sortCardRef = useRef<HTMLDivElement>(null);
  const sortHoverTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const stackCardRef = useRef<HTMLDivElement>(null);
  const stackHoverTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const queueCardRef = useRef<HTMLDivElement>(null);
  const queueHoverTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const linkedListCardRef = useRef<HTMLDivElement>(null);
  const linkedListPointerRef = useRef<HTMLDivElement>(null);
  const linkedListHoverTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const treeData = {
    num: 'T',
    children: [
      {
        num: 'R',
        children: [
          { num: 'E', children: [] },
          { num: 'E', children: [] },
        ],
      },
      {
        num: 'A',
        children: [
          { num: 'L', children: [] },
          { num: 'G', children: [] },
        ],
      },
    ],
  };

  // Valid Max-Heap Data structure
  const heapData = {
    num: 'H',
    children: [
      {
        num: 'E',
        children: [
          { num: 'A', children: [] },
          { num: 'P', children: [] },
        ],
      },
      {
        num: 'S',
        children: [
          { num: 10, children: [] },
          { num: 25, children: [] },
        ],
      },
    ],
  };

  const safeLength = 15;
  const sortingBars = [
    { char: 'S', height: 75 },
    { char: 'O', height: 175 },
    { char: 'R', height: 45 },
    { char: 'T', height: 75 },
    { char: 'I', height: 89 },
    { char: 'N', height: 99 },
    { char: 'G', height: 230 },
  ];
  const [nodes, setNodes] = useState<
    { id: number; label: string; x: number; y: number }[]
  >([]);
  const [links, setLinks] = useState<{ source: number; target: number }[]>([]);

  // GRAPH SIMULATION EFFECT
  useEffect(() => {
    const safeLength = graphLetters.length;

    // FIXED: Use a hardcoded viewBox coordinate system instead of window.innerWidth
    const simWidth = 1000;
    const simHeight = 400;
    const nodeRadius = 25;

    const initialNodes = Array.from({ length: safeLength }, (_, i) => ({
      id: i,
      label: graphLetters[i],
      x: Math.random() * (simWidth - nodeRadius * 2) + nodeRadius,
      y: Math.random() * (simHeight - nodeRadius * 2) + nodeRadius,
      vx: 0,
      vy: 0,
    }));

    const initialLinks: { source: number; target: number }[] = [];
    for (let i = 0; i < safeLength; i++) {
      if (i < safeLength - 1) {
        initialLinks.push({ source: i, target: i + 1 });
      }
      const randomTarget = Math.floor(Math.random() * safeLength);
      if (randomTarget !== i) {
        initialLinks.push({ source: i, target: randomTarget });
      }
    }

    const simulation = d3
      .forceSimulation(initialNodes)
      .force(
        'link',
        d3
          .forceLink(initialLinks)
          .id((d: any) => d.id)
          .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-150))
      // FIXED: Center exactly in the middle of our 1000x400 viewBox
      .force('center', d3.forceCenter(simWidth / 2, simHeight / 2))
      .force('collision', d3.forceCollide().radius(nodeRadius + 10))
      .force('bounds', () => {
        initialNodes.forEach((node: any) => {
          const margin = nodeRadius;
          if (node.x - margin < 0) node.x = margin;
          if (node.x + margin > simWidth) node.x = simWidth - margin;
          if (node.y - margin < 0) node.y = margin;
          if (node.y + margin > simHeight) node.y = simHeight - margin;
        });
      })
      .on('tick', () => {
        setNodes([...initialNodes]);
        setLinks([...initialLinks]);
      });

    return () => {
      simulation.stop();
    };
  }, [safeLength]);

  // TREE EFFECT
  useEffect(() => {
    if (!svgRef.current) return;
    drawHierarchy(svgRef.current, treeData);
  }, [treeData]);

  // HEAP EFFECT
  useEffect(() => {
    if (!svgHeapRef.current) return;
    drawHierarchy(svgHeapRef.current, heapData);
  }, [heapData]);

  const { contextSafe } = useGSAP({ scope: searchCardRef });

  const resetSearchLetters = contextSafe(() => {
    const letters = gsap.utils.toArray<HTMLElement>('.search-letter');
    searchHoverTimelineRef.current?.kill();
    searchHoverTimelineRef.current = null;

    gsap.to(letters, {
      backgroundColor: '#1d4ed8',
      x: 0,
      scale: 1,
      duration: 0.2,
      overwrite: 'auto',
    });
  });

  const playSearchHover = contextSafe(() => {
    const letters = gsap.utils.toArray<HTMLElement>('.search-letter');
    if (!letters.length) return;

    const startIndex = Math.floor(gsap.utils.random(0, letters.length - 1, 1));
    const stopIndex = Math.floor(
      gsap.utils.random(startIndex, letters.length - 1, 1)
    );

    searchHoverTimelineRef.current?.kill();

    gsap.set(letters, {
      backgroundColor: '#1d4ed8',
      x: 0,
      scale: 1,
      overwrite: 'auto',
    });

    const tl = gsap.timeline();

    for (let index = startIndex; index <= stopIndex; index += 1) {
      tl.to(letters[index], {
        backgroundColor: '#facc15',
        x: 12,
        duration: 0.18,
        ease: 'power2.out',
      });

      if (index > startIndex) {
        tl.to(
          letters[index - 1],
          {
            x: 0,
            duration: 0.14,
            ease: 'power1.out',
          },
          '<'
        );
      }
    }

    tl.to(letters[stopIndex], {
      backgroundColor: '#22c55e',
      x: 0,
      scale: 1.08,
      duration: 0.24,
      ease: 'power2.out',
    });

    searchHoverTimelineRef.current = tl;
  });

  const { contextSafe: sortingContextSafe } = useGSAP({ scope: sortCardRef });

  const resetSortingBars = sortingContextSafe(() => {
    const bars = gsap.utils.toArray<HTMLElement>('.sorting-bar');
    sortHoverTimelineRef.current?.kill();
    sortHoverTimelineRef.current = null;

    gsap.to(bars, {
      backgroundColor: '#1d4ed8',
      duration: 0.2,
      overwrite: 'auto',
    });

    bars.forEach((bar) => {
      const baseHeight = Number(bar.dataset.baseHeight || 75);
      gsap.to(bar, {
        height: baseHeight,
        duration: 0.24,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });

  const playSortingHover = sortingContextSafe(() => {
    const bars = gsap.utils.toArray<HTMLElement>('.sorting-bar');
    if (bars.length < 2) return;

    sortHoverTimelineRef.current?.kill();

    const firstIndex = Math.floor(gsap.utils.random(0, bars.length - 1, 1));
    let secondIndex = Math.floor(gsap.utils.random(0, bars.length - 1, 1));
    while (secondIndex === firstIndex) {
      secondIndex = Math.floor(gsap.utils.random(0, bars.length - 1, 1));
    }

    const firstBar = bars[firstIndex];
    const secondBar = bars[secondIndex];
    const firstBase = Number(firstBar.dataset.baseHeight || 75);
    const secondBase = Number(secondBar.dataset.baseHeight || 75);

    const firstSwapHeight = Math.max(40, Math.round(secondBase * 0.75));
    const secondSwapHeight = Math.min(250, Math.round(firstBase * 1.2));

    gsap.set(bars, {
      backgroundColor: '#1d4ed8',
      overwrite: 'auto',
    });

    const tl = gsap.timeline();

    tl.to([firstBar, secondBar], {
      backgroundColor: '#facc15',
      duration: 0.15,
      ease: 'power1.out',
    });

    tl.to(firstBar, {
      height: firstSwapHeight,
      duration: 0.3,
      ease: 'power2.inOut',
    });

    tl.to(
      secondBar,
      {
        height: secondSwapHeight,
        duration: 0.3,
        ease: 'power2.inOut',
      },
      '<'
    );

    tl.to([firstBar, secondBar], {
      backgroundColor: '#22c55e',
      duration: 0.18,
      ease: 'power1.out',
    });

    sortHoverTimelineRef.current = tl;
  });

  const { contextSafe: stackContextSafe } = useGSAP({ scope: stackCardRef });

  const resetStackHover = stackContextSafe(() => {
    const stackItems = gsap.utils.toArray<HTMLElement>('.stack-item');
    stackHoverTimelineRef.current?.kill();
    stackHoverTimelineRef.current = null;

    gsap.to(stackItems, {
      y: 0,
      rotation: 0,
      scale: 1,
      backgroundColor: '#1d4ed8',
      duration: 0.2,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  });

  const playStackHover = stackContextSafe(() => {
    const stackItems = gsap.utils.toArray<HTMLElement>('.stack-item');
    if (!stackItems.length) return;

    const topItem = stackItems[0];
    stackHoverTimelineRef.current?.kill();

    gsap.set(stackItems, {
      y: 0,
      rotation: 0,
      scale: 1,
      backgroundColor: '#1d4ed8',
      overwrite: 'auto',
    });

    const tl = gsap.timeline();

    tl.to(topItem, {
      backgroundColor: '#facc15',
      y: -28,
      duration: 0.26,
      ease: 'power2.out',
    });

    tl.to(topItem, {
      rotation: -12,
      scale: 1.06,
      transformOrigin: '50% 100%',
      duration: 0.2,
      ease: 'power2.out',
    });

    tl.to(topItem, {
      backgroundColor: '#22c55e',
      duration: 0.16,
      ease: 'power1.out',
    });

    stackHoverTimelineRef.current = tl;
  });

  const { contextSafe: queueContextSafe } = useGSAP({ scope: queueCardRef });

  const resetQueueHover = queueContextSafe(() => {
    const queueItems = gsap.utils.toArray<HTMLElement>('.queue-item');
    queueHoverTimelineRef.current?.kill();
    queueHoverTimelineRef.current = null;

    gsap.to(queueItems, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      backgroundColor: '#1d4ed8',
      duration: 0.22,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  });

  const playQueueHover = queueContextSafe(() => {
    const queueItems = gsap.utils.toArray<HTMLElement>('.queue-item');
    if (!queueItems.length) return;

    const dequeueItem = queueItems[queueItems.length - 1];
    const frontItem = queueItems[0];
    if (!dequeueItem || !frontItem) return;

    queueHoverTimelineRef.current?.kill();

    gsap.set(queueItems, {
      x: 0,
      y: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
      backgroundColor: '#1d4ed8',
      overwrite: 'auto',
    });

    const dequeueRect = dequeueItem.getBoundingClientRect();
    const frontRect = frontItem.getBoundingClientRect();
    const gap = 18;
    const moveToFrontX = frontRect.left - dequeueRect.left - gap;
    const remainingItems = queueItems.slice(0, -1);
    const forwardShift = 22;

    const tl = gsap.timeline();

    tl.to(dequeueItem, {
      backgroundColor: '#facc15',
      duration: 0.14,
      ease: 'power1.out',
    });

    tl.to(dequeueItem, {
      x: 56,
      y: -36,
      rotation: 12,
      duration: 0.24,
      ease: 'power2.out',
    });

    tl.to(dequeueItem, {
      opacity: 0,
      duration: 0.14,
      ease: 'power1.in',
    });

    tl.to(
      remainingItems,
      {
        x: forwardShift,
        duration: 0.28,
        ease: 'power2.out',
        stagger: 0.03,
      },
      '<'
    );

    tl.set(dequeueItem, {
      x: moveToFrontX - 28,
      y: -10,
      rotation: -8,
    });

    tl.to(dequeueItem, {
      opacity: 1,
      x: moveToFrontX,
      y: 0,
      rotation: 0,
      duration: 0.42,
      ease: 'power2.inOut',
    });

    tl.to(
      remainingItems,
      {
        x: 200,
        duration: 0.24,
        ease: 'power2.inOut',
        stagger: 0.02,
      },
      '<0.12'
    );

    tl.to(dequeueItem, {
      backgroundColor: '#22c55e',
      duration: 0.18,
      ease: 'power1.out',
    });

    queueHoverTimelineRef.current = tl;
  });

  const { contextSafe: linkedListContextSafe } = useGSAP({
    scope: linkedListCardRef,
  });

  const getLinkedPointerPosition = (
    node: HTMLElement,
    container: HTMLElement
  ) => {
    const nodeRect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const pointerWidth = linkedListPointerRef.current?.offsetWidth ?? 88;
    const pointerHeight = linkedListPointerRef.current?.offsetHeight ?? 34;
    const rawX =
      nodeRect.left -
      containerRect.left +
      nodeRect.width / 2 -
      pointerWidth / 2;
    const rawY = nodeRect.top - containerRect.top - pointerHeight - 8;

    return {
      x: Math.max(8, Math.min(rawX, containerRect.width - pointerWidth - 8)),
      y: Math.max(8, rawY),
    };
  };

  const resetLinkedListHover = linkedListContextSafe(() => {
    const nodes = gsap.utils.toArray<HTMLElement>('.linked-node');
    const pointer = linkedListPointerRef.current;
    const container = linkedListCardRef.current;

    linkedListHoverTimelineRef.current?.kill();
    linkedListHoverTimelineRef.current = null;

    gsap.to(nodes, {
      backgroundColor: '#1d4ed8',
      scale: 1,
      duration: 0.18,
      overwrite: 'auto',
    });

    if (pointer && container && nodes.length) {
      const startPos = getLinkedPointerPosition(nodes[0], container);
      gsap.to(pointer, {
        x: startPos.x,
        y: startPos.y,
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  });

  const playLinkedListHover = linkedListContextSafe(() => {
    const nodes = gsap.utils.toArray<HTMLElement>('.linked-node');
    const pointer = linkedListPointerRef.current;
    const container = linkedListCardRef.current;

    if (!nodes.length || !pointer || !container) return;

    linkedListHoverTimelineRef.current?.kill();

    const stopIndex = Math.floor(gsap.utils.random(0, nodes.length - 1, 1));
    const startPos = getLinkedPointerPosition(nodes[0], container);

    gsap.set(nodes, {
      backgroundColor: '#1d4ed8',
      scale: 1,
      overwrite: 'auto',
    });

    gsap.set(pointer, {
      x: startPos.x,
      y: startPos.y,
      opacity: 1,
      overwrite: 'auto',
    });

    const tl = gsap.timeline();

    for (let index = 0; index <= stopIndex; index += 1) {
      const pos = getLinkedPointerPosition(nodes[index], container);

      tl.to(pointer, {
        x: pos.x,
        y: pos.y,
        duration: 0.34,
        ease: 'power2.out',
      });

      tl.to(
        nodes[index],
        {
          backgroundColor: '#facc15',
          duration: 0.12,
          ease: 'power1.out',
        },
        '<'
      );

      if (index > 0) {
        tl.to(
          nodes[index - 1],
          {
            backgroundColor: '#1d4ed8',
            duration: 0.1,
            ease: 'power1.out',
          },
          '<'
        );
      }
    }

    tl.to(nodes[stopIndex], {
      backgroundColor: '#22c55e',
      scale: 1.06,
      duration: 0.24,
      ease: 'power2.out',
    });

    linkedListHoverTimelineRef.current = tl;
  });

  useEffect(() => {
    if (!linkedListCardRef.current || !linkedListPointerRef.current) return;

    const firstNode = linkedListCardRef.current.querySelector(
      '.linked-node'
    ) as HTMLElement | null;
    if (!firstNode) return;

    const pos = getLinkedPointerPosition(firstNode, linkedListCardRef.current);
    gsap.set(linkedListPointerRef.current, {
      x: pos.x,
      y: pos.y,
      opacity: 1,
    });
  }, []);

  useEffect(() => {
    return () => {
      searchHoverTimelineRef.current?.kill();
      searchHoverTimelineRef.current = null;
      sortHoverTimelineRef.current?.kill();
      sortHoverTimelineRef.current = null;
      stackHoverTimelineRef.current?.kill();
      stackHoverTimelineRef.current = null;
      queueHoverTimelineRef.current?.kill();
      queueHoverTimelineRef.current = null;
      linkedListHoverTimelineRef.current?.kill();
      linkedListHoverTimelineRef.current = null;
    };
  }, []);

  // Reusable function to draw both Tree and Heap cohesively
  const drawHierarchy = (svgElement: SVGSVGElement, data: any) => {
    const w = 600;
    const height = 300;
    const margins = { top: 40, right: 20, bottom: 40, left: 20 };

    d3.select(svgElement).selectAll('*').remove();

    const svg = d3
      .select(svgElement)
      .append('g')
      .attr('transform', `translate(${margins.left},${margins.top})`);

    const root = d3.hierarchy(data);
    const treeLayout = d3
      .tree<any>()
      .size([
        w - margins.left - margins.right,
        height - margins.top - margins.bottom,
      ]);

    treeLayout(root);

    svg
      .selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr(
        'd',
        d3
          .linkVertical<any, any>()
          .x((d: any) => d.x)
          .y((d: any) => d.y)
      )
      .attr('fill', 'none')
      .attr('stroke', 'var(--edge)') // Use variable for edge line
      .attr('stroke-width', 2);

    const nodes = svg
      .selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodes
      .append('circle')
      .attr('r', 25) // Cohesive larger sizing
      .attr('fill', 'var(--viz-item-bg)')
      .attr('stroke', 'var(--viz-item-border)')
      .attr('stroke-width', 2);

    nodes
      .append('text')
      .attr('dy', '5px') // Vertically centers text inside the circle
      .attr('text-anchor', 'middle')
      .text((d: any) => d.data.num)
      .attr('font-size', '18px')
      .attr('fill', 'var(--viz-item-text)')
      .attr('font-weight', 'bold');
  };

  return (
    <div className="algo-shell page-enter ">
      {/* Navbar */}
      <div className="page-nav fixed top-0 w-full h-16 flex justify-between items-center px-6 py-2 z-50">
        <div className="flex items-center gap-6">
          <img
            src={logo}
            onClick={() => navigate('/landing')}
            className="h-25 w-25 mt-5 cursor-pointer transition-transform duration-300 hover:scale-105"
            alt="logo"
          />
          <Input
            name="search"
            className="app-input h-10 w-[min(60vw,900px)] lg:w-[400px] hidden lg:block"
          />
        </div>
        <div className="flex items-center gap-6 font-[audiowide] text-lg">
          <p
            className="nav-link cursor-pointer hidden lg:block"
            onClick={() => navigate(ROUTES.home)}
          >
            Home
          </p>
          <p
            className="nav-link cursor-pointer hidden lg:block"
            onClick={() => navigate(ROUTES.algorithms)}
          >
            Algorithms
          </p>
          <p
            className="nav-link cursor-pointer hidden lg:block"
            onClick={() => navigate(ROUTES.about)}
          >
            About
          </p>
          <div className="green-icon-btn">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="section-fade pt-32 pb-16 px-8 md:px-12">
        {/* <img src="../../public/Ameba.png" width={10} height={10} className="z-100" /> */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start font-[audiowide] text-accent-foreground gap-2 md:gap-12">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-6xl md:text-8xl font-bold font-[audiowide]">
              Algo
            </h1>
            <h1 className="text-6xl md:text-8xl font-bold font-plex drop-shadow-md">
              Ameba
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-accent-foreground font-plex max-w-xl mt-2 md:mt-20 text-center md:text-left italic opacity-90">
            Vizualize Any Algorithm with{' '}
            <span className="font-semibold text-primary">Fluid Animations</span>
          </p>
        </div>
      </section>

      {/* Custom Visuals Section */}
      <section className="section-fade py-16 flex flex-col items-center gap-3 md:gap-6 mx-10 ">
        {/* Search Container */}
        <div
          ref={searchCardRef}
          onMouseEnter={playSearchHover}
          onMouseLeave={resetSearchLetters}
          className="flex flex-col w-full justify-center items-center p-3 md:p-5 card rounded-lg"
        >
          <div className="flex p-1 m-2 flex-row align-center content-center justify-center gap-2 items-stretch border-2 rounded-sm border-wh w-full min-h-[90px]">
            {['S', 'E', 'A', 'R', 'C', 'H'].map((char) => (
              <div
                key={char}
                data-char={char}
                className="search-letter search-node"
              >
                {char}
              </div>
            ))}
          </div>
          <div className="card-name">
            <h1 className="card-text" onClick={() => navigate('/search')}>
              Search
            </h1>
          </div>
        </div>

        {/* Stack & Sorting Container */}
        <div className="flex flex-col md:flex-row w-full gap-3 md:gap-6 items-stretch">
          <div
            ref={stackCardRef}
            onMouseEnter={playStackHover}
            onMouseLeave={resetStackHover}
            className="flex-1 flex flex-col justify-between items-center p-3 md:p-5 card rounded-lg min-h-[250px] md:min-h-[340px]"
          >
            {/* Stack items: fixed width + explicit height so they never squash */}
            <div className="flex flex-col gap-2 justify-center items-center w-full flex-1 py-2">
              {['S', 'T', 'A', 'C', 'K'].map((char) => (
                <div key={char} className="stack-item stack-node">
                  {char}
                </div>
              ))}
            </div>
            <div className="self-start w-full p-2">
              <h1 className="card-text" onClick={() => navigate('/stack')}>
                Stack
              </h1>
            </div>
          </div>

          <div
            ref={sortCardRef}
            onMouseEnter={playSortingHover}
            onMouseLeave={resetSortingBars}
            className="flex-1 flex flex-col justify-between items-center p-3 md:p-5 card rounded-lg min-h-[250px] md:min-h-[340px]"
          >
            <div className="flex flex-row rounded-lg items-end justify-center gap-2 w-full flex-1 py-2">
              {sortingBars.map((bar) => (
                <div
                  key={bar.char}
                  data-base-height={bar.height}
                  className="sorting-bar sort-node"
                  style={{ height: `${bar.height}px` }}
                >
                  {bar.char}
                </div>
              ))}
            </div>
            <div className="self-start w-full p-2">
              <h1 className="card-text" onClick={() => navigate('/sort')}>
                Sorting
              </h1>
            </div>
          </div>
        </div>

        {/* Queue Container */}
        <div
          ref={queueCardRef}
          onMouseEnter={playQueueHover}
          onMouseLeave={resetQueueHover}
          className="flex flex-col w-full justify-center items-center p-3 md:p-5 card rounded-lg overflow-hidden"
        >
          <div className="flex p-1 my-2 mx-0 md:m-2 flex-row align-center content-center justify-center gap-1 md:gap-2 items-center  w-full h-[75px] rounded-sm overflow-x-auto overflow-y-hidden">
            {'QUEUE'.split('').map((ch) => (
              <div data-char={ch} className="queue-item queue-node">
                {ch}
              </div>
            ))}
          </div>
          <div className="card-name">
            <h1 className="card-text" onClick={() => navigate('/queue')}>
              Queue
            </h1>
          </div>
        </div>

        {/* Tree & Heap Container */}
        <div className="flex flex-col md:flex-row w-full gap-3 md:gap-6 items-stretch">
          <div className="flex-1 flex flex-col w-full justify-between items-center p-3 md:p-5 card rounded-lg min-h-[300px] md:min-h-[400px]">
            <div
              ref={containerRef}
              className="h-full w-full flex justify-center items-center overflow-hidden"
            >
              <svg
                ref={svgRef}
                viewBox="0 0 600 350"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full max-w-[600px] max-h-[350px]"
              ></svg>
            </div>
            <div className="card-name">
              <h1 className="card-text" onClick={() => navigate('/tree')}>
                Tree
              </h1>
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full justify-between items-center p-3 md:p-5 card rounded-lg min-h-[300px] md:min-h-[400px]">
            <div className="h-full w-full flex flex-col justify-center items-center overflow-hidden">
              <svg
                ref={svgHeapRef}
                viewBox="0 0 600 350"
                preserveAspectRatio="xMidYMid meet"
                className="w-full h-full max-w-[600px] max-h-[350px]"
              ></svg>
              <div className="flex p-1 m-2 flex-row align-center content-center justify-center gap-2 items-center  w-fit h-[60px] rounded-sm">
                {'HEAP'.split('').map((ch) => (
                  <div data-char={ch} className="heap-node">
                    {ch}
                  </div>
                ))}
              </div>
            </div>
            <div className="card-name">
              <h1 className="card-text" onClick={() => navigate('/heap')}>
                Heap
              </h1>
            </div>
          </div>
        </div>

        {/* Graph Container */}
        <div className="flex flex-col justify-center items-center w-full min-h-[350px] md:h-[500px] rounded-sm ddrag-container card relative overflow-hidden">
          {/* FIXED: using viewBox to lock coordinates so the center is perfectly framed */}
          <svg
            viewBox="0 0 1000 400"
            preserveAspectRatio="xMidYMid meet"
            style={{ display: 'block', width: '100%', height: '100%' }}
          >
            {links.map((link: any, index: number) => {
              const sourceNode = link.source;
              const targetNode = link.target;
              if (!sourceNode || !targetNode) return null;

              return (
                <path
                  key={`link-${index}`}
                  id={`path-${sourceNode.id}-${targetNode.id}`}
                  className="d3-link"
                  d={`M ${sourceNode.x} ${sourceNode.y} L ${targetNode.x} ${targetNode.y}`}
                  fill="none"
                  stroke="var(--edge)"
                  strokeWidth="3"
                />
              );
            })}

            {nodes.map((node) => (
              <g key={node.id} className="ddrag">
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="25"
                  fill="var(--viz-item-bg)"
                  stroke="var(--viz-item-border)"
                  strokeWidth="2"
                />
                <text
                  x={node.x}
                  y={node.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--viz-item-text)"
                  fontSize="16"
                  fontWeight="700"
                >
                  {node.label}
                </text>
              </g>
            ))}
          </svg>

          <div className="card-name absolute bottom-2 left-2">
            <h1 className="card-text w-fit" onClick={() => navigate('/graph')}>
              Graph
            </h1>
          </div>
        </div>

        {/* Linked List Container */}
        <div
          ref={linkedListCardRef}
          onMouseEnter={playLinkedListHover}
          onMouseLeave={resetLinkedListHover}
          className="relative flex flex-col justify-between items-center h-[250px] w-full card rounded-lg p-3 md:p-5 overflow-hidden"
        >
          <div
            ref={linkedListPointerRef}
            className="pointer-events-none absolute left-0 top-0 rounded-md bg-blue-200 px-4 py-2 text-sm font-bold uppercase tracking-wide text-slate-900 border border-blue-300 shadow-sm"
          >
            Head
          </div>
          <div className="h-full w-full flex justify-center items-center gap-1 py-4">
            {['L', 'I', 'N', 'K', 'E', 'D'].map((char, index) => (
              <div
                key={index}
                className="flex flex-row items-center justify-center gap-2"
              >
                <div className="linked-node ll-node">{char}</div>
                {index !== 5 && <RightArrow className="w-4 h-4 ll-arrow" />}
              </div>
            ))}
          </div>

          <div className="card-name">
            <h1 className="card-text" onClick={() => navigate('/linkedlist')}>
              Linked List
            </h1>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
