


import sortingLogo from "./assets/sorting.png"
import dpLogo from "./assets/dp.png"
import queueLogo from "./assets/queue.png"
import graphLogo from "./assets/graph.png"
import treeLogo from "./assets/tree.png"
import heapLogo from "./assets/heap.png"
import type { AlgoProps } from "./components/AlgoCard"
import { BrowserRouter, Route, Router, Routes } from "react-router-dom"
import VisualLayout from "./pages/ViusalLayout"
import Homepage from "./pages/Homepage"

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";

import { SplitText } from "gsap/all";
gsap.registerPlugin(SplitText);

export const algos: AlgoProps[] = [
    {
        algoName: "Sorting Algorithms",
        algoDesc: "Watch how data gets sorted step-by-step using visualizations of Bubble Sort, Merge Sort, Quick Sort, and more. Great for building core intuition.",
        algoImg: sortingLogo
    },
    {
        algoName: "Dynamic Programming",
        algoDesc: "Understand how overlapping subproblems are solved visually — see memoization and tabulation in action for problems like Fibonacci, Knapsack, and Grid Paths.",
        algoImg: dpLogo
    },
    {
        algoName: "Queue",
        algoDesc: "Interactively explore how elements enter and exit in FIFO order. Visualize real-time operations in circular queues and priority queues.",
        algoImg: queueLogo
    },
    {
        algoName: "Graph Algorithms",
        algoDesc: "Dive deep into BFS, DFS, Dijkstra, and more through animated graphs. Visual tools make it easier to understand traversal and shortest paths.",
        algoImg: graphLogo
    },
    {
        algoName: "Tree Algorithms",
        algoDesc: "See how binary trees, BSTs, and AVL trees grow, rotate, and balance. Perfect for understanding recursion, traversal, and structure manipulation.",
        algoImg: treeLogo
    },
    {
        algoName: "Heap",
        algoDesc: "Visualize heap insertions and deletions in real time. See how Min-Heaps and Max-Heaps power priority queues and heap sort.",
        algoImg: heapLogo
    }
]


function App() {






    return (
         <BrowserRouter >
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/algo" element={<VisualLayout />} />
       
      </Routes>
    </BrowserRouter>
       
    )
}

export default App
