import { useEffect, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import gsap from "@/gsapSetup"; // centralized GSAP instance with plugins registered
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import SharedLayout from "@/components/SharedLayout";
import { ROUTES } from "@/constants/routes";
import { useSearchVizulizer } from "@/hooks/useSearchVizulizer";
import {
  searchAlgorithms,
  type SearchFrame,
} from "@/components/search/searchAlgorithms";

// DrawSVGPlugin is already registered globally via gsapSetup

type SearchMode = "linear" | "binary";

const algoMap = [
  { name: "Linear Search", value: "linear" },
  { name: "Binary Search", value: "binary" },
] as const;

const SearchPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeMode: SearchMode =
    location.pathname === ROUTES.binarySearch ? "binary" : "linear";
  const queryMode = searchParams.get("mode");
  const initialMode: SearchMode =
    queryMode === "binary" || queryMode === "linear" ? queryMode : routeMode;
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    bars,
    setBars,
    setBarStates,
    inputValue,
    setInputValue,
    searchValue,
    setSearchValue,
    isPlaying,
    setIsPlaying,
    timelineRef,
    labelsRef,
    resetAnimation,
    handleInsert,
    generateRandomArray,
    playSteps,
    pauseSteps,
    nextStep,
    prevStep,
    getBarColor,
    speed,
    setPlaybackSpeed,
    increaseSpeed,
    decreaseSpeed,
  } = useSearchVizulizer();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const { contextSafe } = useGSAP({ scope: barsContainerRef });
  // Ref for the active dotted line that highlights the current focus range
  const activeLineRef = useRef<SVGPathElement>(null);

  const getExistingBarElements = (ids: string[]) =>
    ids
      .map((id) => barRefs.current[id])
      .filter((element): element is HTMLDivElement => Boolean(element));

  const animateBinaryFrame = contextSafe((frame: SearchFrame) => {
    const activeIds = frame.activeIds ?? [];
    const discardedIds = frame.discardedIds ?? [];
    const focusId = frame.focusId;

    const activeElements = getExistingBarElements(activeIds);
    const discardedElements = getExistingBarElements(discardedIds);

    // Use timeline defaults for consistency
    const tl = gsap.timeline({
      defaults: { duration: 0.22, overwrite: "auto" },
    });
    tl.to(activeElements, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: "grayscale(0%)",
    }).to(
      discardedElements,
      { opacity: 0.35, y: 14, filter: "grayscale(100%)" },
      0,
    );

    // Center the active range inside the container
    const container = barsContainerRef.current;
    if (container && activeElements.length > 0) {
      const containerRect = container.getBoundingClientRect();
      const firstRect = activeElements[0].getBoundingClientRect();
      const lastRect =
        activeElements[activeElements.length - 1].getBoundingClientRect();
      const rangeCenterX = (firstRect.left + lastRect.right) / 2;
      const containerCenterX = (containerRect.left + containerRect.right) / 2;
      const shiftX = containerCenterX - rangeCenterX;
      tl.to(activeElements, { x: shiftX, duration: 0.24 }, "<");

      // Draw a dotted line over the focused range using DrawSVGPlugin
      if (activeLineRef.current) {
        const line = activeLineRef.current;
        const startX = firstRect.left - containerRect.left;
        const endX = lastRect.right - containerRect.left;
        const y = firstRect.top - containerRect.top - 10; // 10px above the bars
        const d = `M${startX},${y} L${endX},${y}`;
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
    }

    // Highlight the single focus bar (if any)
    if (focusId) {
      const focusElement = barRefs.current[focusId];
      if (focusElement) {
        tl.to(focusElement, { y: -12, scale: 1.06, duration: 0.2 }, "<");
      }
    }
  });

  const resetBarTweens = contextSafe(() => {
    const barElements = getExistingBarElements(bars.map((bar) => bar.id));

    if (barElements.length === 0) {
      return;
    }

    gsap.killTweensOf(barElements);
    gsap.set(barElements, {
      clearProps: "x,y,scale,opacity,filter",
    });
  });

  const updateMode = (nextMode: string) => {
    const normalizedMode: SearchMode =
      nextMode === "binary" ? "binary" : "linear";
    setMode(normalizedMode);
    setSearchParams({ mode: normalizedMode }, { replace: true });
  };

  const finishTimeline = () => {
    setIsPlaying(false);
  };

  const runSearch = (target: number) => {
    const timeline = timelineRef.current;
    resetAnimation();
    timeline.clear().pause(0);
    resetBarTweens();

    const result = searchAlgorithms[mode](bars, target);
    const labels: string[] = [];

    setBars(result.initialBars);

    result.frames.forEach((frame, index) => {
      const label = `step-${index}`;
      labels.push(label);
      timeline.addLabel(label);

      timeline.call(
        () => {
          setBarStates(frame.states);
          if (mode === "binary") {
            // Wait for React to apply classes/styles before GSAP reads positions.
            requestAnimationFrame(() => {
              animateBinaryFrame(frame);
            });
          }
        },
        undefined,
        label,
      );

      timeline.to({}, { duration: frame.duration }, label);
    });

    timeline.eventCallback("onComplete", () => {
      finishTimeline();
      if (mode !== "binary") {
        resetBarTweens();
      }
      if (!result.found) {
        toast("Value not found");
      }
    });
    timeline.eventCallback("onInterrupt", finishTimeline);

    labelsRef.current = labels;

    if (labels.length === 0) {
      finishTimeline();
      return;
    }

    requestAnimationFrame(() => {
      timeline.play(0);
      setIsPlaying(true);
    });
  };

  const handleSearch = () => {
    const target = Number.parseInt(searchValue.trim(), 10);
    if (Number.isNaN(target) || target > 50 || target < -50) {
      toast("Enter a valid target between -50 and 50");
      return;
    }

    if (bars.length === 0) {
      toast("No bars available. Generate or insert values first.");
      return;
    }

    runSearch(target);
  };

  return (
    <SharedLayout
      inputValue={inputValue}
      setInputValue={setInputValue}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      handleInsert={handleInsert}
      isPlaying={isPlaying}
      handleSearch={handleSearch}
      actionLabel="Search"
      generateRandomArray={generateRandomArray}
      algoMap={algoMap.map((algo) => ({ name: algo.name, value: algo.value }))}
      onPlay={playSteps}
      onPause={pauseSteps}
      onNext={nextStep}
      onPrev={prevStep}
      selectedAlgorithm={mode}
      onAlgorithmChange={updateMode}
      speed={speed}
      onSpeedChange={setPlaybackSpeed}
      onSpeedIncrease={increaseSpeed}
      onSpeedDecrease={decreaseSpeed}
    >
      <div
        ref={barsContainerRef}
        className="relative flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container"
      >
        {bars.map((bar) => (
          <div
            id={`bar-${bar.id}`}
            ref={(node) => {
              barRefs.current[bar.id] = node;
            }}
            key={bar.id}
            data-flip-id={bar.id}
            className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(bar.id)}`}
            style={{ height: `${Math.max(Math.abs(bar.value) * 4, 30)}px` }}
          >
            {bar.value}
          </div>
        ))}
        {/* SVG overlay for the active dotted line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          ref={activeLineRef}
        />
      </div>
    </SharedLayout>
  );
};

export default SearchPage;
