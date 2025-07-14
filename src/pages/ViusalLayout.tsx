import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import gsap from "gsap"
import { useGSAP } from "@gsap/react";
import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";


const VisualLayout = () => {


    useGSAP(() => {

        gsap.from("#black-box",{
            x:"250px",
            scale:1.5,
            rotate:250
        
        })
    },[])




    return (

        <div className="h-screen">
            <nav className="flex w-full green-200 flex-row justify-between p-3" >

                <Input className="max-w-[400px]"/>


                <div className="flex justify-between w-[800px] green" color="green">

                    <Button variant="secondary" size="icon" className="size-8">
                        <PlusCircleIcon />
                    </Button>

                    <Slider
                        defaultValue={[50]}
                        max={100}
                        step={1}
                        color="green"
                       
                    />
                    <Button variant="secondary" size="icon" className="size-8">
                        <MinusCircleIcon />
                    </Button>
                </div>

                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Sorting" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Choose Sorting algo</SelectLabel>
                            <SelectItem value="Bubble Sort">Bubble Sort</SelectItem>
                            <SelectItem value="Inseration Sort">Inseration Sort</SelectItem>
                            <SelectItem value="Selectiom Sort">Selection Sort</SelectItem>
                            <SelectItem value="Quick Sort">Quick Sort</SelectItem>
                            <SelectItem value="Merge Sort">Merge Sort</SelectItem>
                          
                        </SelectGroup>
                    </SelectContent>
                </Select>


            </nav>

            <div className="h-screen w-full bg-amber-50 justify-center align-middle">

                <div id="#black-box" className="w-[200px] h-[200px]">

                </div>
            </div>

        </div>

    )
}


export default VisualLayout;
