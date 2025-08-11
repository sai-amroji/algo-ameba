import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/SharedLayout";
import { Alert, AlertTitle } from "@/components/ui/alert.tsx";
import { toast } from "sonner";

gsap.registerPlugin(Flip);

// Define a type for our bar objects for better type safety
type Bar = {
    value: number;
    id: number; // Use a unique ID for stable keys in React
};

// We will use this to track the state for visual rendering
type BarState = "default" | "checking" | "found";

const SearchVisualizer = () => {
    const [bars, setBars] = useState<Bar[]>([]);
    // Use a record to map bar IDs to their state
    const [barStates, setBarStates] = useState<Record<number, BarState>>({});
    const [inputValue, setInputValue] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isntAllowed, setIsntAllowed] = useState(false);

    // Use a ref for the timeline
    const timelineRef = useRef(gsap.timeline({ paused: true }));
    // We'll use this ref to store the timeline's labels for step-by-step navigation
    const labelsRef = useRef<string[]>([]);

    useEffect(() => {
        if (isntAllowed) {
            const timeout = setTimeout(() => setIsntAllowed(false), 1500);
            return () => clearTimeout(timeout);
        }
    }, [isntAllowed]);

    // Cleanup toast and timeline on unmount
    useEffect(() => {
        return () => {
            timelineRef.current.kill();
        };
    }, []);

    const resetAnimation = () => {
        timelineRef.current.clear().pause(0);
        labelsRef.current = [];
        setIsPlaying(false);
        setBarStates({});
    };

    const handleInsert = () => {
        const num = parseInt(inputValue.trim());
        if (num > 50 || num < -50) {
            setIsntAllowed(true);
            return;
        }
        if (!isNaN(num)) {
            const newBar: Bar = { value: num, id: Date.now() + Math.random() };
            const updated = [...bars, newBar];

            const state = Flip.getState(".bar-container, .bar");
            setBars(updated);
            Flip.from(state, {
                duration: 0.5,
                ease: "power1.inOut",
            });

            resetAnimation();
            setInputValue("");
        }
    };

    const generateRandomArray = () => {
        const random = Array.from({ length: 8 }, () => ({
            value: Math.floor(Math.random() * 50) + 1,
            id: Math.random(),
        }));

        const state = Flip.getState(".bar-container, .bar");
        setBars(random);
        Flip.from(state, {
            duration: 0.7,
            ease: "power1.inOut",
            stagger: 0.05,
        });

        resetAnimation();
    };

    const handleSearch = () => {
        const target = parseInt(searchValue.trim());
        if (isNaN(target) || target > 50 || target < -50) {
            setIsntAllowed(true);
            return;
        }

        resetAnimation();

        const timeline = timelineRef.current;
        const labels: string[] = [];
        let found = false;

        timeline.addLabel("start");
        labels.push("start");

        for (let i = 0; i < bars.length; i++) {
            const barId = bars[i].id;
            const label = `step-${i}`;
            labels.push(label);

            // Add a label for this step
            timeline.addLabel(label);

            // Animate the bar to "checking" color by updating React state
            timeline.call(() => {
                setBarStates(prev => ({
                    ...prev,
                    [barId]: "checking",
                }));
            }, null, label);

            // Wait a moment
            timeline.to({}, { duration: 0.5 }, label);

            if (bars[i].value === target) {
                found = true;
                const foundLabel = `found-${i}`;
                labels.push(foundLabel);

                timeline.addLabel(foundLabel);

                // Animate bar to "found" color
                timeline.call(() => {
                    setBarStates(prev => ({
                        ...prev,
                        [barId]: "found",
                    }));
                }, null, foundLabel);

                break;
            }
        }

        // If not found, add a final tween to reset all bars to default
        if (!found) {
            const endLabel = "not-found";
            labels.push(endLabel);
            timeline.addLabel(endLabel);

            timeline.call(() => {
                setBarStates({});
            }, null, endLabel);
        } else {
            const endLabel = `end`;
            labels.push(endLabel);
            timeline.addLabel(endLabel);

            timeline.call(() => {
                const foundBarId = bars.find(b => b.value === target)?.id;
                const newStates: Record<number, BarState> = {};
                if (foundBarId) {
                    newStates[foundBarId] = "found";
                }
                setBarStates(newStates);
            }, null, endLabel);
        }

        labelsRef.current = labels;
        timeline.play();
        setIsPlaying(true);
    };

    const playSteps = () => {
        if (!isPlaying) {
            timelineRef.current.play();
            setIsPlaying(true);
        }
    };

    const pauseSteps = () => {
        if (isPlaying) {
            timelineRef.current.pause();
            setIsPlaying(false);
        }
    };

    const nextStep = () => {
        if (isPlaying) return;
        const currentLabel = timelineRef.current.currentLabel();
        const currentIndex = labelsRef.current.indexOf(currentLabel);
        if (currentIndex < labelsRef.current.length - 1) {
            timelineRef.current.seek(labelsRef.current[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        if (isPlaying) return;
        const currentLabel = timelineRef.current.currentLabel();
        const currentIndex = labelsRef.current.indexOf(currentLabel);
        if (currentIndex > 0) {
            timelineRef.current.seek(labelsRef.current[currentIndex - 1]);
        }
    };

    const algoMap = [{ name: "Linear Search", value: "linear" } ,
        {name:"Binary Search",value: "binary"}];

    const getBarColor = (id: number) => {
        switch (barStates[id]) {
            case "checking": return "bg-red-500";
            case "found": return "bg-green-500";
            default: return "bg-blue-500";
        }
    };

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
            onPlay={playSteps}
            onPause={pauseSteps}
            onNext={nextStep}
            onPrev={prevStep}
        >
            {isntAllowed && toast("Invalid Number", {
                description: "You can't Enter Number greater than 50 and less than -50",
            })}
            <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
                {bars.map((bar) => (
                    <div
                        key={bar.id}
                        data-flip-id={bar.id}
                        className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(bar.id)}`}
                        style={{ height: `${Math.max(bar.value * 4, 30)}px` }}
                    >
                        {bar.value}
                    </div>
                ))}
            </div>
        </SharedLayout>
    );
};

export default SearchVisualizer;