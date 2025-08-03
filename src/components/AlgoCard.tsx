import { useNavigate } from "react-router-dom";

export interface AlgoProps {
    algoName: string;
    algoImg: string;
    algoDesc: string;
    algoRoute: string;
}

const AlgoCard = ({ algoImg, algoName, algoDesc, algoRoute }: AlgoProps) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(algoRoute)}
            className="border-2 border-gray-300 rounded-md cursor-pointer hover:shadow-lg transition-all duration-200 w-[400px]"
        >
            <img src={algoImg} alt={algoName} className="w-[400px] h-[225px] object-cover" />

            <div className="p-4 bg-white">
                <h3 className="font-bold text-black text-lg">{algoName}</h3>
                <p className="text-gray-600 text-sm mt-1">{algoDesc}</p>
            </div>
        </div>
    );
};

export default AlgoCard;
