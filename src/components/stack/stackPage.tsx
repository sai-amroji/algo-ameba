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




const StackPage = () => {


    const [options, setOptions] = useState<string[]>(["pop","peek","append","clear"]);
    const algosOptionMap = {
        "stack":["push","pop","peek","clear"],
        "monotonic stack":["push","pop","peek","clear"],
        "deque":["enqueueFirst","enqueueLast","dequeueFirst","dequeueLast","peek","clear"],
        "monotonic queue":["enqueueFirst","enqueueLast","dequeueFirst","dequeueLast","peek","clear"],
        "linked list":["append","prepend","deleteAt","peek","clear"],
        "double linked list":["append","prepend","deleteAt","peek","clear"],
        "circular queue":["enqueueFirst","enqueueLast","dequeueFirst","dequeueLast","peek","clear"],
        "circular linked list":["append","prepend","deleteAt","peek","clear"] ,
        
        
    }
    const [algos, setAlgos] = useState<string[]>(Object.keys(algosOptionMap));
    const [optionsForAlgo, setOptionsForAlgo] = useState<string[]>([]);
    
    const handleAlgoChange = (algo:string) => {
        setOptionsForAlgo(algosOptionMap[algo as keyof typeof algosOptionMap]);
    }




    useGSAP(() => {

        gsap.fromTo('.stack-psudo',{
            opacity:100,
            rotate:15,
            y:100,
            duration:3
        },{
            opacity:0,
            duration:1,
            onComplete:() => {
                gsap.to('.stack-item',{
                    hidden:false,
                    text:{
                     value:"10"
                }      
            })
            }
        })

    })



    return (
        <div>
            <div className="flex nav-bar flex-row justify-between items-center h-16 px-6 py-2 gap-6">
                <div className="flex justify-start items-center gap-4 nav-start-items">
                    <div className="flex gap-3 items-center">
                        <Input className="h-10" />
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

                        
                        <div className="stack w-[500px] h-[800px] flex mt-50 mb-9 flex-col justify-center align-center items-center border-r-8 border-l-8 border-b-8 border-red-500 bg-[#141414] ">
                            <div className="stack-item-psudo w-[500px] hidden h-[200px] flex justify-center items-center text-center border-4 border-black self-end">
                                X
                            </div>
                            <div className="stack-item w-[500px] h-[200px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="stack-item w-[500px] h-[200px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="stack-item w-[500px] h-[200px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="stack-item w-[500px] h-[200px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                            <div className="stack-item w-[500px] h-[200px] hidden border-4 border-grey flex justify-center items-center align-center">
                                 X
                            </div>
                        </div>


            </div>
            <footer className="footer">

            </footer>
        </div>




    )
}


export default StackPage




