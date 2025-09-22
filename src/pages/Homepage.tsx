
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
      <div className="flex w-full h-20 justify-between items-center px-4  shadow">
        <img src={logo} className="w-[120px] h-[80px]" alt="logo" />
        <Input name="search" className="flex h-12 w-[900px] rounded-[40px] shadow-[9px] shadow-inner-xl backdrop-blur-[5px]" />
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
      <section id="hero" className="bg-background  py-12">
        <div className="px-12 flex items-center font-[audiowide] text-accent-foreground ml-1.5 justify-start gap-12">
          <div className="flex flex-col items-start ">
            <h1 className="text-8xl font-bold font-[audiowide]">
              Algo
            </h1>
            <h1 className="text-8xl font-bold font-plex drop-shadow-md">
              Ameba
            </h1>
          </div>

          <p className="text-2xl text-accent-foreground font-plex max-w-xl mt-20">
            Vizualize Any Algorithm with{" "}
            <span className="font-semibold">Fluid Animations</span>
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className=" py-16">
        <div className="">
          <div className="grid grid-cols-3  gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3  place-items-center">
            {algos.map((algo) => (
              <AlgoCard
                key={algo.algoName}
                algoImg={algo.algoImg}
                algoName={algo.algoName}
                algoRoute={algo.algoRoute}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;
