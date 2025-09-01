import { useNavigate } from "react-router-dom";

export interface AlgoProps {
  algoName: string;
  algoImg: string;
  algoRoute: string;
}

const AlgoCard = ({ algoImg, algoName,algoRoute }: AlgoProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(algoRoute)}
      className="bg-white
           rounded-2xl
          px-5 pt-5 w-[397] h-[302]
          transition-all
          duration-300'
          z-10
          shadow-[8px_8px_8px_rgb(0,0,0,0.45)]
          hover:scale-75
           cursor-pointer o
           verflow-hidden backdrop-blur-[15px] w-[380px]"
    >
      <img
        src={algoImg}
        alt={algoName}
        className="w-full h-[220px] object-cover rounded-xl"
      />

      <div className="pt-3 pb-6 mb-4 pl-2 pr-5">
        <h3 className="font-plex justify-start  font-semibold font-mono text-[16px]  text-gray-900 drop-shadow-sm">
          {algoName}
        </h3>

      </div>
    </div>
  );
};

export default AlgoCard;
