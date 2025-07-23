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

type NavbarProps = {
  inputValue: string;
  setInputValue: (val: string) => void;
  handleInsert: () => void;
  selectedAlgo: string;
  setSelectedAlgo: (val: string) => void;
};

const Navbar = ({
  inputValue,
  setInputValue,
  handleInsert,
  selectedAlgo,
  setSelectedAlgo,
}: NavbarProps) => {
  return (
    <nav className="flex w-full flex-row justify-between p-3">
      <div className="flex items-center gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="max-w-[400px]"
          placeholder="Enter number"
        />
        <button
          onClick={handleInsert}
          className="bg-green-300 px-4 py-1 rounded-sm"
        >
          Insert
        </button>
      </div>

      <Select value={selectedAlgo} onValueChange={setSelectedAlgo}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Sorting" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Choose Sorting algo</SelectLabel>
            <SelectItem value="Bubble Sort">Bubble Sort</SelectItem>
            <SelectItem value="Insertion Sort">Insertion Sort</SelectItem>
            <SelectItem value="Selection Sort">Selection Sort</SelectItem>
            <SelectItem value="Quick Sort">Quick Sort</SelectItem>
            <SelectItem value="Merge Sort">Merge Sort</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </nav>
  );
};

export default Navbar;
