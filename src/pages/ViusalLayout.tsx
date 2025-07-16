import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import gsap from "gsap"
import { useGSAP } from "@gsap/react";
import {Icon, MinusCircleIcon, MinusIcon, Pause, PauseIcon, PlayIcon, PlusCircleIcon, PlusIcon} from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import ControllerFooter from "@/components/ControllerFooter.tsx";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card.tsx";
import {Avatar, AvatarFallback, AvatarImage} from "@radix-ui/react-avatar";
import { useEffect, useRef, useState } from "react";
import BubbleSortVisualizer from "../components/BubbleSort"


const VisualLayout = () => {









    











    return (

        <div >


            <Navbar/>


            <div className="h-[700px]">

           <BubbleSortVisualizer/>

            </div>
            







            <ControllerFooter/>




        </div>

    )
}


export default VisualLayout;
