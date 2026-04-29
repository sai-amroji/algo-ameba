import { Select } from "@radix-ui/react-select";
import { Button } from "../ui/button";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup";
import algorithms from "./graphConfig";
import { runBFS, runDFS, runDijstras, buildAdjList } from "./graphAlgorithms";
const EDGE_BASE_COLOR = "#64748b"; // slate-500: visible on light and dark backgrounds


const GraphPage = () => {
  // --- 1. State Management ---
  const [algo, setAlgo] = useState("BFS");
  
  // Separate states for different inputs
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [numNodes, setNumNodes] = useState<string>("");
  
  // Graph property states
  const [isDirected, setIsDirected] = useState(false);
  const [isWeighted, setIsWeighted] = useState(true);

  const graphRef = useRef<SVGSVGElement>(null);



   const {contextSafe}  = useGSAP({scope:graphRef});



   const onRun = contextSafe(() => {
     
    const startNum = parseInt(startNode);
    if(isNaN(startNum)){
      alert("Please enter valid start Node")
      return 
    }


    console.log(`Parsed Num:${startNum}`)

    const adjList = buildAdjList(graphData.nodes,graphData.links,isDirected);


    console.log(`adj List:${adjList}`)


    let animationData;

    if(algo === "BFS"){
      const targetNum = endNode ? parseInt(endNode) : undefined
    
      animationData = runBFS(adjList,startNum,targetNum)
    }

    if(algo == "DFS") {
      const targetNum = endNode ? parseInt(endNode) : undefined
      animationData = runDFS(adjList,startNum,targetNum)
    }


    if(algo == "Dijkstra's Algorithm"){
      const targetNum = endNode ? parseInt(endNode) : undefined
      animationData = runDijstras(adjList,startNum,targetNum)
      const { animateNodes, animateEdges, shortestPathNodes, shortestPathEdges } = animationData;

    const tl = gsap.timeline();

    // 1. Reset everything to default colors
    tl.to("circle", { fill: "#3b82f6", duration: 0.2 });
    tl.to("line", { stroke: EDGE_BASE_COLOR, strokeWidth: 2, duration: 0.2 }, "<");

    // 2. Highlight Start Node
    tl.to(`#node-${animateNodes[0]}`, { fill: "#eab308", duration: 0.2 });

    // 3. EXPLORATION PHASE
    // Let's make exploration slightly faster so we get to the answer quicker
    for (let i = 0; i < animateEdges.length; i++) {
      const edge = animateEdges[i];
      const nextNode = animateNodes[i + 1];

      tl.to(`#edge-${edge.source}-${edge.target}, #edge-${edge.target}-${edge.source}`, {
        stroke: EDGE_BASE_COLOR,
        strokeWidth: 3,
        duration: 0.15 // Faster!
      });

      tl.to(`#node-${nextNode}`, {
        fill: "#22c55e", // Green for visited nodes
        duration: 0.15,
        ease: "power1.inOut"
      });
    }

    // 4. SHORTEST PATH PHASE (DIJKSTRA ONLY)
    // If the algorithm returned a shortest path, draw it boldly!
    if (shortestPathEdges && shortestPathEdges.length > 0) {
      
      // Pause for half a second for dramatic effect before revealing the path
      tl.to({}, { duration: 0.5 });

      for (let i = 0; i < shortestPathEdges.length; i++) {
        const edge = shortestPathEdges[i];
        const nextNode = shortestPathNodes[i + 1];

        // Draw the shortest path edge thick and red
        tl.to(`#edge-${edge.source}-${edge.target}, #edge-${edge.target}-${edge.source}`, {
          stroke: "#ef4444", // Red-500
          strokeWidth: 6,
          duration: 0.3
        });

        // Color the path nodes red (but don't overwrite the yellow start node)
        if (nextNode !== animateNodes[0]) {
          tl.to(`#node-${nextNode}`, {
            fill: "#ef4444", // Red-500
            duration: 0.3,
            ease: "back.out(1.5)"
          }, "<"); // Run at the same time as the edge animation
        }
      }
    }
    }

    console.log(`Animation data:${animationData}`)


    if(!animationData){
      return 

    }


    const {animateNodes,animateEdges} = animationData;

    const tl = gsap.timeline();


    tl.to("circle",{
      fill:"blue",
      duration:0.2
    })
    tl.to("line",{
      stroke: EDGE_BASE_COLOR,
      strokeWidth:2,
      duration:0.2
    },"<")



    tl.to(`#node-${animateNodes[0]}`,{
        fill:"yellow",
        duration:0.2
    })


    for(let i = 0 ; i < animateEdges.length ; i++){
      const edge = animateEdges[i];
      const nextNode = animateNodes[i+1];

      tl.to(`#edge-${edge.source}-${edge.target}, #edge-${edge.target}-${edge.source}`,{
        stroke:"green",
        strokeWidth:4,
        drawSVG:"0% 100%",
        duration:0.4
      })


      tl.to(`#node-${nextNode}`,{
        fill:"green",
        duration:0.4,
        ease:"back.out(1.5)"
      })
    }

   })



  const [graphData, setGraphData] = useState({
    nodes: [
      { id: 1, label: "1" }, { id: 2, label: "2" }, { id: 3, label: "3" },
      { id: 4, label: "4" }, { id: 5, label: "5" },
    ],
    links: [
      { source: 1, target: 2, weight: 4 }, { source: 1, target: 3, weight: 2 },
      { source: 2, target: 4, weight: 5 }, { source: 3, target: 5, weight: 10 },
      { source: 4, target: 5, weight: 3 },
    ],
  });


  const [isRunning, setIsRunning] = useState(false); // Track if an algorithm is currently running
  const [error, setError] = useState(""); // For displaying input validation errors




  // Keep D3 effects in sync with isDirected toggle
  useEffect(() => {
    if (!graphRef.current) return;

    const svg = d3.select(graphRef.current);
    const width = graphRef.current.clientWidth || 800;
    const height = graphRef.current.clientHeight || 600;

    svg.selectAll("*").remove(); 

    // Setup arrow markers for directed graphs
    if (isDirected) {
      svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 28) // Adjust to sit on edge of node radius
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", EDGE_BASE_COLOR)
        .style("stroke", "none");
    }

    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = graphData.links.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("id",(d:any) => `edge-${d.source.id ?? d.source}-${d.target.id ?? d.target}`)
      .attr("stroke", EDGE_BASE_COLOR)
      .attr("stroke-width", (d: any) => Math.sqrt(d.weight || 1) * 1.5)
      .attr("marker-end", isDirected ? "url(#arrowhead)" : ""); // Apply arrows

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .call(
        d3.drag<SVGGElement, any>()
          .on("start", (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (event: any, d: any) => { d.fx = event.x; d.fy = event.y; })
          .on("end", (event: any, d: any) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("id",(d:any) => `node-${d.id}`)
      .attr("r", 25)
      .attr("fill", "#3b82f6")
      .attr("stroke", "#000")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d: any) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("fill", "#fff")
      .attr("font-size", "14px")
      .attr("font-family", "monospace");

    // Only render weights if the configuration allows it AND the toggle is on
    const edgeLabels = svg
      .append("g")
      .selectAll("text")
      .data(links)
      .enter()
      .append("text")
      .text((d: any) => (isWeighted ? d.weight : ""))
      .attr("font-size", "12px")
      .attr("fill", "white");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      edgeLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2 - 5);
    });

    return () => simulation.stop();
  }, [graphData, isDirected, isWeighted]); // Re-render when config toggles change

  const onRandom = () => {
    const parsedInput = parseInt(numNodes);
    const nodeCount = !isNaN(parsedInput) && parsedInput > 1 
      ? parsedInput 
      : Math.floor(Math.random() * 11) + 5; 

    const newNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: i + 1, label: `${i + 1}`,
    }));

    const newLinks: Array<{ source: number; target: number; weight: number }> = [];

    for (let i = 1; i < nodeCount; i++) {
      const targetNode = Math.floor(Math.random() * i);
      newLinks.push({
        source: i + 1,
        target: targetNode + 1,
        weight: isWeighted ? Math.floor(Math.random() * 20) + 1 : 1, // Default to 1 if unweighted
      });
    }

    const extraEdges = Math.floor(Math.random() * nodeCount);
    for (let i = 0; i < extraEdges; i++) {
      const source = Math.floor(Math.random() * nodeCount) + 1;
      let target = Math.floor(Math.random() * nodeCount) + 1;

      while (target === source) {
        target = Math.floor(Math.random() * nodeCount) + 1;
      }

      const edgeExists = newLinks.some(
        (l) => (l.source === source && l.target === target) ||
               (!isDirected && l.source === target && l.target === source)
      );

      if (!edgeExists) {
        newLinks.push({
          source, target,
          weight: isWeighted ? Math.floor(Math.random() * 20) + 1 : 1,
        });
      }
    }

    setGraphData({ nodes: newNodes, links: newLinks });
  };

  const currentConfig = algorithms[algo];

  return (
    <div className="flex flex-col h-screen w-full shell">
      <div className="nav w-full flex justify-between items-center mt-4 px-10">
        
        {/* Dynamic Inputs */}
        <div className="left-section flex flex-wrap justify-start items-center gap-2">
          {currentConfig.startNode && (
            <input
              className="input w-[120px]"
              placeholder="Start Node"
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
            />
          )} 
          
          {currentConfig.endNode && (
            <input
              className="input w-[120px]"
              placeholder="End Node"
              value={endNode}
              onChange={(e) => setEndNode(e.target.value)}
            />
          )}
          
          {(currentConfig.startNode || currentConfig.endNode) && (
             <button className="btn-primary">Enter</button>
          )}

          <div className="flex gap-2 ml-4">
            <input
              className="input w-[150px]"
              placeholder="Number of Nodes"
              value={numNodes}
              onChange={(e) => setNumNodes(e.target.value)}
            />
            <button onClick={onRandom} className="btn-neutral">
              Generate Random
            </button>
          </div>

          {/* Dynamic Property Toggles */}
          <div className="flex gap-2 ml-4">
            {currentConfig.allowedNodeTypes.includes("directed") && (
              <Button 
                variant={isDirected ? "default" : "outline"}
                onClick={() => setIsDirected(true)}
              >
                Directed
              </Button>
            )}
            {currentConfig.allowedNodeTypes.includes("undirected") && (
              <Button 
                variant={!isDirected ? "default" : "outline"}
                onClick={() => setIsDirected(false)}
              >
                Undirected
              </Button>
            )}
            {currentConfig.weighted && (
              <Button 
                variant={isWeighted ? "default" : "outline"}
                onClick={() => setIsWeighted(!isWeighted)}
              >
                {isWeighted ? "Weighted" : "Unweighted"}
              </Button>
            )}
          </div>
        </div>

        {/* Algorithm Selector */}
        <div className="right-section flex justify-center items-center gap-4">
          <Select value={algo} onValueChange={setAlgo}>
            <SelectTrigger className="w-56 h-9 transition-colors font-mono text-sm">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel className="font-mono text-xs">Algorithms</SelectLabel>
                {Object.keys(algorithms).map((a) => (
                  <SelectItem key={a} value={a} className="capitalize font-mono text-sm">
                    {a}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        {/* <div className="flex w-full h-full"> */}
        <button className="btn-success" onClick={onRun}>
          Run
        </button>
        {/* </div> */}
        </div>
      </div>

      <div className="flex-grow w-full flex justify-center items-center overflow-hidden">
        <svg ref={graphRef} className="w-full h-full min-h-[600px]"></svg>
      </div>
    </div>
  );
};

export default GraphPage;