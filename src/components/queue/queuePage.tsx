import { useState } from "react"
import { Input } from "../ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup.ts"




const QueuePage = () => {


    const [options, setOptions] = useState<string[]>(["pop","peek","append","clear"]);
    const [input,setInput] = useState<number>(0);
    const [queueSize,setQueueSize] = useState<number>(10);
    const [queue,setQueue] = useState<number[]>([]);
    const [currSize,setCurrSize] = useState<number>(0);


    const algosOptionMap = {
        "deque":["enqueueFirst","enqueueLast","dequeueFirst","dequeueLast","peek","clear"],
        "monotonic queue":["enqueueFirst","enqueueLast","dequeueFirst","dequeueLast","peek","clear"],
        "circular queue":["enqueueFirst","enqueueLast","dequeueFirst","dequeueLast","peek","clear"],
        
        
    }
    const [algos, setAlgos] = useState<string[]>(Object.keys(algosOptionMap));
    const [optionsForAlgo, setOptionsForAlgo] = useState<string[]>([]);
    
    const handleAlgoChange = (algo:string) => {
        setOptionsForAlgo(algosOptionMap[algo as keyof typeof algosOptionMap]);
    }

    const contextSafe = useGSAP();

    const enterInput = (num:number) => {
        if (currSize >= queueSize){
            return 
        }

        setQueue([...queue,num])
        
        
        
    }  



    useGSAP(() => {

        gsap.fromTo('.queue-items-psudo',{
            opacity:100,
            x:100,
            duration:3
        },{
            opacity:0,
            duration:1,
            onComplete:() => {
                gsap.to('.queue-item',{
                    hidden:false,
                    text:{
                     value:"10"
                }      
            })
            }
        })

    },[queueSize])



    return (
        <div>
            <div className="flex nav-bar flex-row justify-between items-center h-16 px-6 py-2 gap-6">
                <div className="flex justify-start items-center gap-4 nav-start-items">
                    <div className="flex gap-3 items-center">
                        <Input className="h-10" onChange={(curr) => setInput(Number(curr.target))} />
                        <button className="h-10 px-5 rounded-lg bg-blue-300 whitespace-nowrap">
                            Enter number
                        </button>
                        <div className="flex gap-2">
                            {options.map((option) => (
                                <button key={option} className="h-10 px-5 rounded-lg bg-green-300 whitespace-nowrap">
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>
                <div className="nav-end-items">
                    <Select
                        value={""}
                        onValueChange={(algo) => setOptionsForAlgo(algosOptionMap[algo as keyof typeof algosOptionMap])}
                    >
                        <SelectTrigger className="w-[180px] bg-card/80 text-foreground h-10">
                            <SelectValue placeholder={""}  />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Algorithms</SelectLabel>
                                {algos.map((algo) => (
                                    <SelectItem
                                        key={algo}
                                        value={algo}
                                    >
                                        {algo}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                </div>


            </div>
            <div  className="alog-screen h-full w-full flex justify-center items-center">

                            <div className="queue-item-psudo w-[300px] hidden h-[380px] flex justify-center items-center text-center border-4 border-black">
                                X
                            </div>
                        
                        <div className="queue w-[1000px] h-[400px] flex justify-start items-center border-r-8 border-l-8 border-red-500 bg-[#141414]">
                            
                            <div className="queue-item w-[300px] h-[380px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="queue-item w-[300px] h-[380px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="queue-item w-[300px] h-[380px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="queue-item w-[300px] h-[380px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="queue-item w-[300px] h-[380px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                        </div>


            </div>
            <footer className="footer">

            </footer>
        </div>




    )
}


export default QueuePage

