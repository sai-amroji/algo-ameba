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
  id: string; // Use a unique ID for stable keys in React
};

// We will use this to track the state for visual rendering
type BarState = "default" | "checking";

const BubbleSort = () => {
  const [bars, setBars] = useState<Bar[]>([]);
  const [barStates, setBarStates] = useState<Record<number, BarState>>({});
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isntAllowed, setIsntAllowed] = useState(false);

  const timelineRef = useRef(gsap.timeline({ paused: true }));
  const labelsRef = useRef<string[]>([]);

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
  };

  const handleInsert = () => {
    const num = parseInt(inputValue.trim());
    if (num > 50 || num < -50) {
      setIsntAllowed(true);
      return;
    }
    if (!isNaN(num)) {
      const val = Date.now() - Math.floor(Math.random() * 100000);
      const newBar: Bar = { value: num, id: `bar-${val.toString()}` };
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
    const random = Array.from({ length: 15 }, () => ({
      value: Math.floor(Math.random() * 50) + 1,
      id: `bar-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
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

  const swap = (index1: number, index2: number) => {
    const state = Flip.getState(".bar"); // capture before

    setBars((prev) => {
      const copy = [...prev];
      [copy[index1], copy[index2]] = [copy[index2], copy[index1]];
      return copy;
    });

    // Animate in next frame
    timelineRef.current.add(() => {
      Flip.from(state, {
        duration: 0.4,
        ease: "power1.inOut",
      });
    });
  };

  const bubbleSteps = () => {
    const timeline = timelineRef.current;
    const labels: string[] = [];

    for (let i = 0; i < bars.length; i++) {
      for (let j = 0; j < bars.length - i - 1; j++) {
        const label = `step-${i}-${j}`;
        timeline.addLabel(label);
        labels.push(label);

        if (bars[j].value > bars[j + 1].value) {
          // Add swap step to timeline
          timeline.add(() => swap(j, j + 1));
        }
      }
    }

    labelsRef.current = labels;
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
      case "checking":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const algoMap = [
    { name: "Bubble Sort", value: "bubble" },
    { name: "Selection Sort", value: "selection" },
    { name: "Inseration Sort", value: "inseration" },
    { name: "Merge Sort", value: "merge" },
    { name: "Quick Sort", value: "quick" },
  ];

  return (
    <SharedLayout
      inputValue={inputValue}
      setInputValue={setInputValue}
      isPlaying={isPlaying}
      handleInsert={handleInsert}
      generateRandomArray={generateRandomArray}
      algoMap={algoMap}
      onPlay={playSteps}
      onPause={pauseSteps}
      onNext={nextStep}
      onPrev={prevStep}
    >
      {isntAllowed &&
        toast("Invalid Number", {
          description:
            "You can't Enter Number greater than 50 and less than -50",
        })}
      <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
        {bars.map((bar) => (
          <div
            id={`bar-${bar.id}`}
            key={bar.id}
            data-flip-id={bar.id}
            className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(
              bar.id
            )}`}
            style={{ height: `${Math.max(bar.value * 4, 30)}px` }}
          >
            {bar.value}
          </div>
        ))}
      </div>
    </SharedLayout>
  );
};

export default BubbleSort;
