import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import gsap from "gsap"
import { useGSAP } from "@gsap/react";
import {Icon, MinusCircleIcon, MinusIcon, PauseIcon, PlayIcon, PlusCircleIcon, PlusIcon} from "lucide-react";
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


const VisualLayout = () => {


    useGSAP(() => {

        gsap.from("#black-box",{
            x:"250px",
            scale:1.5,
            rotate:250
        
        })
    },[])




    return (

        <div >


            <Navbar/>


            <div>

                <Input/>
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar className="rounded-lg">
                    <AvatarImage
                        src="https://github.com/evilrabbit.png"
                        alt="@evilrabbit"
                    />
                    <AvatarFallback>ER</AvatarFallback>
                </Avatar>
            </div>






            <ControllerFooter/>




        </div>

    )
}


export default VisualLayout;
