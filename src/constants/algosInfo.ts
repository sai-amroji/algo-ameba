import sortingLogo from "@/assets/sorting.png";
import dpLogo from "@/assets/dp.png";
import queueLogo from "@/assets/queue.png";
import graphLogo from "@/assets/graph.png";
import treeLogo from "@/assets/tree.png";
import heapLogo from "@/assets/heap.png";
import searchLogo from "@/assets/search.png";
import { ROUTES, type AppRoute } from "@/constants/routes";

export interface AlgoInfo {
    algoName: string;
    algoImg: string;
    algoRoute: AppRoute;
    algoDesc?: string;
}

export const algos: AlgoInfo[] = [
    {
        algoName: "Sorting Algorithms",
        algoDesc: "Watch how data gets sorted step-by-step using visualizations of Bubble Sort, Merge Sort, Quick Sort, and more. Great for building core intuition.",
        algoImg: sortingLogo,
        algoRoute: ROUTES.sort,
    },
    {
        algoName: "Dynamic Programming",
        algoDesc: "Understand how overlapping subproblems are solved visually — see memoization and tabulation in action for problems like Fibonacci, Knapsack, and Grid Paths.",
        algoImg: dpLogo,
        algoRoute: ROUTES.home,
    },
    {
        algoName: "Queue",
        algoDesc: "Interactively explore how elements enter and exit in FIFO order. Visualize real-time operations in circular queues and priority queues.",
        algoImg: queueLogo,
        algoRoute: ROUTES.home,
    },
    {
        algoName: "Search",
        algoDesc: "Step through linear and binary search and understand each comparison in motion.",
        algoImg: searchLogo,
        algoRoute: ROUTES.search,
    },
    {
        algoName: "Graph Algorithms",
        algoDesc: "Dive deep into BFS, DFS, Dijkstra, and more through animated graphs. Visual tools make it easier to understand traversal and shortest paths.",
        algoImg: graphLogo,
        algoRoute: ROUTES.home,
    },
    {
        algoName: "Tree Algorithms",
        algoDesc: "See how binary trees, BSTs, and AVL trees grow, rotate, and balance. Perfect for understanding recursion, traversal, and structure manipulation.",
        algoImg: treeLogo,
        algoRoute: ROUTES.home,
    },
    {
        algoName: "Heap",
        algoDesc: "Visualize heap insertions and deletions in real time. See how Min-Heaps and Max-Heaps power priority queues and heap sort.",
        algoImg: heapLogo,
        algoRoute: ROUTES.home,
    }
];







interface CardsContent {
    title:string,
    content:string
}

export const cards: CardsContent[] = [
 {
        title:"Simple To Complex",
        content:"Learn progressively from beginner friendly visuals to advanced algorithm behavior."
 },
  {
        title:"Fast And Interactive",
        content:"Control playback and inspect each step without losing algorithm intuition."
 },
  {
        title:"Visual Learning",
        content:"Animations and state highlighting make hard concepts easier to remember."
 }

];