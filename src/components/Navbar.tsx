import {Input} from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select.tsx";


const Navbar = () => {


    return (
        <nav className="flex w-full green-200 flex-row justify-between p-3 bg-green-300" >


            <div className={"flex justify-between align-items content-between"}>

                <Input className="max-w-[400px]"/>
                <button className={"bg-green-300 rounded-sm justify-stretch"}>
                    Insert
                </button>


            </div>





            <Select>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Sorting" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Choose Sorting algo</SelectLabel>
                        <SelectItem value="Bubble Sort">Bubble Sort</SelectItem>
                        <SelectItem value="Inseration Sort">Inseration Sort</SelectItem>
                        <SelectItem value="Selectiom Sort">Selection Sort</SelectItem>
                        <SelectItem value="Quick Sort">Quick Sort</SelectItem>
                        <SelectItem value="Merge Sort">Merge Sort</SelectItem>

                    </SelectGroup>
                </SelectContent>
            </Select>


        </nav>
    )
}

export default Navbar;
