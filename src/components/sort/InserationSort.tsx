import { useRef, useState } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/search/SharedLayout";
import { toast } from "sonner";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(Flip);

// Define a type for our bar objects for better type safety
type Bar = {
    value: number;
    id: string; // Unique ID for React keys
};

type BarState = "default" | "checking" | "comparing" | "sorted";

const InsertionSort = () => {
    const [bars, setBars] = useState<Bar[]>([]);
    const [barStates, setBarStates] = useState<Record<string, BarState>>({});
    const [inputValue, setInputValue] = useState("");
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSorting, setIsSorting] = useState(false);

    const timelineRef = useRef(gsap.timeline({ paused: true }));
    const labelsRef = useRef<string[]>([]);
    const sortingRef = useRef(false);

    useGSAP(() => {
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
        if (isSorting) return;

        const num = parseInt(inputValue.trim());
        if (num > 50 || num < -50) {
            toast("Please enter a number between -50 and 50.");
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
        if (isSorting) return;

        const random = Array.from({ length: 15 }, () => ({
            value: Math.floor(Math.random() * 50) + 1,
            id: `bar-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
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
            const newBars = [...currentBars];
            [newBars[index1], newBars[index2]] = [newBars[index2], newBars[index1]];
            setBars(newBars);

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

    const InsertionSteps = async () => {
        if (sortingRef.current) return;

        sortingRef.current = true;
        setIsSorting(true);

        let currentBars = [...bars];
        const n = currentBars.length;

        try {
            for (let i = 1; i < n; i++) {
                let key = currentBars[i];
                let j = i - 1;

                while (j >= 0 && currentBars[j].value > key.value) {
                    currentBars[j + 1] = currentBars[j];
                    j -= 1;
                }

                currentBars[j + 1] = key;

                const state = Flip.getState(".bar");
                setBars([...currentBars]);
                Flip.from(state, {
                    targets: ".bar",
                    duration: 0.5,
                    ease: "power2.inOut"
                });

                await delay(500);
            }

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
            InsertionSteps(); // ✅ Correct function to call
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
            isPlaying={isSorting}
            handleInsert={handleInsert}
            handleSearch={handleSearch}
            generateRandomArray={generateRandomArray}
            algoMap={algoMap}
            onPlay={playSteps}
            onPause={stopSorting}
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

export default InsertionSort;
