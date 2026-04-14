
import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { type BarState } from "@/components/visualizer/SharedLayout";


gsap.registerPlugin(Flip);

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

        const state = Flip.getState(".bar-container, .bar");
        setBars(updated);
        Flip.from(state, {
            duration: 0.5,
            ease: "power1.inOut",
        });

        resetAnimation();
        setInputValue("");
    };

    const generateRandomArray = (length = 8) => {
        const safeLength = Math.min(Math.max(length, 1), 20);
        const random = Array.from({ length: safeLength }, () => ({
            value: Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE,
            id: Math.random().toString(),
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

    const getBarColor = (id: string) => {
        switch (barStates[id]) {
            case "checking": return "bg-red-500";
            case "found": return "bg-green-500";
            default: return "bg-blue-500";
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
  };



}
