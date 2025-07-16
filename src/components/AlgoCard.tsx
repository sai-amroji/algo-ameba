import bubblesort from "@/assets/sorting.png";


export interface  AlgoProps{
    algoName:string
    algoImg:string
    algoDesc:string

}

const AlgoCard = ({algoImg,algoName,algoDesc}:AlgoProps) => {

    return (
        <div className={"border-2 border-amber-100 max-w-[350px]"}>
          <img src={algoImg}/>
       <h3 className={"font-bold text-black"}>{algoName}</h3>
           <p>{algoDesc} </p>
    </div>
    )
}


export default AlgoCard;