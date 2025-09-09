import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/search/SharedLayout";
import { Alert, AlertTitle } from "@/components/ui/alert.tsx";
import { toast } from "sonner";
import selectionSort from "@/components/sort/SelectionSort.tsx";

gsap.registerPlugin(Flip);

// Define a type for our bar objects for better type safety
type Bar = {
    value: number;
    id: string; // Use a unique ID for stable keys in React
};

// We will use this to track the state for visual rendering
type BarState = "default" | "checking" | "comparing" | "sorted";

const SelectionSort = () => {
    const [bars, setBars] = useState<Bar[]>([]);
    const [barStates, setBarStates] = useState<Record<string, BarState>>({});
    const [inputValue, setInputValue] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);

    const [isSorting, setIsSorting] = useState(false);

    const timelineRef = useRef(gsap.timeline({ paused: true }));
    const labelsRef = useRef<string[]>([]);
    const sortingRef = useRef(false);

   

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
        setIsSorting(false);
        sortingRef.current = false;
    };

    const handleInsert = () => {
        if (isSorting) return; // Prevent insertion during sorting

        const num = parseInt(inputValue.trim());
        if (num > 50 || num < -50) {
            //TODO:Add toaster
            return;
        }
        if (!isNaN(num)) {
            const newBar: Bar = {
                value: num,
                id: `bar-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
            };
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
        if (isSorting) return; // Prevent generation during sorting

        const random = Array.from({ length: 15 }, () => ({
            value: Math.floor(Math.random() * 50) + 1,
            id: `bar-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

    const swap = (currentBars: Bar[], index1: number, index2: number): Promise<Bar[]> => {
        return new Promise<Bar[]>((resolve) => {
            // Create new array with swapped elements
            const newBars = [...currentBars];
            [newBars[index1], newBars[index2]] = [newBars[index2], newBars[index1]];

            // Update state first
            setBars(newBars);

            // Then animate
            requestAnimationFrame(() => {
                const state = Flip.getState(".bar");
                Flip.from(state, {
                    targets: ".bar",
                    duration: 0.6,
                    ease: "power2.inOut",
                    onComplete: () => resolve(newBars),
                });
            });
        });
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const SelectionSteps = async () => {
        if (sortingRef.current) return;

        sortingRef.current = true;
        setIsSorting(true);

        let currentBars = [...bars];
        const n = currentBars.length;

        try {
            for (let i = 0; i < n - 1; i++) {
                let min_index = i
                for (let j = i; j < n ; j++) {
                    if (!sortingRef.current) return; // Allow cancellation

                    // Highlight bars being compared
                    setBarStates({
                        [currentBars[min_index].id]: "comparing",
                        [currentBars[j].id]: "comparing",
                    });

                    await delay(300); // Pause to show comparison


                    if (currentBars[j].value < currentBars[min_index].value) {


                        min_index = j;


                        setBarStates({
                            [currentBars[j].id]: "checking",
                            [currentBars[min_index].id]: "checking",
                        });

                        await delay(200);

                        // Perform swap and get updated array
                        currentBars = await swap(currentBars, i, min_index);
                    }

                    // Clear comparison states
                    setBarStates(prev => {
                        const newState = { ...prev };
                        delete newState[currentBars[i].id];
                        delete newState[currentBars[min_index].id];
                        return newState;
                    });
                }

                // Mark the last element of this pass as sorted
                if (i < n - 1) {
                    setBarStates(prev => ({
                        ...prev,
                        [currentBars[n - 1 - i].id]: "sorted"
                    }));
                }
            }

            // Mark the first element as sorted too
            if (currentBars.length > 0) {
                setBarStates(prev => ({
                    ...prev,
                    [currentBars[0].id]: "sorted"
                }));
            }

            // Clear all states after a moment
            await delay(1000);
            setBarStates({});

        } catch (error) {
            console.error("Error during sorting:", error);
        } finally {
            setIsSorting(false);
            sortingRef.current = false;
        }
    };

    const handleSearch = () => {
        if (bars.length === 0) {
            toast("No data to sort", {
                description: "Please add some numbers or generate a random array first",
            });
            return;
        }

        if (!isSorting) {
            SelectionSteps();
        }
    };

    const stopSorting = () => {
        sortingRef.current = false;
        setIsSorting(false);
        setBarStates({});
    };

    const playSteps = () => {
        if (!isSorting && !isPlaying) {
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
        if (isPlaying || isSorting) return;
        const currentLabel = timelineRef.current.currentLabel();
        const currentIndex = labelsRef.current.indexOf(currentLabel);
        if (currentIndex < labelsRef.current.length - 1) {
            timelineRef.current.seek(labelsRef.current[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        if (isPlaying || isSorting) return;
        const currentLabel = timelineRef.current.currentLabel();
        const currentIndex = labelsRef.current.indexOf(currentLabel);
        if (currentIndex > 0) {
            timelineRef.current.seek(labelsRef.current[currentIndex - 1]);
        }
    };

    const getBarColor = (id: string) => {
        switch (barStates[id]) {
            case "checking":
                return "bg-red-500";
            case "comparing":
                return "bg-yellow-500";
            case "sorted":
                return "bg-green-500";
            default:
                return "bg-blue-500";
        }
    };

    const algoMap = [
        { name: "Bubble Sort", value: "bubble" },
        { name: "Selection Sort", value: "selection" },
        { name: "Insertion Sort", value: "insertion" },
        { name: "Merge Sort", value: "merge" },
        { name: "Quick Sort", value: "quick" },
    ];

    return (
        <SharedLayout
            inputValue={inputValue}
            setInputValue={setInputValue}
            isPlaying={isSorting} // Show as playing when sorting
            handleInsert={handleInsert}
            handleSearch={handleSearch}
            generateRandomArray={generateRandomArray}
            algoMap={algoMap}
            onPlay={playSteps}
            onPause={stopSorting} // Allow stopping the sort
            onNext={nextStep}
            onPrev={prevStep}
        >
          

            <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
                {bars.map((bar) => (
                    <div
                        id={`bar-${bar.id}`}
                        key={bar.id}
                        data-flip-id={bar.id}
                        className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(
                            bar.id
                        )}`}
                        style={{ height: `${Math.max(Math.abs(bar.value) * 4, 30)}px` }}
                    >
                        {bar.value}
                    </div>
                ))}
            </div>
        </SharedLayout>
    );
};

export default SelectionSort;