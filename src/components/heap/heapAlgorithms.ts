import { type HeapNode } from "./heapTypes";



function shouldSwap(a: number, b: number,maxHeap: boolean): boolean {
  return maxHeap ? a > b : a < b;
}

function pushToHeap(heap: number[], val: number, maxHeap: boolean): { newHeap: number[]; animateNodes: {childIdx:number,parentIdx:number}[] } {
  const newHeap = [...heap, val];
  let childIdx = newHeap.length - 1;
  let parentIdx = Math.floor((childIdx - 1) / 2);
  const animateNodes:{childIdx:number,parentIdx:number}[] = [];

  while (childIdx > 0 && shouldSwap(newHeap[childIdx], newHeap[parentIdx],maxHeap)) {
    [newHeap[childIdx], newHeap[parentIdx]] = [newHeap[parentIdx], newHeap[childIdx]];
    animateNodes.push({childIdx,parentIdx});
    childIdx = parentIdx;
    parentIdx = Math.floor((childIdx - 1) / 2);
  }

  return { newHeap, animateNodes };
}

function popFromHeap(heap: number[], maxHeap: boolean): { newHeap: number[]; animateNodes: {childIdx:number,parentIdx:number}[] } {
  if (heap.length === 0) return { newHeap: [], animateNodes: [] };
  if (heap.length === 1) return { newHeap: [], animateNodes: [] };

  const newHeap = [...heap];
  // Move the last element to the root


  newHeap[0] = newHeap.pop()!;
  let parentIdx = 0;
  const animateNodes:{childIdx:number,parentIdx:number}[] = [];

  while (true) {
    let leftChildIdx = 2 * parentIdx + 1;
    let rightChildIdx = 2 * parentIdx + 2;
    let targetIdx = parentIdx;

    if (leftChildIdx < newHeap.length && shouldSwap(newHeap[leftChildIdx], newHeap[targetIdx], maxHeap)) {
      targetIdx = leftChildIdx;
    }

    if (rightChildIdx < newHeap.length && shouldSwap(newHeap[rightChildIdx], newHeap[targetIdx], maxHeap)) {
      targetIdx = rightChildIdx;
    }

    if (targetIdx !== parentIdx) {
      animateNodes.push({ childIdx: targetIdx, parentIdx });
      [newHeap[parentIdx], newHeap[targetIdx]] = [newHeap[targetIdx], newHeap[parentIdx]];
      parentIdx = targetIdx;
    } else {
      break;
    }
  }

  return { newHeap, animateNodes };
}




function buildTreeFromArray(arr: number[], index: number = 0): HeapNode | null {
  if (index >= arr.length) return null;

  return {
    id: `node-${index}`,
    index,
    val: arr[index],
    left: buildTreeFromArray(arr, 2 * index + 1),
    right: buildTreeFromArray(arr, 2 * index + 2),
  };
}


export { pushToHeap, popFromHeap, buildTreeFromArray }; 