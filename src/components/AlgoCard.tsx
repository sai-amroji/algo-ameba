import bubblesort from "@/assets/sorting.png";
import {useNavigate} from "react-router-dom"

export interface  AlgoProps{
    algoName:string
    algoImg:string
    algoDesc:string

}

const AlgoCard = ({algoImg,algoName,algoDesc}:AlgoProps) => {



    const navigate = useNavigate();

    return (
     <div className={"border-2 border-amber-100 w-[400px] "} onClick={() =>
        navigate(
            "/algo"
        )
     }>
        <div>
                <img src={algoImg} className="w-[400px] h-[225px]"/>
        </div>
        <div className="py-2">
            <h3 className={"font-bold text-black"}>{algoName}</h3>
             <p>{algoDesc} </p>
        </div>
    </div>
    )
}


export default AlgoCard;