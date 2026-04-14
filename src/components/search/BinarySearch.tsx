import SharedLayout, { type BarState } from "@/components/visualizer/SharedLayout";
import {useSearchVizulizer} from "@/hooks/useSearchVizulizer";
import { ROUTES } from "@/constants/routes";



const BinarySearch = () => {
   

  const {
    bars, setBars,
    setBarStates,
    inputValue, setInputValue,
    searchValue, setSearchValue,
    isPlaying, setIsPlaying,
    timelineRef, labelsRef,
    resetAnimation,
    handleInsert, generateRandomArray,
    playSteps, pauseSteps, nextStep, prevStep,
    getBarColor,

  } = useSearchVizulizer();

  const handleSearch = () => {
    const target = parseInt(searchValue.trim(), 10);
    if (isNaN(target) || target > 50 || target < -50 || bars.length === 0) {
      //Toaster
      return;
    }

    resetAnimation();

    const sortedBars = [...bars].sort((a, b) => a.value - b.value);
    setBars(sortedBars);

    const timeline = timelineRef.current;
    const labels: string[] = ["start"];

    timeline.addLabel("start");

    let low = 0;
    let high = sortedBars.length - 1;
    let step = 0;
    let foundBarId: string | undefined;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const label = `step-${step}`;
      const activeIds = sortedBars.slice(low, high + 1).map((bar) => bar.id);
      const midId = sortedBars[mid].id;

      labels.push(label);
      timeline.addLabel(label);

      timeline.call(() => {
        const nextStates: Record<string, BarState> = {};
        activeIds.forEach((id) => {
          nextStates[id] = "checking";
        });
        nextStates[midId] = "checking";
        setBarStates(nextStates);
      }, undefined, label);

      timeline.to({}, { duration: 0.5 }, label);

      if (sortedBars[mid].value === target) {
        foundBarId = midId;
        break;
      }

      if (sortedBars[mid].value < target) {
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

  
  const algoMap = [
    { name: "Linear Search", value: ROUTES.search },
    { name: "Binary Search", value: ROUTES.binarySearch },
  ];

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
      algoMap={algoMap}
      onPlay={playSteps}
      onPause={pauseSteps}
      onNext={nextStep}
      onPrev={prevStep}
    >
     
      <div className="flex gap-2 justify-center items-end p-4 min-h-[200px] bar-container">
        {bars.map((bar) => (
          <div key={bar.id}>
          <div
            id={`bar-${bar.id}`}
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
