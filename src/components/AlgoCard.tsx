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
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden w-[380px]"
    >
      <img
        src={algoImg}
        alt={algoName}
        className="w-full h-[220px] object-cover"
      />

      <div className="p-6">
        <h3 className="font-plex font-semibold text-2xl text-gray-900 drop-shadow-sm">
          {algoName}
        </h3>
        <p className="mt-2 text-gray-600 text-base leading-relaxed">
          {algoDesc}
        </p>
      </div>
    </div>
  );
};

export default AlgoCard;
