// import './App.css'
import { algos } from '@/App.js';
import AlgoCard from "@/components/AlgoCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import logo from '../assets/algo-ameba.png'

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/all";



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
     <div>

            <div className="flex w-full text-lightgreen h-20 justify-between">
                <img src={logo} className={"w-[120px] height-[80px]"} alt={"logo"} />
                <Input name="search" className='flex h-12 w-[900px] self-center rounded-[40px]' />

                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"
                        className={"w-[70px] h-[70px] self-center rounded-full pr-[10px] mr-[10px] align-middle z-auto"} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
            </div>

            <div id="banner" className="flex justify-center items-center text-[#90EE90] h-[300px]">
                <h1 className="flex self-center text-[100px] font-bold">Algo Ameba</h1>
            </div>



            <div className={"grid px-[15px] mx-[16px] overflow-auto grid-cols-3 gap-4 justify-center content-center"}>
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


export default Homepage;


