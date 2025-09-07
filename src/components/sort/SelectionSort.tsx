import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/search/SharedLayout";
import { Alert, AlertTitle } from "@/components/ui/alert.tsx";
import { toast } from "sonner";

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
    const [isntAllowed, setIsntAllowed] = useState(false);
    const [isSorting, setIsSorting] = useState(false);

    const timelineRef = useRef(gsap.timeline({ paused: true }));
    const labelsRef = useRef<string[]>([]);
    const sortingRef = useRef(false);

    useEffect(() => {
        if (isntAllowed) {
            const timeout = setTimeout(() => setIsntAllowed(false), 1500);
            return () => clearTimeout(timeout);
        }
    }, [isntAllowed]);

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
            setIsntAllowed(true);
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
                let min_index = i;

                for (let j = i + 1; j < n; j++) {
                    if (!sortingRef.current) return;

                    // Highlight comparison
                    setBarStates({
                        [currentBars[min_index].id]: "comparing",
                        [currentBars[j].id]: "comparing",
                    });
                    await delay(300);

                    if (currentBars[j].value < currentBars[min_index].value) {
                        min_index = j;
                    }

                    // Clear comparison highlight
                    setBarStates({});
                }

                // Swap after scanning whole subarray
                if (min_index !== i) {
                    currentBars = await swap(currentBars, i, min_index);
                }

                // Mark the element at i as sorted
                setBarStates((prev) => ({
                    ...prev,
                    [currentBars[i].id]: "sorted",
                }));
            }

            // Last element is also sorted
            setBarStates((prev) => ({
                ...prev,
                [currentBars[n - 1].id]: "sorted",
            }));

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
            {isntAllowed &&
                toast("Invalid Number", {
                    description:
                        "You can't Enter Number greater than 50 and less than -50",
                })}

            {isSorting && (
                <div className="text-center mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        Sorting in progress...
                    </div>
                </div>
            )}

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