import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import gsap from "@/gsapSetup"; // centralized GSAP with plugins (including DrawSVG)
import Flip from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import SharedLayout from "@/components/SharedLayout";
import { ROUTES } from "@/constants/routes";
import {
  sortAlgorithmBuilders,
  type SortFrame,
  type SortAlgorithmKey,
  type SortBar,
  type SortBarState,
} from "./SortAlgos";

gsap.registerPlugin(Flip, useGSAP);

const createBarId = () =>
  `bar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const algoMap = [
  { name: "Bubble Sort", value: "bubble" },
  { name: "Selection Sort", value: "selection" },
  { name: "Insertion Sort", value: "insertion" },
  { name: "Merge Sort", value: "merge" },
] as const;

const getBarColor = (state: SortBarState | undefined) => {
  switch (state) {
    case "checking":
      return "viz-bar-checking shadow-sm border-2 border-transparent font-bold";
    case "comparing":
      return "viz-bar-comparing shadow-sm border-2 border-transparent font-bold";
    case "swapping":
      // rose ring — two bars are physically exchanging positions
      return "viz-bar-swapping border-2 border-transparent font-bold";
    case "placed":
      // cyan ring — element was chosen in merge and written to output
      return "viz-bar-placed border-2 border-transparent font-bold";
    case "consumed":
      // hollow ghost — value was taken from this slot, now empty
      return "viz-bar-consumed";
    case "splitting":
      return "viz-bar-splitting shadow-sm border-2 border-transparent font-bold";
    case "merging":
      return "viz-bar-merging shadow-sm border-2 border-transparent font-bold";
    case "sorted":
      return "viz-bar-sorted border-2 border-transparent font-bold";
    default:
      return "viz-bar border-2 border-transparent";
  }
};


const SortPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryMode = searchParams.get("mode");
  const initialMode: SortAlgorithmKey = "bubble" 
  const [mode, setMode] = useState<SortAlgorithmKey>(initialMode);
  const [bars, setBars] = useState<SortBar[]>([]);
  const [barStates, setBarStates] = useState<Record<string, SortBarState>>({});
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.75);

  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // SVG path for the active dotted line that highlights the current merge/split range
  const activeLineRef = useRef<SVGSVGElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  const getExistingBarElements = (ids: string[]) =>
    ids
      .map((id) => barRefs.current[id])
      .filter((element): element is HTMLDivElement => Boolean(element));

  const getAllBarElements = () =>
    Object.values(barRefs.current).filter(
      (element): element is HTMLDivElement => Boolean(element),
    );

  const animateMergeTreeFrame = (frame: SortFrame) => {
    const barIds = frame.bars.map((bar) => bar.id);
    const elements = getExistingBarElements(barIds);
    if (elements.length === 0) {
      return;
    }

    gsap.killTweensOf(elements);

    const duration = Math.max(0.35, frame.duration * 0.85);
    // First, clear any previous dotted line
    if (activeLineRef.current) {
      gsap.set(activeLineRef.current, { attr: { d: "" } });
    }

    elements.forEach((element) => {
      const barId = frame.bars.find(
        (bar) => bar.id === element.dataset.barid,
      )?.id;
      if (!barId) {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration,
          ease: "power2.inOut",
          overwrite: "auto",
        });
        return;
      }
      const targetOffset = frame.offsets?.[barId] ?? { x: 0, y: 0 };
      gsap.to(element, {
        x: targetOffset.x,
        y: targetOffset.y,
        duration,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    });

    // After positioning, draw a dotted line over the current merge range
    if (activeLineRef.current && elements.length > 0) {
      const container = barsContainerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const firstRect = elements[0].getBoundingClientRect();
      const lastRect = elements[elements.length - 1].getBoundingClientRect();
      const startX = firstRect.left - containerRect.left;
      const endX = lastRect.right - containerRect.left;
      const y = firstRect.top - containerRect.top - 12; // slightly above the bars
      const d = `M${startX},${y} L${endX},${y}`;
      const line = activeLineRef.current;
      gsap.set(line, {
        attr: { d },
        strokeDasharray: "4 4",
        stroke: "var(--brand)",
        strokeWidth: 2,
      });
      gsap.fromTo(
        line,
        { drawSVG: "0%" },
        { drawSVG: "100%", duration: 0.3, ease: "power2.out" },
      );
    }
  };

  useGSAP(() => {
    timelineRef.current = gsap.timeline({ paused: true });

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    timelineRef.current?.timeScale(speed);
  }, [speed]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (bars.length > 0) {
      return;
    }

    const randomBars = Array.from({ length: 15 }, () => ({
      id: createBarId(),
      value: Math.floor(Math.random() * 50) + 1,
    }));
    setBars(randomBars);
  }, [bars.length]);

  const clampSpeed = (value: number) => Math.min(3, Math.max(0.25, value));

  const updateMode = (nextMode: string) => {
    const normalizedMode: SortAlgorithmKey =
      nextMode === "selection"
        ? "selection"
        : nextMode === "insertion"
          ? "insertion"
          : nextMode === "merge"
            ? "merge"
            : "bubble";

    setMode(normalizedMode);
    setSearchParams({ mode: normalizedMode }, { replace: true });
  };

  const resetTimeline = () => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    timeline.clear().pause(0);
    const allElements = getAllBarElements();
    if (allElements.length > 0) {
      gsap.killTweensOf(allElements);
      gsap.set(allElements, { x: 0, y: 0 });
    }
    setLabels([]);
    setIsPlaying(false);
    setBarStates({});

  };

  const handleInsert = () => {
    const parsed = Number.parseInt(inputValue.trim(), 10);
    if (Number.isNaN(parsed) || parsed < -50 || parsed > 50) {
      return;
    }

    setBars((prev) => [...prev, { id: createBarId(), value: parsed }]);
    setInputValue("");
    resetTimeline();
  };

  const generateRandomArray = () => {
    const randomBars = Array.from({ length: 15 }, () => ({
      id: createBarId(),
      value: Math.floor(Math.random() * 50) + 1,
    }));
    setBars(randomBars);
    resetTimeline();
  };

  const buildSortTimeline = () => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    if (bars.length === 0) {
      return;
    }

    const frames = sortAlgorithmBuilders[mode](bars);
    if (frames.length === 0) {

      return;
    }



    timeline.clear().pause(0);
    timeline.eventCallback("onComplete", () => {
      setIsPlaying(false);

    });
    timeline.eventCallback("onInterrupt", () => setIsPlaying(false));

    const nextLabels: string[] = [];

    frames.forEach((frame, index) => {
      const label = `step-${index}`;
      nextLabels.push(label);
      timeline.addLabel(label);
      timeline.call(
        () => {
          setBars(frame.bars);
          setBarStates(frame.states);



          requestAnimationFrame(() => {
            if (mode === "merge") {
              animateMergeTreeFrame(frame);
              return;
            }

            const flipTargets = getAllBarElements();
            if (flipTargets.length > 0) {
              gsap.killTweensOf(flipTargets);
            }
            const flipState = Flip.getState(flipTargets);
            Flip.from(flipState, {
              targets: getExistingBarElements(frame.bars.map((bar) => bar.id)),
              duration: Math.max(0.18, frame.duration * 0.42),
              ease: "power1.inOut",
              absolute: false,
              overwrite: true,
            });
          });
        },
        undefined,
        label,
      );

      timeline.to({}, { duration: frame.duration }, label);
    });

    setLabels(nextLabels);
    setIsPlaying(true);
    timeline.play(0);
  };

  const handleSort = () => {
    buildSortTimeline();
  };

  const playSteps = () => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    if (isPlaying) {
      return;
    }

    timeline.play();
    setIsPlaying(true);
  };

  const pauseSteps = () => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    if (!isPlaying) {
      return;
    }

    timeline.pause();
    setIsPlaying(false);
  };

  const nextStep = () => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    if (isPlaying || labels.length === 0) {
      return;
    }

    const currentLabel = timeline.currentLabel();
    const currentIndex = labels.indexOf(currentLabel);
    const nextIndex =
      currentIndex < 0 ? 0 : Math.min(currentIndex + 1, labels.length - 1);
    timeline.seek(labels[nextIndex]);
  };

  const prevStep = () => {
    const timeline = timelineRef.current;
    if (!timeline) {
      return;
    }

    if (isPlaying || labels.length === 0) {
      return;
    }

    const currentLabel = timeline.currentLabel();
    const currentIndex = labels.indexOf(currentLabel);
    const prevIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
    timeline.seek(labels[prevIndex]);
  };

  return (
    <SharedLayout
      inputValue={inputValue}
      setInputValue={setInputValue}
      handleInsert={handleInsert}
      handleSearch={handleSort}
      actionLabel="Sort"
      generateRandomArray={generateRandomArray}
      algoMap={algoMap.map((algo) => ({ name: algo.name, value: algo.value }))}
      isPlaying={isPlaying}
      onPlay={playSteps}
      onPause={pauseSteps}
      onNext={nextStep}
      onPrev={prevStep}
      selectedAlgorithm={mode}
      onAlgorithmChange={updateMode}
      speed={speed}
      onSpeedChange={(value) => setSpeed(clampSpeed(value))}
      onSpeedIncrease={() => setSpeed((prev) => clampSpeed(prev + 0.25))}
      onSpeedDecrease={() => setSpeed((prev) => clampSpeed(prev - 0.25))}
    >
      <div className="w-full h-[900px] flex justify-center items-center max-w-[1600px] px-6 md:px-12 py-4 overflow-visible">

        <div
          ref={barsContainerRef}
          className={`relative bar-container flex gap-2 justify-center items-end p-4 overflow-visible ${
            mode === "merge" ? "min-h-[720px]" : "min-h-[260px]"
          }`}
        >
          {bars.map((bar) => (
            <div
              key={bar.id}
              data-barid={bar.id}
              ref={(node) => {
                barRefs.current[bar.id] = node;
              }}
              className={`bar w-10 rounded-lg flex items-center justify-center font-mono text-sm transition-all duration-300 ${getBarColor(
                barStates[bar.id],
              )}`}
              style={{ height: `${Math.max(Math.abs(bar.value) * 4, 30)}px` }}
            >
              {bar.value}
            </div>
          ))}
          {/* SVG overlay for the active dotted line during merge/split */}
          <svg
            className="absolute inset-0 pointer-events-none"
            ref={activeLineRef}
          />
        </div>
      </div>
    </SharedLayout>
  );
};

export default SortPage;
