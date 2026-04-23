import { algos } from "@/constants/algosInfo";
import AlgoCard from "@/components/AlgoCard.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { useNavigate } from "react-router-dom";
import logo from "../assets/algo-ameba.png";
import { ROUTES } from "@/constants/routes";

const Homepage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-shell page-enter">
      {/* Navbar */}
      <div className="page-nav fixed top-0 w-full h-16 flex justify-between items-center px-6 py-2 z-50">
        <div className="flex items-center gap-6">
          <img
            src={logo}
            className="h-12 cursor-pointer transition-transform duration-300 hover:scale-105"
            alt="logo"
          />
          <Input
            name="search"
            className="app-input h-10 w-[min(60vw,900px)]"
          />
        </div>
        <div className="flex items-center gap-6 font-[audiowide] text-lg">
          <p className="nav-link cursor-pointer" onClick={() => navigate(ROUTES.home)}>Home</p>
          <p className="nav-link cursor-pointer" onClick={() => navigate(ROUTES.algorithms)}>Algorithms</p>
          <p className="nav-link cursor-pointer" onClick={() => navigate(ROUTES.about)}>About</p>
          <div className="green-icon-btn">
            <ModeToggle />
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="hero" className="section-fade pt-32 pb-16 px-8 md:px-12">
        <div className="flex items-center font-[audiowide] text-accent-foreground justify-start gap-12">
          <div className="flex flex-col items-start">
            <h1 className="text-6xl md:text-8xl font-bold font-[audiowide]">Algo</h1>
            <h1 className="text-6xl md:text-8xl font-bold font-plex drop-shadow-md">Ameba</h1>
          </div>

          <p className="text-xl md:text-2xl text-accent-foreground font-plex max-w-xl mt-10 md:mt-20">
            Vizualize Any Algorithm with <span className="font-semibold">Fluid Animations</span>
          </p>
        </div>
      </section>

      {/* Cards Section */}
      <section className="section-fade py-16">
        <div className="grid grid-cols-3 gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center">
          {algos.map((algo) => (
            <AlgoCard
              key={algo.algoName}
              algoImg={algo.algoImg}
              algoName={algo.algoName}
              algoRoute={algo.algoRoute}
            />
          ))}
        </div>
      </section>
      <section className="section-fade py-16 flex flex-col items-center gap-6">
      </section>
    </div>
  );
};

export default Homepage;

