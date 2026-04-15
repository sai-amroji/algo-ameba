import { useEffect, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import SharedLayout, { type BarState } from "@/components/visualizer/SharedLayout";
import { ROUTES } from "@/constants/routes";
import { useSearchVizulizer } from "@/hooks/useSearchVizulizer";

type SearchMode = "linear" | "binary";

const algoMap = [
  { name: "Linear Search", value: "linear" },
  { name: "Binary Search", value: "binary" },
] as const;

const SearchPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeMode: SearchMode = location.pathname === ROUTES.binarySearch ? "binary" : "linear";
  const queryMode = searchParams.get("mode");
  const initialMode: SearchMode = queryMode === "binary" || queryMode === "linear" ? queryMode : routeMode;
  const [mode, setMode] = useState<SearchMode>(initialMode);

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

  const updateMode = (nextMode: string) => {
    const normalizedMode: SearchMode = nextMode === "binary" ? "binary" : "linear";
    setMode(normalizedMode);
    setSearchParams({ mode: normalizedMode }, { replace: true });
  };

  const finishTimeline = () => {
    setIsPlaying(false);
  };

  const runLinearSearch = (target: number) => {
    const timeline = timelineRef.current;
    const labels: string[] = ["start"];
    let foundBarId: string | undefined;

    timeline.clear().pause(0);
    timeline.eventCallback("onComplete", finishTimeline);
    timeline.eventCallback("onInterrupt", finishTimeline);

    resetAnimation();
    timeline.addLabel("start");

    for (let index = 0; index < bars.length; index++) {
      const bar = bars[index];
      const label = `step-${index}`;
      labels.push(label);
      timeline.addLabel(label);

      timeline.call(() => {
        setBarStates({ [bar.id]: "checking" });
      }, undefined, label);

      timeline.to({}, { duration: 0.35 }, label);

      if (bar.value === target) {
        foundBarId = bar.id;
        const foundLabel = `found-${index}`;
        labels.push(foundLabel);
        timeline.addLabel(foundLabel);
        timeline.call(() => {
          setBarStates({ [bar.id]: "found" });
        }, undefined, foundLabel);
        break;
      }
    }

    const endLabel = foundBarId ? "found" : "not-found";
    labels.push(endLabel);
    timeline.addLabel(endLabel);
    timeline.call(() => {
      if (foundBarId) {
        setBarStates({ [foundBarId]: "found" });
      } else {
        setBarStates({});
      }
    }, undefined, endLabel);

    labelsRef.current = labels;
    timeline.play();
    setIsPlaying(true);
  };

  const runBinarySearch = (target: number) => {
    const timeline = timelineRef.current;
    const sortedBars = [...bars].sort((left, right) => left.value - right.value);
    const labels: string[] = ["start"];
    let foundBarId: string | undefined;

    timeline.clear().pause(0);
    timeline.eventCallback("onComplete", finishTimeline);
    timeline.eventCallback("onInterrupt", finishTimeline);

    resetAnimation();
    setBars(sortedBars);
    timeline.addLabel("start");

    let low = 0;
    let high = sortedBars.length - 1;
    let step = 0;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const label = `step-${step}`;
      const activeIds = sortedBars.slice(low, high + 1).map((bar) => bar.id);
      const midBar = sortedBars[mid];

      labels.push(label);
      timeline.addLabel(label);

      timeline.call(() => {
        const nextStates: Record<string, BarState> = {};
        activeIds.forEach((id) => {
          nextStates[id] = "checking";
        });
        nextStates[midBar.id] = "checking";
        setBarStates(nextStates);
      }, undefined, label);

      timeline.to({}, { duration: 0.35 }, label);

      if (midBar.value === target) {
        foundBarId = midBar.id;
        break;
      }

      if (midBar.value < target) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
      step += 1;
    }

    const endLabel = foundBarId ? "found" : "not-found";
    labels.push(endLabel);
    timeline.addLabel(endLabel);

    timeline.call(() => {
      if (foundBarId) {
        setBarStates({ [foundBarId]: "found" });
      } else {
        setBarStates({});
      }
    }, undefined, endLabel);

    labelsRef.current = labels;
    timeline.play();
    setIsPlaying(true);
  };

  const handleSearch = () => {
    const target = Number.parseInt(searchValue.trim(), 10);
    if (Number.isNaN(target) || target > 50 || target < -50 || bars.length === 0) {
      return;
    }

    if (mode === "binary") {
      runBinarySearch(target);
      return;
    }

    runLinearSearch(target);
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
      <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
        {bars.map((bar) => (
          <div
            key={bar.id}
            data-flip-id={bar.id}
            className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(bar.id)}`}
            style={{ height: `${Math.max(Math.abs(bar.value) * 4, 30)}px` }}
          >
            {bar.value}
          </div>
        ))}
      </div>
    </SharedLayout>
  );
};

export default SearchPage;
