import { GithubIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { ROUTES } from "@/constants/routes";

gsap.registerPlugin(SplitText, ScrollTrigger);

const cardText =
  "Smooth, buttery animations powered by GSAP — watch algorithms come alive with fluid, responsive transitions.";

const CARDS = [
  { id: "left-1", title: ["Modern and", "Fluid Animations"] },
  { id: "left-2", title: ["Easy and", "Fast Animations"] },
  { id: "right-1", title: ["Simple and", "Complex Algorithms"] },
] as const;

const LandingPage = () => {
  const navigate = useNavigate();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const buttonBgRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<Record<string, HTMLDivElement | null>>({});

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

    // ── 3. Cards — ScrollTrigger slide-in + description shimmer ───────
    const descSplits = new Map<string, ReturnType<typeof SplitText.create>>();

    // Pre-split all descriptions once (so hover is instant)
    Object.entries(cardsRef.current).forEach(([id, card]) => {
      if (!card) return;
      const descEl = card.querySelector<HTMLElement>(".card-desc");
      if (descEl) descSplits.set(id, SplitText.create(descEl, { type: "words" }));
    });

    const cards = Object.values(cardsRef.current).filter(
      (card): card is HTMLDivElement => Boolean(card)
    );

    cards.forEach((card, index) => {
      // Use card dimensions for offset so animation scales with new spacing and card size.
      const yOffset = Math.min(card.offsetHeight * 0.22, 96);
      const xOffset = index % 2 === 0 ? -56 : 56;

      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: "top 82%",
          end: "bottom 58%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
        opacity: 0,
        x: xOffset,
        y: yOffset,
        duration: 0.85,
        ease: "power3.out",
      });

      // Description word shimmer on card hover
      const ds = descSplits.get(card.dataset.cardId ?? "");
      if (ds) {
        card.addEventListener("mouseenter", () => {
          gsap.fromTo(
            ds.words,
            { opacity: 0.4, y: 7 },
            { opacity: 1, y: 0, stagger: 0.025, duration: 0.4, ease: "power2.out" }
          );
        });
      }
    });

    return () => {
      descSplits.forEach((split) => split.revert());
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  });

  return (
    <div className="w-full flex flex-col bg-background text-foreground ">

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col">

        {/* Nav */}
        <nav className="flex w-full justify-end items-center gap-8 px-6 py-4
                        text-primary backdrop-blur-2xl font-[audiowide] text-2xl">
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

          <p className="text-xl text-muted-foreground font-[arima] max-w-xl">
            Visualize algorithms with buttery‑smooth GSAP animations.
            Learn by watching them breathe.
          </p>

          {/* Get Started button — green border always visible, glow on hover */}
          <div
            ref={buttonRef}
            className="relative flex justify-center items-center font-[arima] text-xl
                       rounded-full w-52 h-14 overflow-hidden cursor-pointer
                       border-2 border-[#00ff08]
                       hover:scale-105 hover:shadow-[0_0_28px_#00ff08aa]
                       transition-all duration-300"
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
      <section className="min-h-screen flex flex-col items-center justify-center py-24 md:py-32 px-8 gap-14 md:gap-20">
        <h2 className="text-[clamp(40px,7vw,80px)] font-[audiowide] text-foreground text-center">
          What you get
        </h2>

        <div className="flex flex-row justify-center items-stretch gap-10 md:gap-16 flex-wrap w-full max-w-7xl">

          {/* Left column — 2 cards stacked */}
          <div className="flex flex-col gap-10 md:gap-14">
            {CARDS.filter((c) => c.id.startsWith("left")).map((card) => (
              <div
                key={card.id}
                ref={(el) => { cardsRef.current[card.id] = el; }}
                data-card-id={card.id}
                className="feature-card"
              >
                <div className="text-3xl text-primary font-[baijamjuri] mb-4">
                  {card.title.map((line, i) => (
                    <h2 key={i} className="card-heading">{line}</h2>
                  ))}
                </div>
                <p className="card-desc text-base text-muted-foreground font-[arima] leading-relaxed">
                  {cardText}
                </p>
              </div>
            ))}
          </div>

          {/* Green divider */}
          <div className="w-px bg-[#00ff08] self-stretch hidden md:block opacity-40" />

          {/* Right column — 1 card centred */}
          <div className="flex items-center">
            {CARDS.filter((c) => c.id.startsWith("right")).map((card) => (
              <div
                key={card.id}
                ref={(el) => { cardsRef.current[card.id] = el; }}
                data-card-id={card.id}
                className="feature-card"
              >
                <div className="text-3xl text-primary font-[baijamjuri] mb-4">
                  {card.title.map((line, i) => (
                    <h2 key={i} className="card-heading">{line}</h2>
                  ))}
                </div>
                <p className="card-desc text-base text-muted-foreground font-[arima] leading-relaxed">
                  {cardText}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-14">
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
