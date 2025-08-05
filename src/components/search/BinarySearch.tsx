import { useRef, useState, useEffect, use } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/SharedLayout";
import { toast } from "sonner";
import { time } from "console";

gsap.registerPlugin(Flip);

type Bar = {
    value: number;
    id: number;
};

type BarState = "default" | "checking" | "found" | "inactive";

// Helper: Check number validity
const isValidNumber = (num: number) => !isNaN(num) && num >= -50 && num <= 50;

// Helper: Generate unique Bar
const createBar = (value: number): Bar => ({
    value,
    id: Date.now() + Math.random(),
});

// Helper: Animate with Flip
const animateFlip = () => {
    const state = Flip.getState(".bar-container, .bar");
    Flip.from(state, {
        duration: 0.5,
        ease: "power1.inOut",
        stagger: 0.05,
    });
};

// Helper: Get bar color based on state
const getBarColor = (state: BarState) => {
    switch (state) {
        case "checking": return "bg-red-500";
        case "found": return "bg-green-500";
        case "inactive":return "bg-grey-600"
        default: return "bg-blue-500";
    }
};




// Bar Renderer Component
const BarDisplay = ({ bars, barStates }: {
    bars: Bar[],
    barStates: Record<number, BarState>
}) => (
    <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
        {bars.map((bar) => (
            <div
                id={`bar-${bar.id}`}
                key={bar.id}
                data-flip-id={bar.id}
                className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(barStates[bar.id] || "default")}`}
                style={{ height: `${Math.max(bar.value * 4, 30)}px` }}
            >
                {bar.value}
            </div>
        ))}
    </div>
);

const SearchVisualizer = () => {
    const [bars, setBars] = useState<Bar[]>([]);
    const [barStates, setBarStates] = useState<Record<number, BarState>>({});
    const [inputValue, setInputValue] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isntAllowed, setIsntAllowed] = useState(false);
    const [searchRange , setSearchRange] = useState<[number,number]|null>();


    const timelineRef = useRef(gsap.timeline({ paused: true }));
    const labelsRef = useRef<string[]>([]);

    useEffect(() => {
        if (isntAllowed) {
            const timeout = setTimeout(() => setIsntAllowed(false), 1500);
            return () => clearTimeout(timeout);
        }
    }, [isntAllowed]);


   


    useEffect(() => {
        return () => timelineRef.current.kill();
    }, []);

    const resetAnimation = () => {
        timelineRef.current.clear().pause(0);
        labelsRef.current = [];
        setIsPlaying(false);
        setBarStates({});
    };

    const handleInsert = () => {
        const num = parseInt(inputValue.trim());
        if (!isValidNumber(num)) return setIsntAllowed(true);

        const newBar = createBar(num);
        const updatedBars = [...bars, newBar];
        setBars(updatedBars);

        animateFlip();
        resetAnimation();
        setInputValue("");
    };

    const generateRandomArray = () => {
        const randomBars = Array.from({ length: 8 }, () =>
            createBar(Math.floor(Math.random() * 50) + 1)
        );
        setBars(randomBars);
        animateFlip();
        resetAnimation();
    };


    const isOutOfRange = (barIndex:number) => {
        return searchRange && ((barIndex < searchRange[0]) || (barIndex > searchRange[1]))
    }

    const handleSearch = () => {
        const target = parseInt(searchValue.trim());
        if (!isValidNumber(target)) return setIsntAllowed(true);

        resetAnimation();
        const timeline = timelineRef.current;
        const labels: string[] = [];
        let found = false;

        timeline.addLabel("start");
        labels.push("start");
        

         timelineRef.to(`#bar-${bar.id}`, {
    x: "-100%",
    opacity: 0.2,
    duration: 0.3,

    })


        let low = 0
        let high = bars.length

        const transform = isOutOfRange()
         ? (barIndex < searchRange[0] ? "-translate-x-full" : "translate-x-full")
          : "";


        while(low <= high) {


            const mid = Math.floor((low + (high-low))/2);



            setSearchRange([low,high])



            timeline.call(()=>{



                const newStates = {}
                barStates.forEach((bar,idx)=> {
                    if (isOutOfRange(idx))newStates[bar.id] = "inactive"
                    else if(mid == idx) newStates[bar.id] = "checking"
                    else newStates[bar.id] = "default"
                })


                setBarStates(newStates)



            })



            if(bars[mid].value > target){


                low = mid + 1

            }
            else if(bars[mid].value < target){

                high = mid - 1
            }
            
             else {
                found = true;
                const foundLabel = `found-${mid}}`;
                labels.push(foundLabel);
                timeline.addLabel(foundLabel);
                timeline.call(() => {
                    setBarStates(prev => ({ ...prev, [barId]: "found" }));
                }, null, foundLabel);
                break;
            }
        }

        timeline.addLabel("end");
        labels.push("end");

        timeline.call(() => {
            if (!found) {
                setBarStates({});
            } else {
                const foundBarId = bars.find(b => b.value === target)?.id;
                if (foundBarId) {
                    setBarStates({ [foundBarId]: "found" });
                }
            }
        }, null, "end");

        labelsRef.current = labels;
        timeline.play();
        setIsPlaying(true);
    };

    // Timeline Controls
    const controls = {
        play: () => {
            if (!isPlaying) {
                timelineRef.current.play();
                setIsPlaying(true);
            }
        },
        pause: () => {
            if (isPlaying) {
                timelineRef.current.pause();
                setIsPlaying(false);
            }
        },
        next: () => {
            if (isPlaying) return;
            const current = timelineRef.current.currentLabel();
            const index = labelsRef.current.indexOf(current);
            if (index < labelsRef.current.length - 1) {
                timelineRef.current.seek(labelsRef.current[index + 1]);
            }
        },
        prev: () => {
            if (isPlaying) return;
            const current = timelineRef.current.currentLabel();
            const index = labelsRef.current.indexOf(current);
            if (index > 0) {
                timelineRef.current.seek(labelsRef.current[index - 1]);
            }
        },
    };

    const algoMap = [{ name: "Linear Search", value: "linear" }];

    return (
        <SharedLayout
            inputValue={inputValue}
            setInputValue={setInputValue}
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            handleInsert={handleInsert}
            isPlaying={isPlaying}
            handleSearch={handleSearch}
            generateRandomArray={generateRandomArray}
            algoMap={algoMap}
            onPlay={controls.play}
            onPause={controls.pause}
            onNext={controls.next}
            onPrev={controls.prev}
        >
            {isntAllowed && toast("Invalid Number", {
                description: "You can't Enter Number greater than 50 and less than -50",
            })}
            <BarDisplay bars={bars} barStates={barStates} />
        </SharedLayout>
    );
};

export default SearchVisualizer;
