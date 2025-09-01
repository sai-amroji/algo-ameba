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
  handleSize:()=>void;
  generateRandomArray: () => void;
  size:number;
  setSize:() => void;
  algoMap: Algo[];
  children: ReactNode;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const SharedLayout = ({
  inputValue,
  setInputValue,
  searchValue,
  setSearchValue,
  handleInsert,
  size,
  setSize,
  handleSize,
  handleSearch,
  generateRandomArray,
  algoMap,
  children,
  isPlaying,
  onPlay,
  onPause,
  onNext,
  onPrev,
}: SharedLayoutProps) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full min-h-screen dark:bg-[#151515]">
      <div className="flex flex-wrap justify-between items-center gap-4 px-6 py-4">
        {/* Input Insert */}
        <div className={"flex items-center gap-2"}>
          <div className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="max-w-[150px] text-white border-white"
              placeholder="Insert number"
            />
            <button
              onClick={handleInsert}
              className="bg-green-500 text-white px-3 py-2 rounded border-0"
            >
              Insert
            </button>
          </div>


          <div className="flex items-center gap-2">
            <Input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="max-w-[150px] text-white"
                placeholder="Search value"
            />
            <button
                onClick={handleSize}
                className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              Enter Size
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="max-w-[150px] text-white"
              placeholder="Search value"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              Search
            </button>
          </div>



          {/* Random Button */}
          <button
            onClick={generateRandomArray}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Generate Random
          </button>

          {/* Search */}
        </div>


        {/* Algorithm Dropdown */}
        <Select onValueChange={(value) => {  navigate(`/${value}`);}}>
          <SelectTrigger className="w-[180px] text-white dark:bg-black">
            <SelectValue placeholder="Select Algorithm" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Search Algorithms</SelectLabel>
              {algoMap.map((algo) => (
                <SelectItem
                  key={algo.value}
                  value={algo.value}
                  onClick={() => navigate(`/${algo.value}`)}
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
      />
    </div>
  );
};

export default SharedLayout;
