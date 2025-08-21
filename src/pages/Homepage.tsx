// import './App.css'
import { algos } from '@/App.js';
import AlgoCard from "@/components/AlgoCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import logo from '../assets/algo-ameba.png'

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/all";
import {ModeToggle} from "@/components/mode-toggle.tsx";



const Homepage = () => {


       useGSAP(() => {
        const textSplit = SplitText.create("#banner h1", {
            type: "chars, words"
        })


        textSplit.chars.forEach((char) => char.classList.add("gradient-gsap-logo"))

        gsap.from(textSplit.chars, {
            yPercent: 100,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.06

        })
    })
return (
     <div className="min-h-screen bg-background text-foreground transition-colors duration-300">

            <div className="flex w-full h-20 justify-between items-center px-4 bg-card">
                <img src={logo} className="w-[120px] h-[80px]" alt="logo" />
                <Input name="search" className='flex h-12 w-[900px] rounded-[40px]' />
                <ModeToggle/>

                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"
                        className="w-[70px] h-[70px] rounded-full" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>

            <div id="banner" className="flex justify-center items-center text-[#90EE90] h-[300px]">
                <h1 className="flex self-center text-[100px] font-bold">Algo Ameba</h1>
            </div>



            <div className="grid px-[15px] mx-[16px] overflow-auto grid-cols-3 gap-4 justify-center content-center">
                {algos.map((algo) => (
                    <AlgoCard
                        key={algo.algoName}
                        algoImg={algo.algoImg}
                        algoName={algo.algoName}
                        algoRoute={algo.algoRoute}
                        algoDesc={algo.algoDesc}
                    />
                ))}
            </div>

        </div>

)
}


export default Homepage;


