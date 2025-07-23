import React, { useState, useRef } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import ControllerFooter from "./ControllerFooter";

gsap.registerPlugin(Flip);

const BubbleSortVisualizer = () => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<number[][]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate bubble sort steps
  const generateSteps = (arr: number[]) => {
    const allSteps: number[][] = [];
    const temp = [...arr];

    for (let i = 0; i < temp.length - 1; i++) {
      for (let j = 0; j < temp.length - i - 1; j++) {
        if (temp[j] > temp[j + 1]) {
          [temp[j], temp[j + 1]] = [temp[j + 1], temp[j]];
          allSteps.push([...temp]);
        }
      }
    }

    return allSteps;
  };

  const handleInsert = () => {
    const num = parseInt(inputValue.trim());
    if (!isNaN(num)) {
      const updated = [...numbers, num];
      setNumbers(updated);
      setInputValue("");
      setSteps(generateSteps(updated));
      setCurrentStep(0);

      // Stop playback if inserting new data
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsPlaying(false);
    }
  };

  const playSteps = () => {
    if (steps.length === 0 || isPlaying) return;

    setIsPlaying(true);
    let i = currentStep;

    intervalRef.current = setInterval(() => {
      if (i < steps.length) {
        const state = Flip.getState(".bar");
        setNumbers(steps[i]);
        Flip.from(state, {
          duration: 0.5,
          ease: "power1.inOut",
        });
        setCurrentStep(i + 1);
        i++;
      } else {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setIsPlaying(false);
      }
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
    if (currentStep < steps.length) {
      const state = Flip.getState(".bar");
      setNumbers(steps[currentStep]);
      Flip.from(state, {
        duration: 0.5,
        ease: "power1.inOut",
      });
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const state = Flip.getState(".bar");
      setNumbers(steps[currentStep - 1]);
      Flip.from(state, {
        duration: 0.5,
        ease: "power1.inOut",
      });
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Top Controls */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter number"
            className="w-48"
          />
          <Button
            onClick={handleInsert}
            className="bg-green-400 hover:bg-green-500"
          >
            Insert
          </Button>
        </div>

        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Selection Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bubble">Bubble Sort</SelectItem>
            <SelectItem value="selection">Selection Sort</SelectItem>
            <SelectItem value="insertion">Insertion Sort</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Visualization */}
      <div className="flex-1 flex items-end justify-center gap-2 px-4 py-6 transition-all">
        {numbers.map((num, index) => (
          <div
            key={index}
            className="bar bg-blue-500 text-white text-center rounded-sm"
            style={{
              height: `${num * 5}px`,
              width: "30px",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            {num}
          </div>
        ))}
      </div>

      {/* Playback Controller */}
      <ControllerFooter
        onPlay={playSteps}
        onPause={pauseSteps}
        onNext={nextStep}
        onPrev={prevStep}
      />
    </div>
  );
};

export default BubbleSortVisualizer;
