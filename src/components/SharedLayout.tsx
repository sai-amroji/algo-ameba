import { Input } from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";
import { type ReactNode } from "react";
import ControllerFooter from "@/components/ControllerFooter.tsx";
import {Toaster} from "sonner";

interface Algo {
    name: string;
    value: string;
}

interface SharedLayoutProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    searchValue?: string;
    setSearchValue?: (val: string) => void;
    handleInsert: () => void;
    handleSearch?: () => void;
    generateRandomArray: () => void;
    algoMap: Algo[];
    children: ReactNode;
    isPlaying:boolean;
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
                          handleSearch,
                          generateRandomArray,
                          algoMap,
                          children,
                        isPlaying,
                          onPlay,
                          onPause,
                          onNext,
                          onPrev
                      }: SharedLayoutProps) => {
    return (
        <div className="flex flex-col w-full min-h-screen">

            <div className="flex flex-wrap justify-between items-center gap-4 px-6 py-4">
                {/* Input Insert */}
                <div className={"flex items-center gap-2"}>
                <div className="flex items-center gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="max-w-[150px]"
                        placeholder="Insert number"
                    />
                    <button onClick={handleInsert} className="bg-green-500 text-white px-3 py-2 rounded">
                        Insert
                    </button>
                </div>

                    <div className="flex items-center gap-2">
                        <Input
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="max-w-[150px]"
                            placeholder="Search value"
                        />
                        <button onClick={handleSearch} className="bg-blue-500 text-white px-3 py-2 rounded">
                            Search
                        </button>
                    </div>


                {/* Random Button */}
                <button onClick={generateRandomArray} className="bg-purple-500 text-white px-4 py-2 rounded">
                    Generate Random
                </button>

                {/* Search */}


            </div>

                {/* Algorithm Dropdown */}
                <Select onValueChange={() => {}}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select Algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Search Algorithms</SelectLabel>
                            {algoMap.map((algo) => (
                                <SelectItem key={algo.value} value={algo.value}>
                                    {algo.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            {/* Visualization Area */}
            <div className="flex-1 flex justify-center items-center">{children}</div>
            <Toaster className={"bg-red-700" } position={"top-center"}/>


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
