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
      return "bg-red-500";
    case "comparing":
      return "bg-yellow-500";
    case "splitting":
      return "bg-orange-500";
    case "merging":
      return "bg-cyan-600";
    case "sorted":
      return "bg-green-500";
    default:
      return "bg-blue-500";
  }
};

const getRouteMode = (pathname: string): SortAlgorithmKey => {
  if (pathname === ROUTES.selectionSort) {
    return "selection";
  }
  if (pathname === ROUTES.mergeSort) {
    return "merge";
  }
  if (
    pathname === ROUTES.insertionSort ||
    pathname === ROUTES.insertionSortLegacy
  ) {
    return "insertion";
  }
  return "bubble";
};

const SortPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeMode = getRouteMode(location.pathname);
  const queryMode = searchParams.get("mode");
  const initialMode: SortAlgorithmKey =
    queryMode === "bubble" ||
    queryMode === "selection" ||
    queryMode === "insertion" ||
    queryMode === "merge"
      ? queryMode
      : routeMode;

  const [mode, setMode] = useState<SortAlgorithmKey>(initialMode);
  const [bars, setBars] = useState<SortBar[]>([]);
  const [barStates, setBarStates] = useState<Record<string, SortBarState>>({});
  const [inputValue, setInputValue] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.75);
  const [frameLabel, setFrameLabel] = useState("Ready");
  const [frameDetail, setFrameDetail] = useState(
    "Press Sort to visualize each step.",
  );
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});
  // SVG path for the active dotted line that highlights the current merge/split range
  const activeLineRef = useRef<SVGPathElement>(null);

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

  const describeFrame = (frame: SortFrame) => {
    const stateValues = Object.values(frame.states);
    const splittingCount = stateValues.filter(
      (value) => value === "splitting",
    ).length;
    const mergingCount = stateValues.filter(
      (value) => value === "merging",
    ).length;
    const comparingCount = stateValues.filter(
      (value) => value === "comparing",
    ).length;
    const checkingCount = stateValues.filter(
      (value) => value === "checking",
    ).length;
    const sortedCount = stateValues.filter(
      (value) => value === "sorted",
    ).length;

    if (splittingCount > 0) {
      return {
        label: "Splitting",
        detail: `Dividing into smaller subarrays (${splittingCount} bars in split phase).`,
      };
    }
    if (mergingCount > 0) {
      return {
        label: "Merging",
        detail: `Combining sorted halves (${mergingCount} bars currently merging).`,
      };
    }
    if (comparingCount > 0 || checkingCount > 0) {
      return {
        label: "Comparing",
        detail: `Evaluating bars (${comparingCount} comparing, ${checkingCount} checking).`,
      };
    }
    if (sortedCount > 0) {
      return {
        label: "Sorted Segment",
        detail: `${sortedCount} bars are currently confirmed sorted.`,
      };
    }

    return {
      label: "Preparing",
      detail: "Setting up the next step.",
    };
  };

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
        stroke: "#00ff08",
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
    setFrameLabel("Ready");
    setFrameDetail("Press Sort to visualize each step.");
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
      setFrameLabel("No Steps");
      setFrameDetail("Add bars to begin visualization.");
      return;
    }

    setFrameLabel("Starting");
    setFrameDetail(`Loaded ${frames.length} animation steps.`);

    timeline.clear().pause(0);
    timeline.eventCallback("onComplete", () => {
      setIsPlaying(false);
      setFrameLabel("Completed");
      setFrameDetail("Sorting visualization finished.");
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
          const description = describeFrame(frame);
          setFrameLabel(description.label);
          setFrameDetail(description.detail);

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
      <div className="w-full max-w-[1600px] px-6 md:px-12 py-4 overflow-visible">
        <div className="mb-4 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
          <p className="text-sm font-semibold tracking-wide text-foreground">
            {frameLabel}
          </p>
          <p className="text-xs md:text-sm text-muted-foreground">
            {frameDetail}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] md:text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded bg-orange-500/20 text-orange-300">
              Splitting
            </span>
            <span className="px-2 py-1 rounded bg-cyan-600/20 text-cyan-300">
              Merging
            </span>
            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-300">
              Comparing
            </span>
            <span className="px-2 py-1 rounded bg-red-500/20 text-red-300">
              Checking
            </span>
            <span className="px-2 py-1 rounded bg-green-500/20 text-green-300">
              Sorted
            </span>
          </div>
        </div>

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
              className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(
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
