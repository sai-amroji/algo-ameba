


import sortingLogo from "./assets/sorting.png"
import dpLogo from "./assets/dp.png"
import queueLogo from "./assets/queue.png"
import graphLogo from "./assets/graph.png"
import treeLogo from "./assets/tree.png"
import heapLogo from "./assets/heap.png"
import searchLogo from  "./assets/search.png"
import type { AlgoProps } from "./components/AlgoCard"
import { BrowserRouter, Route,  Routes } from "react-router-dom"

import Homepage from "./pages/Homepage"


import { gsap } from "gsap";

import { SplitText } from "gsap/all";

import BubbleSortVisualizer from "@/components/sort/BubbleSort.tsx";
import SearchVisualizer from "@/components/search/LinearSearch.tsx";
import BinarySearch from "@/components/search/BinarySearch.tsx";
import LandingPage from "@/pages/LandingPage.tsx";
import SelectionSort from "@/components/sort/SelectionSort.tsx";
gsap.registerPlugin(SplitText);

export const algos: AlgoProps[] = [
    {
        algoName: "Sorting Algorithms",
        algoDesc: "Watch how data gets sorted step-by-step using visualizations of Bubble Sort, Merge Sort, Quick Sort, and more. Great for building core intuition.",
        algoImg: sortingLogo,
        algoRoute:"/sort"
    },
    {
        algoName: "Dynamic Programming",
        algoDesc: "Understand how overlapping subproblems are solved visually — see memoization and tabulation in action for problems like Fibonacci, Knapsack, and Grid Paths.",
        algoImg: dpLogo,
        algoRoute:"/dp"
    },
    {
        algoName: "Queue",
        algoDesc: "Interactively explore how elements enter and exit in FIFO order. Visualize real-time operations in circular queues and priority queues.",
        algoImg: queueLogo,
        algoRoute:"/queue"
    },
    {
        algoName:"Search",
        algoDesc:"",
        algoImg:searchLogo,
        algoRoute:"/search"
    },
    {
        algoName: "Graph Algorithms",
        algoDesc: "Dive dep into BFS, DFS, Dijkstra, and more through animated graphs. Visual tools make it easier to understand traversal and shortest paths.",
        algoImg: graphLogo,
        algoRoute:"/graph"
    },
    {
        algoName: "Tree Algorithms",
        algoDesc: "See how binary trees, BSTs, and AVL trees grow, rotate, and balance. Perfect for understanding recursion, traversal, and structure manipulation.",
        algoImg: treeLogo,
        algoRoute:"/tree"
    },
    {
        algoName: "Heap",
        algoDesc: "Visualize heap insertions and deletions in real time. See how Min-Heaps and Max-Heaps power priority queues and heap sort.",
        algoImg: heapLogo,
        algoRoute:"/heap"
    }
]


function App() {






    return (



         <BrowserRouter >
      <Routes>
        <Route path="/" element={<LandingPage />} />
          <Route path={"/home"} element={<Homepage/>}/>
          <Route path= "/sort" element={<BubbleSortVisualizer/>}/>
          <Route path="/search" element={<SearchVisualizer/>}/>
          <Route path="/binary" element={<BinarySearch/>}/>
          <Route path={"/selection"} element={<SelectionSort/>}/>
       
      </Routes>
    </BrowserRouter>
       
    )
}

export default App
