
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { type BarState } from "@/components/SharedLayout";

type Bar = {
    value: number;
    id: string; 
};



export const useSearchVizulizer = () => {
   


        const [bars, setBars] = useState<Bar[]>([]);
        
        const [barStates, setBarStates] = useState<Record<string, BarState>>({});
        const [inputValue, setInputValue] = useState("");
        const [searchValue, setSearchValue] = useState("");
        const [isPlaying, setIsPlaying] = useState(false);
        const [speed, setSpeed] = useState(1);

        const MIN_VALUE = -50;
        const MAX_VALUE = 50;



    // Use a ref for the timeline
    const timelineRef = useRef(gsap.timeline({ paused: true }));
    // We'll use this ref to store the timeline's labels for step-by-step navigation
    const labelsRef = useRef<string[]>([]);
    // Cleanup toast and timeline on unmount
    useEffect(() => {
        return () => {
            timelineRef.current.kill();
        };
    }, []);

    useEffect(() => {
        timelineRef.current.timeScale(speed);
    }, [speed]);

    const resetAnimation = () => {
        timelineRef.current.clear().pause(0);
        labelsRef.current = [];
        setIsPlaying(false);
        setBarStates({});
    };

    const handleInsert = () => {
        const trimmed = inputValue.trim();
        const parsed = trimmed === "" ? Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE : parseInt(trimmed, 10);

        if (isNaN(parsed) || parsed > MAX_VALUE || parsed < MIN_VALUE) {
            return;
        }

        const val = Date.now() + Math.random();
        const newBar: Bar = { value: parsed, id: val.toString() };
        const updated = [...bars, newBar];
        setBars(updated);

        resetAnimation();
        setInputValue("");
    };

    const generateRandomArray = (length = 15) => {
        const requestedLength = typeof length === "number" && Number.isFinite(length) ? length : 8;
        const safeLength = Math.min(Math.max(Math.floor(requestedLength), 1), 20);
        const random = Array.from({ length: safeLength }, () => ({
            value: Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE,
            id: Math.random().toString(),
        }));

        // Directly set bars without Flip animation to avoid thin initial rendering.
        setBars(random);
        resetAnimation();
    };

    useEffect(() => {
        if (bars.length === 0) {
            generateRandomArray();
        }
        // Run only on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clampSpeed = (value: number) => Math.min(3, Math.max(0.25, value));

    const setPlaybackSpeed = (value: number) => {
        setSpeed(clampSpeed(value));
    };

    const increaseSpeed = () => {
        setSpeed((prev) => clampSpeed(prev + 0.25));
    };

    const decreaseSpeed = () => {
        setSpeed((prev) => clampSpeed(prev - 0.25));
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
             queue: "/queue",
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

    const getBarColor = (id: string) => {
        switch (barStates[id]) {
            case "checking": return "bg-yellow-500 text-black shadow-sm font-bold";
            case "found": return "bg-brand text-black shadow-sm font-bold";
            case "discarded": return "bg-gray-500 text-white opacity-50";
            default: return "bg-blue-700 text-white flex items-center justify-center";
        }
    };



    
     return {
    bars, setBars,
    barStates, setBarStates,
    inputValue, setInputValue,
    searchValue, setSearchValue,
    isPlaying, setIsPlaying,
    timelineRef, labelsRef,
    resetAnimation,
    handleInsert, generateRandomArray,
    playSteps, pauseSteps, nextStep, prevStep,
    getBarColor,
        speed,
        setPlaybackSpeed,
        increaseSpeed,
        decreaseSpeed,
  };



}
