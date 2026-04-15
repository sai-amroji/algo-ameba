import { Input } from "@/components/ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { type ReactNode } from "react";
import ControllerFooter from "@/components/ControllerFooter.tsx";
import { Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

interface Algo {
  name: string;
  value: string;
}

// We will use this to track the state for visual rendering
//
export type BarState = "default" | "checking" | "found";



interface SharedLayoutProps {
  inputValue: string;
  setInputValue: (val: string) => void;
  searchValue?: string;
  setSearchValue?: (val: string) => void;
  handleInsert: () => void;
  handleSearch?: () => void;
  actionLabel?: string;
  generateRandomArray: () => void;
  algoMap: Algo[];
  children: ReactNode;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  selectedAlgorithm?: string;
  onAlgorithmChange?: (value: string) => void;
  speed?: number;
  onSpeedChange?: (value: number) => void;
  onSpeedIncrease?: () => void;
  onSpeedDecrease?: () => void;
}

const SharedLayout = ({
  inputValue,
  setInputValue,
  searchValue,
  setSearchValue,
  handleInsert,
  handleSearch,
  actionLabel,
  generateRandomArray,
  algoMap,
  children,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
  selectedAlgorithm,
  onAlgorithmChange,
  speed,
  onSpeedChange,
  onSpeedIncrease,
  onSpeedDecrease,
}: SharedLayoutProps) => {
  const navigate = useNavigate();
  return (
    <div className="page-shell page-enter flex flex-col w-full">
      <div className="page-nav flex flex-wrap justify-between items-center gap-4 px-6 py-4">
        {/* Input Insert */}
        <div className={"flex items-center gap-2"}>
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="app-input max-w-[150px]"
              placeholder="Insert number"
            />
            <button
              onClick={handleInsert}
              className="action-btn action-btn--insert"
            >
              Insert
            </button>
          </div>

          {typeof searchValue === "string" && setSearchValue && handleSearch && (
            <div className="flex items-center gap-2">
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="app-input max-w-[150px]"
                placeholder="Search value"
              />
              <button
                onClick={handleSearch}
                className="action-btn action-btn--search"
              >
                {actionLabel ?? "Search"}
              </button>
            </div>
          )}

          {handleSearch && !(typeof searchValue === "string" && setSearchValue) && (
            <button
              onClick={handleSearch}
              className="action-btn action-btn--search"
            >
              {actionLabel ?? "Sort"}
            </button>
          )}



          {/* Random Button */}
          <button
            onClick={generateRandomArray}
            className="action-btn action-btn--random"
          >
            Generate Random
          </button>

          {/* Search */}
        </div>


        {/* Algorithm Dropdown */}
        <Select
          value={selectedAlgorithm}
          onValueChange={(value) => {
            if (onAlgorithmChange) {
              onAlgorithmChange(value);
              return;
            }

            const nextPath = value.startsWith("/") ? value : `/${value}`;
            navigate(nextPath, { replace: true });
          }}
        >
          <SelectTrigger className="w-[180px] bg-card/80 text-foreground">
            <SelectValue placeholder={algoMap[0].name} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Algorithms</SelectLabel>
              {algoMap.map((algo) => (
                <SelectItem
                  key={algo.value}
                  value={algo.value}
                >
                  {algo.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Visualization Area */}
      <div className="flex-1 flex justify-center items-center">{children}</div>
      <Toaster className={"bg-red-700"} position={"top-center"} />

      {/* Controls */}
      <ControllerFooter
        isPlaying={isPlaying}
        onPlay={onPlay}
        onPause={onPause}
        onNext={onNext}
        onPrev={onPrev}
        speed={speed}
        onSpeedChange={onSpeedChange}
        onSpeedIncrease={onSpeedIncrease}
        onSpeedDecrease={onSpeedDecrease}
      />
    </div>
  );
};

export default SharedLayout;
