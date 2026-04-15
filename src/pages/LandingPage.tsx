import { GithubIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { ROUTES } from "@/constants/routes";
import InfoCard from "@/components/InfoCard";
import { ScrambleTextPlugin } from "gsap/all";

gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrambleTextPlugin);

const cardText =
  "Smooth, buttery animations powered by GSAP — watch algorithms come alive with fluid, responsive transitions.";

const CARDS = [
  { id: "left-1", title: "Modern and\nFluid Animations", side: "left" },
  { id: "left-2", title: "Easy and\nFast Animations", side: "left" },
  { id: "right-1", title: "Simple and\nComplex Algorithms", side: "right" },
] as const;

const LandingPage = () => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const buttonBgRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // ── 1. Title SplitText — entrance ─────────────────────────────────
    if (titleRef.current) {
      const split = SplitText.create(titleRef.current, { type: "chars, words" });

      gsap.from(split.chars, {
        opacity: 0,
        y: 80,
        rotation: "random(-60,60)",
        ease: "back.out(1.7)",
        duration: 0.9,
        stagger: 0.05,
      });

      
gsap.to("#subtitle", {
  duration: 2, 
  scrambleText: {
    text: "Visualize algorithms with buttery‑smooth GSAP animations. Learn by watching them breathe.", 
    chars: "Watch beutiful animations powered by GSAP", 
    revealDelay: 0.7, 
    speed: 0.3, 
  
  }
});



      // Hover: neon green glow + subtle float per char
      // Text stays its original colour — no transparency, no harsh stroke
      const hoverIn = () =>
        gsap.to(split.chars, {
          textShadow: "0 0 20px #00ff08, 0 0 45px #00ff0866",
          y: -6,
          duration: 0.3,
          ease: "power2.out",
          stagger: { each: 0.04, from: "start" },
        });

      const hoverOut = () =>
        gsap.to(split.chars, {
          textShadow: "none",
          y: 0,
          duration: 0.25,
          ease: "power2.in",
          stagger: { each: 0.03, from: "end" },
        });

      titleRef.current.addEventListener("mouseenter", hoverIn);
      titleRef.current.addEventListener("mouseleave", hoverOut);

      return () => {
        titleRef.current?.removeEventListener("mouseenter", hoverIn);
        titleRef.current?.removeEventListener("mouseleave", hoverOut);
        split.revert();
      };
    }
  });

  useGSAP(() => {
    // ── 2. Button entrance ────────────────────────────────────────────
    if (buttonRef.current && buttonBgRef.current) {
      gsap
        .timeline({ delay: 0.9 })
        .from(buttonRef.current, { y: 30, opacity: 0, duration: 0.7, ease: "power2.out" })
        .from(buttonBgRef.current, { x: "-100%", duration: 0.7, ease: "power2.inOut" }, "-=0.4");
    }

  });

  return (
    <div className="page-shell page-enter w-full flex flex-col">

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col section-fade">

        {/* Nav */}
        <nav className="page-nav flex w-full justify-end items-center gap-8 px-6 py-4
            text-primary font-[audiowide] text-2xl">
          {/* ModeToggle — green-icon-btn has rounded-xl ✓ */}
          <div className="green-icon-btn p-1">
            <ModeToggle />
          </div>
          <p className="nav-link" onClick={() => navigate(ROUTES.home)}>Home</p>
          <p className="nav-link" onClick={() => navigate(ROUTES.algorithms)}>Algorithms</p>
          <p className="nav-link" onClick={() => navigate(ROUTES.about)}>About Us</p>
        </nav>

        {/* Hero body — centred in remaining height */}
        <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 text-center">
          <h1
            ref={titleRef}
            className="font-bold font-[audiowide] leading-tight cursor-default
                       text-[clamp(48px,10vw,140px)]
                       text-foreground drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]"
          >
            Algo Ameba
          </h1>

          <p id="subtitle" className="text-xl text-muted-foreground font-[arima] max-w-xl">
            Visualize algorithms with buttery‑smooth GSAP animations.
            Learn by watching them breathe.
          </p>

          {/* Get Started button — green border always visible, glow on hover */}
          <div
            ref={buttonRef}
            className="action-btn action-btn--primary relative flex justify-center items-center
                       font-[arima] text-xl w-52 h-14 overflow-hidden"
            onClick={() => navigate(ROUTES.home)}
            aria-label="Get Started"
          >
            <div ref={buttonBgRef} className="absolute inset-0 bg-[#007f04] z-10" />
            <span className="relative z-20 text-white font-semibold tracking-wide">
              Get Started
            </span>
          </div>

          <span className="text-muted-foreground text-sm animate-bounce select-none">
            ↓ scroll
          </span>
        </div>
      </section>

      {/* ─── CARDS SECTION ────────────────────────────────────────────── */}
      <section className="section-fade min-h-screen flex flex-col items-center justify-around py-24 md:py-32 px-8 gap-16 md:gap-24">
        <h2 className="text-[clamp(40px,7vw,80px)] font-[audiowide] text-foreground text-center">
          What you get
        </h2>

        <div className="flex flex-row justify-around items-stretch gap-12 md:gap-18 flex-wrap w-full max-w-7xl">

          {/* Left column — 2 cards stacked */}
          <div className="flex flex-col gap-16 justify-between md:gap-20">
            {CARDS.filter((c) => c.id.startsWith("left")).map((card) => (
              <InfoCard
                key={card.id}
                title={card.title}
                description={cardText}
                side={card.side}
            
              />
            ))}
          </div>

          {/* Green divider */}
          <div className="w-[5px] h-[1000px] rounded-lg bg-[#00ff08] self-stretch hidden md:block opacity-40" />

          {/* Right column — 1 card centred */}
          <div className="flex items-center">
            {CARDS.filter((c) => c.id.startsWith("right")).map((card) => (
              <InfoCard
                key={card.id}
                title={card.title}
                description={cardText}
                side={card.side}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="section-fade py-14">
        <div className="flex justify-around items-center flex-wrap gap-8">

          {/* GitHub */}
          <div className="flex flex-col items-center gap-3">
            <span className="green-icon-btn w-12 h-12 flex items-center justify-center text-foreground">
              <GithubIcon />
            </span>
            <span className="nav-link text-sm font-semibold font-[arima]">
              Contribute Here
            </span>
          </div>

          {/* Contributors — avatar group wrapped in green-icon-btn */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="green-icon-btn flex -space-x-2 rounded-full p-1
                          *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background
                          *:data-[slot=avatar]:grayscale"
            >
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://github.com/leerob.png" alt="@leerob" />
                <AvatarFallback>LR</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarImage src="https://github.com/evilrabbit.png" alt="@evilrabbit" />
                <AvatarFallback>ER</AvatarFallback>
              </Avatar>
            </div>
            <span className="nav-link text-sm font-semibold font-[arima]">
              Contributors
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
