import {Button} from "@/components/ui/button.tsx";
import {
    FastForward,
    FastForwardIcon,
    ForwardIcon,
    MinusIcon,
    PauseIcon,
    PlayIcon,
    PlusIcon,
    Rewind,
    RewindIcon
} from "lucide-react";
import {Slider} from "@/components/ui/slider.tsx";


const ControllerFooter = () => {

    return(
        <footer className="flex justify-between  justify-center content-between p-4" >
            <div className="flex justify-between w-[800px] green justify-between content-between" color="green">

                <Button variant="secondary" size="icon" className="size-8">
                    <PlusIcon />
                </Button>

                <Slider
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    color="green"
                    className={"p-2"}

                />
                <Button variant="secondary" size="icon" className="size-8">
                    <MinusIcon />
                </Button>
            </div>

            <div className={"justify-between"}>
                <Button>

                    <RewindIcon />
                    <PlayIcon/>
                    <FastForwardIcon/>

                </Button>
            </div>

        </footer>
    )
}


export default ControllerFooter;
