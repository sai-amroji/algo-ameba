import { algos } from "@/constants/algosInfo";
import AlgoCard from "@/components/AlgoCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { useNavigate } from "react-router-dom";
import logo from "../../public/Ameba.png";
import { ROUTES } from "@/constants/routes";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { flushSync } from "react-dom";

const RightArrow = ({ className = "w-6 h-6 text-white" }) => (
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

const Homepage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgHeapRef = useRef<SVGSVGElement>(null); // Added ref for Heap

  const treeData = {
    num: 10,
    children: [
      {
        num: 5, children: [
          { num: 3, children: [] },
          { num: 7, children: [] }
        ]
      },
      {
        num: 15, children: [
          { num: 12, children: [] },
          { num: 20, children: [] }
        ]
      },
    ]
  };

  // Valid Max-Heap Data structure
  const heapData = {
    num: 50,
    children: [
      {
        num: 40, children: [
          { num: 20, children: [] },
          { num: 15, children: [] }
        ]
      },
      {
        num: 35, children: [
          { num: 10, children: [] },
          { num: 25, children: [] }
        ]
      },
    ]
  };

  const safeLength = 15;
  const [nodes, setNodes] = useState<{ id: number, x: number, y: number }[]>([]);
  const [links, setLinks] = useState<{ source: number, target: number }[]>([]);
  const [bars, setBars] = useState<number[]>([]);

  // GRAPH SIMULATION EFFECT
  useEffect(() => {
    let safeLength = 15;
    const random = Array.from({ length: safeLength }, (_, index) => ({
      value: index + 1,
      id: index,
    })).sort(() => Math.random() - 0.5);
    flushSync(() => {
      setBars(random as any);
    });

    // FIXED: Use a hardcoded viewBox coordinate system instead of window.innerWidth
    const simWidth = 1000;
    const simHeight = 400;
    const nodeRadius = 25;

    const initialNodes = Array.from({ length: safeLength }, (_, i) => ({
      id: i,
      x: Math.random() * (simWidth - nodeRadius * 2) + nodeRadius,
      y: Math.random() * (simHeight - nodeRadius * 2) + nodeRadius,
      vx: 0,
      vy: 0,
    }));

    const initialLinks: { source: number, target: number }[] = [];
    for (let i = 0; i < safeLength; i++) {
      if (i < safeLength - 1) {
        initialLinks.push({ source: i, target: i + 1 });
      }
      const randomTarget = Math.floor(Math.random() * safeLength);
      if (randomTarget !== i) {
        initialLinks.push({ source: i, target: randomTarget });
      }
    }

    const simulation = d3.forceSimulation(initialNodes)
      .force("link", d3.forceLink(initialLinks).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-150))
      // FIXED: Center exactly in the middle of our 1000x400 viewBox
      .force("center", d3.forceCenter(simWidth / 2, simHeight / 2))
      .force("collision", d3.forceCollide().radius(nodeRadius + 10))
      .force("bounds", () => {
        initialNodes.forEach((node: any) => {
          const margin = nodeRadius;
          if (node.x - margin < 0) node.x = margin;
          if (node.x + margin > simWidth) node.x = simWidth - margin;
          if (node.y - margin < 0) node.y = margin;
          if (node.y + margin > simHeight) node.y = simHeight - margin;
        });
      })
      .on("tick", () => {
        setNodes([...initialNodes]);
        setLinks([...initialLinks]);
      });

    return () => simulation.stop();
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


  // Reusable function to draw both Tree and Heap cohesively
  const drawHierarchy = (svgElement: SVGSVGElement, data: any) => {
    const w = 600;
    const height = 300;
    const margins = { top: 40, right: 20, bottom: 40, left: 20 };

    d3.select(svgElement).selectAll("*").remove();

    const svg = d3.select(svgElement)
      .append("g")
      .attr("transform", `translate(${margins.left},${margins.top})`);

    const root = d3.hierarchy(data);
    const treeLayout = d3.tree<any>()
      .size([w - margins.left - margins.right, height - margins.top - margins.bottom]);

    treeLayout(root);

    svg.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkVertical<any, any>().x((d: any) => d.x).y((d: any) => d.y))
      .attr("fill", "none")
      .attr("stroke", "black") // Cohesive black lines
      .attr("stroke-width", 2);

    const nodes = svg.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    nodes.append("circle")
      .attr("r", 25) // Cohesive larger sizing
      .attr("fill", "#1d4ed8") // Tailwind bg-blue-700 to match other cards
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    nodes.append("text")
      .attr("dy", "5px") // Vertically centers text inside the circle
      .attr("text-anchor", "middle")
      .text((d: any) => d.data.num)
      .attr("font-size", "18px")
      .attr("fill", "white") // White text inside blue node
      .attr("font-weight", "bold");
  };

  return (
    <div className="page-shell bg-slate-950 page-enter  ">
      {/* Navbar */}
      <div className="page-nav fixed top-0 w-full h-16 flex justify-between items-center px-6 py-2 z-50">
        <div className="flex items-center gap-6" >
          <img
            src={logo}
            onClick={() => navigate("/landing")}
            className="h-25 w-25 mt-5 cursor-pointer transition-transform duration-300 hover:scale-105"
            alt="logo"
          />
          <Input
            name="search"
            className="app-input h-10 w-[min(60vw,900px)]"
          />
        </div>
        <div className="flex items-center gap-6 font-[audiowide] text-lg">
          <p className="nav-link cursor-pointer" onClick={() => navigate(ROUTES.home)}>Home</p>
          <p className="nav-link cursor-pointer" onClick={() => navigate(ROUTES.algorithms)}>Algorithms</p>
          <p className="nav-link cursor-pointer" onClick={() => navigate(ROUTES.about)}>About</p>
          <div className="green-icon-btn">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="section-fade pt-32 pb-16 px-8 md:px-12">
        {/* <img src="../../public/Ameba.png" width={10} height={10} className="z-100" /> */}
        <div className="flex items-center font-[audiowide] text-accent-foreground justify-start gap-12">
          <div className="flex flex-col items-start">
            <h1 className="text-6xl md:text-8xl font-bold font-[audiowide]">Algo</h1>
            <h1 className="text-6xl md:text-8xl font-bold font-plex drop-shadow-md">Ameba</h1>
          </div>
          <p className="text-xl md:text-2xl text-accent-foreground font-plex max-w-xl mt-10 md:mt-20">
            Vizualize Any Algorithm with <span className="font-semibold">Fluid Animations</span>
          </p>
        </div>
      </section>


      {/* Custom Visuals Section */}
      <section className="section-fade py-16 flex flex-col items-center gap-6 mx-10 ">

        {/* Search Container */}
        <div className="flex flex-col w-full justify-center items-center m-5 p-5 bg-slate-900 rounded-lg hover:border-green-500  hover:border-2 transition-easeIn  ">
          <div className="flex p-1 m-2 flex-row align-center content-center justify-center gap-2 items-center border-2 rounded-sm border-black w-full h-[75px]">
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">S</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">E</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">A</div>
            <div className="flex rounded-sm bg-green-400 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">R</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">C</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">H</div>
          </div>
          <div className="self-start mt-2 w-full p-2">
            <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate('/search')}>Search</h1>
          </div>
        </div>


        {/* Stack & Sorting Container */}
        <div className="flex flex-row w-full gap-10 items-stretch">
          <div className="flex-1 flex flex-col justify-between items-center p-5 bg-slate-900 rounded-lg min-h-[500px] hover:border-green-500  hover:border-2 transition-easeIn">
            <div className="flex p-1 m-2 flex-col rounded-sm justify-center items-center border-2 border-y-0 border-b-2 border-black h-full w-[300px]">
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center mb-1 h-full w-full px-10 text-white font-bold">S</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center mb-1 h-full w-full px-10 text-white font-bold">T</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center mb-1 h-full w-full px-10 text-white font-bold">A</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center mb-1 h-full w-full px-10 text-white font-bold">C</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center mb-1 h-full w-full px-10 text-white font-bold">K</div>
            </div>
            <div className="self-start mt-2 w-full p-2">
              <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate("/stack")}>Stack</h1>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between items-center p-5 bg-slate-900 rounded-lg min-h-[500px] hover:border-green-500  hover:border-2 transition-easeIn">
            <div className="flex py-1 my-2 flex-row rounded-lg items-end justify-center gap-2 border-0 w-full h-full">
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-[75px] w-[35px] text-white font-bold">S</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-[175px] w-[35px] text-white font-bold">O</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-[45px] w-[35px] text-white font-bold">R</div>
              <div className="flex rounded-sm bg-yellow-300 border-2 border-black justify-center items-center h-[75px] w-[35px] text-white font-bold">T</div>
              <div className="flex rounded-sm bg-yellow-300 border-2 border-black justify-center items-center h-[89px] w-[35px] text-white font-bold">I</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-[99px] w-[35px] text-white font-bold">N</div>
              <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-[230px] w-[35px] text-white font-bold">G</div>
            </div>
            <div className="self-start mt-2 w-full p-2">
              <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate("/sort")}>Sorting</h1>
            </div>
          </div>
        </div>

        {/* Queue Container */}
        <div className="flex flex-col w-full justify-center items-center m-5 p-5 bg-slate-900 rounded-lg hover:border-green-500  hover:border-2 transition-easeIn">
          <div className="flex p-1 m-2 flex-row align-center content-center justify-center gap-2 items-center border-2 border-x-0 border-b-2 border-black w-full h-[75px] rounded-sm ">
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">Q</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">U</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">E</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">U</div>
            <div className="flex rounded-sm bg-blue-700 border-2 border-black justify-center items-center h-full w-full px-10 text-white font-bold">E</div>
          </div>
          <div className="self-start mt-2 w-full p-2">
            <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate("/queue")}>Queue</h1>
          </div>
        </div>

        {/* Tree & Heap Container */}
        <div className="flex w-full h-full flex-1 gap-10">
          <div className="flex-1 flex flex-col w-full justify-between items-center p-5 bg-slate-900 rounded-lg min-h-[400px] hover:border-green-500  hover:border-2 transition-easeIn">
            <div ref={containerRef} className="h-full w-full flex justify-center items-center">
              <svg ref={svgRef} width="600" height="350"></svg>
            </div>
            <div className="self-start mt-2 w-full p-2">
              <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate("/tree")}>Tree</h1>
            </div>
          </div>

          <div className="flex-1 flex flex-col w-full justify-between items-center p-5 bg-slate-900 rounded-lg min-h-[400px] hover:border-green-500  hover:border-2 transition-easeIn">
            <div className="h-full w-full flex justify-center items-center">
              <svg ref={svgHeapRef} width="600" height="350"></svg>
            </div>
            <div className="self-start mt-2 w-full p-2">
              <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate("/heap")}>Heap</h1>
            </div>
          </div>
        </div>

        {/* Graph Container */}
        <div className='flex flex-col justify-center items-center w-full h-[500px] rounded-sm ddrag-container bg-slate-900 relative hover:border-green-500  hover:border-2 transition-easeIn'>
          {/* FIXED: using viewBox to lock coordinates so the center is perfectly framed */}
          <svg viewBox="0 0 1000 400" preserveAspectRatio="xMidYMid meet" style={{ display: 'block', width: '100%', height: '100%' }}>
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
                  stroke="black" // Changed to match borders
                  strokeWidth="3"
                />
              );
            })}
            
            {nodes.map((node) => (
              <circle
                className='ddrag'
                key={node.id}
                cx={node.x}
                cy={node.y}
                r="25"
                fill="#1d4ed8" // bg-blue-700
                stroke="black"
                strokeWidth="2"
              />
            ))}
          </svg>

          <div className="self-start mt-2 w-full p-2 absolute bottom-2 left-2">
            <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline w-fit" onClick={() => navigate("/graph")}>Graph</h1>
          </div>
        </div>

        {/* Linked List Container */}
        <div className="flex flex-col justify-between items-center h-[250px] w-full flex bg-slate-900 rounded-lg p-5 mt-6 hover:border-green-500  hover:border-2 transition-easeIn">
          <div className="h-full w-full flex justify-center items-center gap-2">
            {["L", "I", "N", "K", "E", "D"].map((char, index) => (
              <div key={index} className="flex flex-row items-center justify-center gap-2">
                <div className="h-[80px] w-[100px] bg-blue-700 rounded-sm p-2 border-2 border-black flex justify-center items-center text-white text-3xl font-bold">
                  {char}
                </div>
                {index !== 5 && <RightArrow />}
              </div>
            ))}
          </div>

          <div className="self-start mt-2 w-full p-2">
            <h1 className="flex justify-start text-white font-bold text-2xl p-2 rounded cursor-pointer hover:underline" onClick={() => navigate("/linkedlist")}>Linked List</h1>
          </div>
        </div>

      </section>
    </div>
  );
};

export default Homepage;