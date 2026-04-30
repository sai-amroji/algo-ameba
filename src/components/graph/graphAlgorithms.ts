import {type AdjEdge } from "./graphConfig";
import { MinPriorityQueue } from '@datastructures-js/priority-queue';

function  buildAdjList(nodes:any[],links:any[],isDirected:boolean){
 
  const adj = new Map<number,AdjEdge[]>();

  nodes.forEach((node) => adj.set(node.id,[]))


  links.forEach((link) => {
    const src = link.source.id ?? link.source
    const dst = link.target.id ?? link.target
    const wt = link.weight || 1;

    adj.get(src)?.push({target:dst,weight:wt})

    if(!isDirected){
          adj.get(dst)?.push({target:src,weight:wt})

    }

  });


  return adj;
}


function runBFS(adj:Map<number,AdjEdge[]>,startId:number,targetId?:number){



  const animateNodes:number[] = [];
  const animateEdges:{source:number,target:number}[] = [];
  const visited = new Set<number>() 

    const queue:number[] = [startId]

    animateNodes.push(startId)
    visited.add(startId)

    



    while(queue.length > 0){
     const node = queue.shift()!;
     if(node == targetId){
        break
     }

     const nei = adj.get(node) || []
     for(const edge of nei){
      if(!visited.has(edge.target)){
   visited.add(edge.target);
   queue.push(edge.target);


   animateEdges.push({source:node,target:edge.target})
   animateNodes.push(edge.target)



      }
     }
     
    }



    return {animateNodes,animateEdges}
}

function runDFS(adj: Map<number, AdjEdge[]>, startId: number, targetId?: number) {
  const animateNodes: number[] = [];
  const animateEdges: { source: number; target: number }[] = [];
  const visited = new Set<number>();
  
  const stack: { child: number; parent: number | null }[] = [{ child: startId, parent: null }];

  while (stack.length > 0) {
    const { child, parent } = stack.pop()!;

    if (!visited.has(child)) {
      visited.add(child);
      
      // Record for GSAP
      animateNodes.push(child);
      if (parent !== null) {
        animateEdges.push({ source: parent, target: child });
      }

      if (child === targetId) break;

      const nei = adj.get(child) || [];
      // Loop backwards to traverse left-to-right visually
      for (let i = nei.length - 1; i >= 0; i--) {
        const edge = nei[i];
        if (!visited.has(edge.target)) {
          stack.push({ child: edge.target, parent: child });
        }
      }
    }
  }

  return { animateNodes, animateEdges };
}



// ... other imports


function runDijstras(adj: Map<number, AdjEdge[]>, startId: number, targetId?: number) {
  const animateNodes: number[] = [];
  const animateEdges: { source: number; target: number }[] = [];
  
  const dist = new Map<number, number>();
  // NEW: Keep track of the best parent for the final path reconstruction
  const parentMap = new Map<number, number | null>(); 

  adj.forEach((_, key) => dist.set(key, Infinity));
  dist.set(startId, 0);
  parentMap.set(startId, null);

  const visited = new Set<number>();
  
  const pq = new MinPriorityQueue<{ curr: number; cost: number; parent: number | null }>((item) => item.cost);
  pq.enqueue({ curr: startId, cost: 0, parent: null });

  while (!pq.isEmpty()) {
    const dequeued = pq.dequeue();
    if (!dequeued) break;
    
    const { curr, cost, parent } = dequeued;

    if (visited.has(curr)) continue;
    
    visited.add(curr);
    
    // Record exploration for GSAP
    animateNodes.push(curr);
    if (parent !== null) {
      animateEdges.push({ source: parent, target: curr });
    }

    if (curr === targetId) break;

    const nei = adj.get(curr) || [];
    for (const edge of nei) {
      if (!visited.has(edge.target)) {
        const newCost = cost + edge.weight;
        
        if (newCost < (dist.get(edge.target) || Infinity)) {
          dist.set(edge.target, newCost);
          parentMap.set(edge.target, curr); // Record the path!
          pq.enqueue({ curr: edge.target, cost: newCost, parent: curr });
        }
      }
    }
  }

  // NEW: Reconstruct the Shortest Path!
  const shortestPathNodes: number[] = [];
  const shortestPathEdges: { source: number; target: number }[] = [];

  // If a target was provided and we successfully reached it
  if (targetId !== undefined && visited.has(targetId)) {
    let current: number | null | undefined = targetId;
    
    while (current !== null && current !== undefined) {
      shortestPathNodes.push(current);
      const p = parentMap.get(current);
      if (p !== null && p !== undefined) {
        shortestPathEdges.push({ source: p, target: current });
      }
      current = p;
    }
    
    // Reverse them because we traced backwards from target to start
    shortestPathNodes.reverse();
    shortestPathEdges.reverse();
  }

  // Return the new path arrays to GSAP
  return { animateNodes, animateEdges, shortestPathNodes, shortestPathEdges };
}


function runKruskals(adj:Map<number,AdjEdge[]>,startId:number,targetId?:number){




  const animateNodes:number[] = []
  const animateEdges:{source:number,target:number}[] = [];
  const visited = new Set<number>();

  const stack:{curr:number,parent:number | null}[] = [
    {curr:startId,parent:null}
  ]


  while(stack.length > 0){
    const popped = stack.pop();
    if (!popped) break;
    
    const {curr,parent} = popped;



    if(!visited.has(curr)){
      visited.add(curr)
      animateNodes.push(curr)
    }

    if(parent !== null){
      animateEdges.push({source:parent,target:curr});
    }


    if(curr == targetId){
      break
    }

    const nei = adj.get(curr) || []


    for(let i = nei.length-1; i >= 0 ; i--){
      const edge = nei[i]
      if(!visited.has(edge.target)){
        stack.push({curr:edge.target,parent:curr})
      }
    }

  }



  return {animateNodes,animateEdges}

}
function runPrims(adj:Map<number,AdjEdge[]>,startId:number,targetId?:number){




  const animateNodes:number[] = []
  const animateEdges:{source:number,target:number}[] = [];
  const visited = new Set<number>();

  const stack:{curr:number,parent:number | null}[] = [
    {curr:startId,parent:null}
  ]


  while(stack.length > 0){
    const popped = stack.pop();
    if (!popped) break;
    
    const {curr,parent} = popped;



    if(!visited.has(curr)){
      visited.add(curr)
      animateNodes.push(curr)
    }

    if(parent !== null){
      animateEdges.push({source:parent,target:curr});
    }


    if(curr == targetId){
      break
    }

    const nei = adj.get(curr) || []


    for(let i = nei.length-1; i >= 0 ; i--){
      const edge = nei[i]
      if(!visited.has(edge.target)){
        stack.push({curr:edge.target,parent:curr})
      }
    }

  }



  return {animateNodes,animateEdges}

}




export {buildAdjList,runBFS,runDFS,runDijstras,runKruskals,runPrims}