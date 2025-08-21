// import './App.css'
import { algos } from "@/App.js";
import AlgoCard from "@/components/AlgoCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import logo from "../assets/algo-ameba.png";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/all";
import { ModeToggle } from "@/components/mode-toggle.tsx";

const Homepage = () => {
  useGSAP(() => {
    const textSplit = SplitText.create("#banner h1", {
      type: "chars, words",
    });

    textSplit.chars.forEach((char) => char.classList.add("gradient-gsap-logo"));

    gsap.from(textSplit.chars, {
      yPercent: 100,
      duration: 1.8,
      ease: "expo.out",
      stagger: 0.06,
    });
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}
      <div className="flex w-full h-20 justify-between items-center px-4 bg-white shadow">
        <img src={logo} className="w-[120px] h-[80px]" alt="logo" />
        <Input name="search" className="flex h-12 w-[900px] rounded-[40px]" />
        <ModeToggle />

        <Avatar>
          <AvatarImage
            src="https://github.com/shadcn.png"
            alt="@shadcn"
            className="w-[70px] h-[70px] rounded-full"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>

      {/* Hero Section */}
      <section id="hero" className="bg-white border-y border-black py-12">
        <div className="px-12 flex items-center justify-start gap-12">
          <div className="flex flex-col items-start">
            <h1 className="text-8xl font-bold font-plex drop-shadow-md">
              Algo
            </h1>
            <h1 className="text-8xl font-bold font-plex drop-shadow-md">
              Ameba
            </h1>
          </div>

          <p className="text-2xl text-gray-700 font-plex max-w-xl mt-20">
            Vizualize Any Algorithm with{" "}
            <span className="font-semibold">Fluid Animations</span>
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="bg-[#f1f9f1] py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
            {algos.map((algo) => (
              <AlgoCard
                key={algo.algoName}
                algoImg={algo.algoImg}
                algoName={algo.algoName}
                algoRoute={algo.algoRoute}
                algoDesc={algo.algoDesc}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
