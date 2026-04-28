import { type HeapNode } from "./heapTypes";
// ─── PURE ALGORITHM FUNCTIONS (ARRAY BASED) ───────────────────────────────

// Min-Heap Push
function pushToHeap(heap: number[], val: number,maxHeap: boolean): number[] {
  const newHeap = [...heap, val];
  let childIdx = newHeap.length - 1;
  let parentIdx = Math.floor((childIdx - 1) / 2);



  
  if(maxHeap) {
    while (childIdx > 0 && newHeap[childIdx] > newHeap[parentIdx]) {
      [newHeap[childIdx], newHeap[parentIdx]] = [newHeap[parentIdx], newHeap[childIdx]];
      childIdx = parentIdx;
      parentIdx = Math.floor((childIdx - 1) / 2);
    }
  }
  else{
  while (childIdx > 0 && newHeap[childIdx] < newHeap[parentIdx]) {
    [newHeap[childIdx], newHeap[parentIdx]] = [newHeap[parentIdx], newHeap[childIdx]];
    childIdx = parentIdx;
    parentIdx = Math.floor((childIdx - 1) / 2);
  }
}

  return newHeap;
}

// Min-Heap Pop
function popFromHeap(heap: number[],maxHeap:boolean): number[] {
  if (heap.length === 0) return [];
  if (heap.length === 1) return [];

  const newHeap = [...heap];
  // Move the last element to the root
  newHeap[0] = newHeap.pop()!;
  let parentIdx = 0;




if(maxHeap){
  // Bubble down
  while (true) {
    let leftChildIdx = 2 * parentIdx + 1;
    let rightChildIdx = 2 * parentIdx + 2;
    let smallestIdx = parentIdx;

    if (leftChildIdx < newHeap.length && newHeap[leftChildIdx] < newHeap[smallestIdx]) {
      smallestIdx = leftChildIdx;
    }
    
    if (rightChildIdx < newHeap.length && newHeap[rightChildIdx] < newHeap[smallestIdx]) {
      smallestIdx = rightChildIdx;
    }

    if (smallestIdx !== parentIdx) {
      [newHeap[parentIdx], newHeap[smallestIdx]] = [newHeap[smallestIdx], newHeap[parentIdx]];
      parentIdx = smallestIdx; 
    } else {
      break; 
    }
  }
}
  else{
  while (true) {
    let leftChildIdx = 2 * parentIdx + 1;
    let rightChildIdx = 2 * parentIdx + 2;
    let smallestIdx = parentIdx;

    if (leftChildIdx < newHeap.length && newHeap[leftChildIdx] < newHeap[smallestIdx]) {
      smallestIdx = leftChildIdx;
    }
    
    if (rightChildIdx < newHeap.length && newHeap[rightChildIdx] < newHeap[smallestIdx]) {
      smallestIdx = rightChildIdx;
    }

    if (smallestIdx !== parentIdx) {
      [newHeap[parentIdx], newHeap[smallestIdx]] = [newHeap[smallestIdx], newHeap[parentIdx]];
      parentIdx = smallestIdx; 
    } else {
      break; 
    }
  }
}

  return newHeap;
}

// ─── HELPER: ARRAY TO D3 TREE ─────────────────────────────────────────────

// Converts the flat array [1, 2, 3] into the {val: 1, left: {val:2}, right: {val:3}} format D3 needs
function buildTreeFromArray(arr: number[], index: number = 0): HeapNode | null {
  if (index >= arr.length) return null;

  return {
    id: `node-${arr[index]}-${index}`, // Unique ID based on value and index
    val: arr[index],
    left: buildTreeFromArray(arr, 2 * index + 1),
    right: buildTreeFromArray(arr, 2 * index + 2),
  };
}


export { pushToHeap, popFromHeap, buildTreeFromArray }; 