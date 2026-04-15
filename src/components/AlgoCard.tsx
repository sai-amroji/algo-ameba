import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface AlgoProps {
  algoName: string;
  algoImg: string;
  algoRoute: string;
  algoDesc?: string;
}

const AlgoCard = ({ algoImg, algoName, algoRoute }: AlgoProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useGSAP(() => {
    if (!cardRef.current) return;

    gsap.from(cardRef.current, {
      opacity: 0,
      y: 60,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse",
      },
    });
  }, { scope: cardRef });

  return (
    <div
      ref={cardRef}
      onClick={() => navigate(algoRoute)}
      className="algo-card group z-10"
    >
      <img
        src={algoImg}
        alt={algoName}
        className="w-full h-[260px] object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
      />

      <div className="pt-4 pb-6 mb-4 pl-2 pr-5">
        <h3 className="font-plex justify-start font-semibold font-mono text-[16px] text-foreground drop-shadow-sm">
          {algoName}
        </h3>
      </div>
    </div>
  );
};

export default AlgoCard;
