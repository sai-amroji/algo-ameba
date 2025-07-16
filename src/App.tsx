import {useState} from 'react'
import './App.css'
import VisualLayout from "./pages/ViusalLayout.js"
import {Input} from "@/components/ui/input.tsx";
import {Avatar, AvatarFallback, AvatarImage, Image} from "@radix-ui/react-avatar";
import logo from './assets/algo-ameba.png'
import bubblesort from "./assets/sorting.png"
import AlgoCard, {type AlgoProps} from "@/components/AlgoCard.tsx";


import sortingLogo from "./assets/sorting.png"
import dpLogo from "./assets/dp.png"
import queueLogo from "./assets/queue.png"
import graphLogo from "./assets/graph.png"
import treeLogo from "./assets/tree.png"
import heapLogo from "./assets/heap.png"
import {useGSAP} from "@gsap/react";
import {gsap} from "gsap"
import {SplitText} from "gsap/all"


const algos: AlgoProps[] = [
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




    useGSAP(() => {
        const textSplit = SplitText.create("#banner h1",{
            type:"chars, words"
        })


        textSplit.chars.forEach((char) => char.classList.add("green-gradient"))

        gsap.from(textSplit.chars,{
            yPercent:100,
            duration:1.8,
            ease:"expo.out",
            stagger:0.06

        })
    })

    return (

        <div>

            <div className={"flex justify-between items-center bg-green-300"}>

                <img src={logo} className={"w-[120px] height-[80px]"} alt={"logo"}/>


                <Input className={"w-[800px] bg-green-200"} placeholder={"Visualize Algorithms"}/>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"
                                 className={"h-[50px] w-[50px] rounded-3xl mr-1"}/>
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>

            </div>

            <div id={"banner"} className={"flex justify-center items-center content-center align-middle h-[300px] bg-amber-100"}>
                <h1 className={"font-bold "}>
                    Algo Ameba
                </h1>
            </div>


            <div className={"grid grid-cols-4 gap-6 p-4 ml-16 mr-16 mt-6 p-5 "}>
                {algos.map((algo) => (
                    <AlgoCard
                        algoImg={algo.algoImg}
                        algoName={algo.algoName}
                        algoDesc={algo.algoDesc}
                    />


                ))}

            </div>

        </div>
    )
}

export default App
