
import SharedLayout, {type BarState} from "@/components/search/SharedLayout";
import {useSearchVizulizer} from "@/hooks/useSearchVizulizer";



const SearchVisualizer = () => {
    


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
    getBarColor,
      
    } = useSearchVizulizer();


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

        for (let i = 0; i < bars.length; i++) {
            const barId = bars[i].id;
            const label = `step-${i}`;
            labels.push(label);

            // Add a label for this step
            timeline.addLabel(label);

            // Animate the bar to "checking" color by updating React state
            timeline.call(() => {
                setBarStates(prev => ({
                    ...prev,
                    [barId]: "checking",
                }));
            }, null, label);

            // Wait a moment
            timeline.to({}, { duration: 0.5 }, label);

            if (bars[i].value === target) {
                found = true;
                const foundLabel = `found-${i}`;
                labels.push(foundLabel);

                timeline.addLabel(foundLabel);

                // Animate bar to "found" color
                timeline.call(() => {
                    setBarStates(prev => ({
                        ...prev,
                        [barId]: "found",
                    }));
                }, null, foundLabel);

                break;
            }
        }

        // If not found, add a final tween to reset all bars to default
        if (!found) {
            const endLabel = "not-found";
            labels.push(endLabel);
            timeline.addLabel(endLabel);

            timeline.call(() => {
                setBarStates({});
            }, null, endLabel);
        } else {
            const endLabel = `end`;
            labels.push(endLabel);
            timeline.addLabel(endLabel);

            timeline.call(() => {
                const foundBarId = bars.find(b => b.value === target)?.id;
                const newStates: Record<number, BarState> = {};
                if (foundBarId) {
                    newStates[foundBarId] = "found";
                }
                setBarStates(newStates);
            }, null, endLabel);
        }

        labelsRef.current = labels;
        timeline.play();
        setIsPlaying(true);
    };


    const algoMap = [{ name: "Linear Search", value: "linear" } ,
        {name:"Binary Search",value: "binary"}];

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
                    <div
                        key={bar.id}
                        data-flip-id={bar.id}
                        className={`bar w-10 rounded-sm text-white text-center transition-colors duration-300 ${getBarColor(bar.id)}`}
                        style={{ height: `${Math.max(bar.value * 4, 30)}px` }}
                    >
                        {bar.value}
                    </div>
                ))}
            </div>
        </SharedLayout>
    );
};

export default SearchVisualizer;