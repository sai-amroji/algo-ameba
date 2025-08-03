import { useRef, useState } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout from "@/components/SharedLayout";

gsap.registerPlugin(Flip);

const BubbleSortVisualizer = () => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<number[][]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      const newSteps = generateSteps(updated);
      setSteps(newSteps);
      setCurrentStep(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsPlaying(false);
      setInputValue("");
    }
  };

  const generateRandomArray = () => {
    const random = Array.from({ length: 8 }, () => Math.floor(Math.random() * 50) + 1);
    setNumbers(random);
    const newSteps = generateSteps(random);
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const playSteps = () => {
    if (steps.length === 0 || isPlaying) return;
    setIsPlaying(true);
    let i = currentStep;

    intervalRef.current = setInterval(() => {
      if (i < steps.length) {
        const state = Flip.getState(".bar");
        setNumbers(steps[i]);
        Flip.from(state, { duration: 0.5, ease: "power1.inOut" });
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
      Flip.from(state, { duration: 0.5, ease: "power1.inOut" });
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const state = Flip.getState(".bar");
      setNumbers(steps[currentStep - 1]);
      Flip.from(state, { duration: 0.5, ease: "power1.inOut" });
      setCurrentStep(currentStep - 1);
    }
  };
  const algoMap = [
    { name: "Bubble Sort", value: "bubble" },
    { name: "Selection Sort", value: "selection" },
    { name: "Inseration Sort" ,value : "inseration"},
    { name: "Merge Sort" ,value:"merge"},
    {name:"Quick Sort" , value:"quick"}


  ];
  return (
      <SharedLayout
          algoMap={algoMap}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleInsert={handleInsert}
          generateRandomArray={generateRandomArray}
          isPlaying={isPlaying}
          onPlay={playSteps}
          onPause={pauseSteps}
          onNext={nextStep}
          onPrev={prevStep}    >
        <div className="flex gap-2 justify-center items-end p-4 min-h-[200px]">
          {numbers.map((num, idx) => (
              <div
                  key={idx}
                  className="bar bg-blue-500 w-10 rounded-sm text-white text-center"
                  style={{ height: `${num * 4}px` }}
              >
                {num}
              </div>
          ))}
        </div>
      </SharedLayout>
  );
};

export default BubbleSortVisualizer;
