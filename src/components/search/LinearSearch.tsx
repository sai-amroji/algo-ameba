import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/SharedLayout";

gsap.registerPlugin(Flip);

// Define a type for our bar objects for better type safety
type Bar = {
    value: number;
    state: "default" | "checking" | "found";
    id: number; // Use a unique ID for stable keys in React
};

const SearchVisualizer = () => {
    // State now holds an array of Bar objects
    const [bars, setBars] = useState<Bar[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [searchValue, setSearchValue] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    // Steps will now store snapshots of Bar arrays
    const [steps, setSteps] = useState<Bar[][]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Helper to reset the animation state
    const resetAnimation = () => {
        setSteps([]);
        setCurrentStep(0);
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    // Convert all bars back to their default state
    const resetBarStates = () => {
        setBars(prevBars => prevBars.map(b => ({ ...b, state: 'default' })));
    };

    // Automatically play the animation when steps are generated
    useEffect(() => {
        if (steps.length > 0) {
            playSteps();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [steps]);


    const handleInsert = () => {
        const num = parseInt(inputValue.trim());
        if (!isNaN(num)) {
            const newBar: Bar = { value: num, state: "default", id: Date.now() + Math.random() };
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
            state: "default" as const,
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
        if (isNaN(target)) return;

        resetAnimation();
        resetBarStates(); // Reset colors before starting a new search

        const highlights: Bar[][] = [];
        const currentBars = bars.map(b => ({ ...b, state: 'default' as const }));
        let found = false; // Flag to track if the target is found

        for (let i = 0; i < currentBars.length; i++) {
            // Create a "checking" snapshot
            const checkingSnapshot = currentBars.map((bar, idx) => ({
                ...bar,
                state: idx === i ? "checking" : (bar.state === "found" ? "found" : "default"),
            }));
            highlights.push(checkingSnapshot);

            // If found, create a final "found" snapshot and stop
            if (currentBars[i].value === target) {
                const foundSnapshot = checkingSnapshot.map((bar, idx) => ({
                    ...bar,
                    state: idx === i ? "found" : bar.state,
                }));
                highlights.push(foundSnapshot);
                found = true; // Set flag to true
                break; // Stop creating steps once found
            }
        }

        // **FIX 2**: If not found after the loop, add a final "reset" step
        if (!found && currentBars.length > 0) {
            const resetSnapshot = currentBars.map(bar => ({ ...bar, state: 'default' }));
            highlights.push(resetSnapshot);
        }

        setSteps(highlights);
    };

    const playSteps = () => {
        if (currentStep >= steps.length || isPlaying) return;
        setIsPlaying(true);

        intervalRef.current = setInterval(() => {
            setCurrentStep(prevStep => {
                const nextStepIndex = prevStep;
                if (nextStepIndex < steps.length) {
                    const state = Flip.getState(".bar");
                    setBars(steps[nextStepIndex]);
                    Flip.from(state, { duration: 0.3, ease: "power1.inOut" });
                    return nextStepIndex + 1;
                } else {
                    clearInterval(intervalRef.current!);
                    intervalRef.current = null;
                    setIsPlaying(false);
                    return prevStep;
                }
            });
        }, 700);
    };

    const pauseSteps = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            setIsPlaying(false);
        }
    };

    const nextStep = () => {
        if (currentStep < steps.length && !isPlaying) {
            setBars(steps[currentStep]);
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0 && !isPlaying) {
            const prevStepIndex = currentStep - 2;
            setBars(steps[prevStepIndex < 0 ? 0 : prevStepIndex]);
            setCurrentStep(currentStep - 1);
        }
    };

    const algoMap = [{ name: "Linear Search", value: "linear" }];

    const getBarColor = (state: Bar["state"]) => {
        switch (state) {
            case "checking": return "bg-red-500";
            case "found": return "bg-green-500";
            default: return "bg-blue-500";
        }
    };

    return (
        <SharedLayout
            // ...props
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
            <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
                {bars.map((bar) => (
                    <div
                        key={bar.id}
                        data-flip-id={bar.id}
                        className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(bar.state)}`}
                        style={{ height: `${bar.value * 4}px` }}
                    >
                        {bar.value}
                    </div>
                ))}
            </div>
        </SharedLayout>
    );
};

export default SearchVisualizer;