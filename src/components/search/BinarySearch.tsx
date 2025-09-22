import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";
import SharedLayout, {type BarState} from "@/components/search/SharedLayout";
import {useSearchVizulizer} from "@/hooks/useSearchVizulizer";



const BinarySearch = () => {
   

  const {

    bars, setBars,
    barStates, setBarStates,
    inputValue, setInputValue,
    searchValue, setSearchValue,
    isPlaying, setIsPlaying,
    timelineRef, labelsRef,
    resetAnimation,
    handleInsert, generateRandomArray,
    playSteps, pauseSteps, nextStep, prevStep,

  } = useSearchVizulizer();




  const binarySteps = (low: number, high: number, target: number) => {
    if (low > high) return;

    const mid = Math.floor((low + high) / 2);
    const midVal = bars[mid].value;
    const tl = gsap.timeline();

    
    tl.to(".bar", { backgroundColor: "blue", duration: 0.2 });
    tl.to(
      `#bar-${bars[low].id}`,
      { backgroundColor: "yellow", duration: 0.3 },
      "+=0.2"
    );
    tl.to(
      `#bar-${bars[high].id}`,
      { backgroundColor: "purple", duration: 0.3 },
      "<"
    );

    // Step 3: Pause so user can see range
    tl.to({}, { duration: 0.5 });

    // Step 4: Highlight mid bar
    tl.to(`#bar-${bars[mid].id}`, { backgroundColor: "red", duration: 0.3 });

    // Step 5: Pause so user can see mid
    tl.to({}, { duration: 0.5 });

    // Step 6: Decide & animate
    tl.call(() => {
      if (midVal === target) {
        gsap.to(`#bar-${bars[mid].id}`, {
          backgroundColor: "green",
          duration: 0.3,
        });
      } else if (midVal < target) {
        // Move out left side
        bars.forEach((bar, i) => {
          if (i < mid + 1) {
            gsap.to(`#bar-${bar.id}`, { x: -150, opacity: 0, duration: 0.7 });
          }
        });
        setTimeout(() => binarySteps(mid + 1, high, target), 600);
      } else {
        // Move out right side
        bars.forEach((bar, i) => {
          if (i > mid - 1) {
            gsap.to(`#bar-${bar.id}`, { x: 150, opacity: 0, duration: 0.7 });
          }
        });
        setTimeout(() => binarySteps(low, mid - 1, target), 600);
      }
    });
  };

  const handleSearch = () => {
    const target = parseInt(searchValue.trim());
    if (isNaN(target) || target > 50 || target < -50) {
      //Toaster
      return;
    }

    resetAnimation();

    const timeline = timelineRef.current;
    const labels: string[] = [];
    let found = false;

    timeline.addLabel("start");
    labels.push("start");

    const left = 0;
    const right = bars.length - 1;


    binarySteps(left, right, target);
  };

  
  const algoMap = [{ name: "Linear Search", value: "linear" }];

  const getBarColor = (id: string) => {
    switch (barStates[id]) {
      case "checking":
        return "bg-red-500";
      case "found":
        return "bg-green-500";
      default:
        return "bg-blue-500";
    }
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
      generateRandomArray={generateRandomArray}
      algoMap={algoMap}
      onPlay={playSteps}
      onPause={pauseSteps}
      onNext={nextStep}
      onPrev={prevStep}
    >
     
      <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
        {bars.map((bar) => (
          <div>



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

          <p>
            {bar.value}
          </p>

          </div>
        ))}
      </div>
      
    </SharedLayout>
  );
};

export default BinarySearch;
