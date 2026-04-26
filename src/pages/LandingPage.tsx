import { GithubIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRef, useMemo, useState, useEffect } from "react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { ROUTES } from "@/constants/routes";
import gsap from "@/gsapSetup";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { Draggable, ScrambleTextPlugin } from "gsap/all";

gsap.registerPlugin(SplitText, ScrambleTextPlugin, useGSAP, Draggable);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const amebaRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const buttonBgRef = useRef<HTMLDivElement>(null);

  const count = 10;

  const wave1 = "M0,300 Q150,200 300,300 T600,300 T900,300 L900,600 L0,600 Z";
  const wave2 = "M0,300 Q150,400 300,300 T600,300 T900,300 L900,600 L0,600 Z";

  // FIX: positions in vh/vw so circles truly fill the full viewport
  const circles = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const size = Math.floor(Math.random() * 80) + 10;
      return {
        id: i,
        size,
        top: Math.random() * 100,   // vh
        left: Math.random() * 100,  // vw
        color: `hsl(${Math.random() * 360}, 70%, 60%)`,
        floatAmount: Math.random() * 20 + 10,
        floatDuration: Math.random() * 2 + 2,
      };
    });
  }, [count]);

  const [bars, setBars] = useState<number[]>([]);
  const [amebaMarkup, setAmebaMarkup] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/Ameba.svg", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load Ameba.svg");
        }
        return response.text();
      })
      .then((svgText) => {
        setAmebaMarkup(svgText);
      })
      .catch(() => {
        // Keep the page functional even if the decorative SVG fails to load.
        setAmebaMarkup("");
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const bars = Array.from({ length: 20 }, () => Math.floor(Math.random() * 100));
    setBars(bars);
  }, [20]);

  const { contextSafe } = useGSAP();

  const onClick = contextSafe(() => {
    gsap.to(".drag", {
      rotation: "+=360",
      color: "white",
      duration: 5,
      background: "pink",
      width: 200,
      height: 200,
      yoyo: true,
      stagger: 0.2,
      repeat: 0,
      overwrite: true,
      repeatDelay: 2,
    });
  });

  useGSAP(() => {
    gsap.set(".overlay-text", {
      position: "absolute",
      left: "50%",
      top: "50%",
      xPercent: -50,
      yPercent: -50,
      zIndex: 9999,
    });

    circles.forEach((circle) => {
      gsap.to(`.circle-${circle.id}`, {
        y: circle.floatAmount,
        duration: circle.floatDuration,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 0.5,
      });
    });
  }, { dependencies: [circles.length] });

  useGSAP(() => {
    const checkCollisions = () => {
      const circleElements = Array.from(document.querySelectorAll(".drag"));
      for (let i = 0; i < circleElements.length; i++) {
        for (let j = i + 1; j < circleElements.length; j++) {
          const el1 = circleElements[i] as HTMLElement;
          const el2 = circleElements[j] as HTMLElement;
          const rect1 = el1.getBoundingClientRect();
          const rect2 = el2.getBoundingClientRect();
          const center1 = { x: rect1.left + rect1.width / 2, y: rect1.top + rect1.height / 2, r: rect1.width / 2 };
          const center2 = { x: rect2.left + rect2.width / 2, y: rect2.top + rect2.height / 2, r: rect2.width / 2 };
          const dx = center2.x - center1.x;
          const dy = center2.y - center1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = center1.r + center2.r;
          if (distance < minDistance) {
            gsap.to(el1, { filter: "brightness(1.5)", duration: 0.2, yoyo: true, repeat: 1, overwrite: false });
            gsap.to(el2, { filter: "brightness(1.5)", duration: 0.2, yoyo: true, repeat: 1, overwrite: false });
            gsap.to([el1, el2], { scale: 1.2, duration: 0.15, yoyo: true, repeat: 1, overwrite: false });
            const bounceStrength = 20;
            const angle = Math.atan2(dy, dx);
            gsap.to(el1, { x: `+=${Math.cos(angle) * -bounceStrength}`, y: `+=${Math.sin(angle) * -bounceStrength}`, duration: 0.3, ease: "power1.out", overwrite: false });
            gsap.to(el2, { x: `+=${Math.cos(angle) * bounceStrength}`, y: `+=${Math.sin(angle) * bounceStrength}`, duration: 0.3, ease: "power1.out", overwrite: false });
          }
        }
      }
    };
    gsap.ticker.add(checkCollisions);
    return () => gsap.ticker.remove(checkCollisions);
  }, { dependencies: [circles.length] });

  useGSAP(() => {
    const titleEl = titleRef.current;
    const subtitleEl = subtitleRef.current;
    if (titleEl) {
      const split = SplitText.create(titleEl, { type: "chars, words" });
      gsap.from(split.chars, { opacity: 0, y: 80, rotation: "random(-60,60)", ease: "back.out(1.7)", duration: 0.9, stagger: 0.05 });
      if (subtitleEl) {
        gsap.to(subtitleEl, {
          duration: 1.8,
          scrambleText: {
            text: "Visualize algorithms with buttery-smooth GSAP animations. Learn by watching them breathe.",
            chars: "01",
            revealDelay: 0.5,
            speed: 0.45,
          },
        });
      }
      const hoverIn = contextSafe(() =>
        gsap.to(split.chars, { textShadow: "0 0 20px #00ff08, 0 0 45px #00ff0866", y: -6, duration: 0.3, ease: "power2.out", stagger: { each: 0.04, from: "start" } })
      );
      const hoverOut = contextSafe(() =>
        gsap.to(split.chars, { textShadow: "none", y: 0, duration: 0.25, ease: "power2.in", stagger: { each: 0.03, from: "end" } })
      );
      titleEl.addEventListener("mouseenter", hoverIn);
      titleEl.addEventListener("mouseleave", hoverOut);
      return () => {
        titleEl.removeEventListener("mouseenter", hoverIn);
        titleEl.removeEventListener("mouseleave", hoverOut);
        split.revert();
      };
    }
  }, { scope: containerRef });

  useGSAP(() => {
    if (!amebaRef.current || !amebaMarkup) {
      return;
    }

    const paths = Array.from(
      amebaRef.current.querySelectorAll<SVGPathElement>("path"),
    );

    if (paths.length === 0) {
      return;
    }

    const outerPath = paths[0];
    const eyePaths = paths.filter((pathElement) => {
      const fill = (pathElement.getAttribute("fill") || "").toUpperCase();
      return fill.startsWith("#F") || fill.startsWith("#E");
    }).slice(0, 2);
    const leadPaths = [outerPath, ...eyePaths].filter(Boolean);
    const leadSet = new Set(leadPaths);
    const restPaths = paths.filter((pathElement) => !leadSet.has(pathElement));

    paths.forEach((pathElement) => {
      const originalFill = pathElement.getAttribute("fill") || "#22c55e";
      pathElement.dataset.originalFill = originalFill;
    });

    gsap.set(paths, {
      drawSVG: "0% 0%",
      stroke: (_index, target) => (target as SVGPathElement).dataset.originalFill || "#22c55e",
      strokeWidth: 1.6,
      fill: "transparent",
      opacity: 0.9,
      strokeLinecap: "round",
      strokeLinejoin: "round",
    });

    const timeline = gsap.timeline({ defaults: { ease: "power2.out" } });

    // First draw key paths (outer shape + eyes), then rush the rest and fill.
    timeline.to(leadPaths, {
      drawSVG: "0% 100%",
      duration: 0.55,
      stagger: 0.06,
    });

    timeline.to(
      restPaths,
      {
        drawSVG: "0% 100%",
        duration: 0.5,
        stagger: { amount: 0.4, from: "start" },
      },
      "-=0.1"
    );

    timeline.to(
      paths,
      {
        fill: (_index, target) =>
          (target as SVGPathElement).dataset.originalFill || "#22c55e",
        duration: 0.18,
        stagger: { amount: 0.2, from: "start" },
        ease: "power1.out",
      },
      "-=0.02"
    );

    const hasMorphSVG = Boolean(
      (gsap as unknown as { plugins?: Record<string, unknown> }).plugins?.MorphSVGPlugin
    );

    if (hasMorphSVG && outerPath) {
      // If MorphSVG is available in the runtime, keep a subtle post-draw breathing motion.
      timeline.to(
        outerPath,
        {
          scale: 1.01,
          transformOrigin: "50% 50%",
          duration: 0.35,
          repeat: 1,
          yoyo: true,
          ease: "sine.inOut"
        },
        ">"
      );
    }
  }, { dependencies: [amebaMarkup], scope: containerRef, revertOnUpdate: true });

  useGSAP(() => {
    gsap.to(".wave-layer", {
      xPercent: -5,
      duration: 4.5,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      stagger: 0.25,
    });

    gsap.to("#wave-path", {
      attr: { d: wave2 },
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

//     Observer.create({
//   target: window, // can be any element (selector text is fine)
//   type: "wheel,touch", // comma-delimited list of what to listen for
//   onUp: () => previous(),
//   onDown: () => next(),
// });

    Draggable.create(".drag", { type: "x,y", dragResistance: 0.2 });

    if (buttonRef.current && buttonBgRef.current) {
      gsap
        .timeline({ delay: 0.9 })
        .from(buttonRef.current, { y: 30, opacity: 0, duration: 0.7, ease: "power2.out" })
        .from(buttonBgRef.current, { x: "-100%", duration: 0.7, ease: "power2.inOut" }, "-=0.4");
    }
  });

  return (
    <div ref={containerRef} className="page-shell bg-slate-950 page-enter w-full flex flex-col overflow-hidden">

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col section-fade">

        <nav className="page-nav flex w-full justify-end items-center gap-8 px-6 py-4 text-primary font-[audiowide] text-2xl" style={{ position: "relative", zIndex: 10 }}>
          <div className="green-icon-btn p-1"><ModeToggle /></div>
          <p className="nav-link" onClick={() => navigate(ROUTES.home)}>Home</p>
          <p className="nav-link" onClick={() => navigate(ROUTES.algorithms)}>Algorithms</p>
          <p className="nav-link" onClick={() => navigate(ROUTES.about)}>About Us</p>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 text-center">

          {/* FIX: circles live in a fixed full-viewport layer so they spread everywhere */}
          <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {circles.map((circle) => (
              <div
                key={circle.id}
                className={`circle-${circle.id} absolute rounded-full drag pointer-events-auto`}
                style={{
                  width: `${circle.size}px`,
                  height: `${circle.size}px`,
                  top: `${circle.top}vh`,
                  left: `${circle.left}vw`,
                  backgroundColor: circle.color,
                  zIndex: Math.floor(circle.top * 100),
                  transform: "translate(-50%, -50%)",
                  boxShadow: `0 ${circle.size / 5}px ${circle.size / 3}px rgba(0,0,0,0.3)`,
                  transition: "box-shadow 0.3s ease",
                }}
              />
            ))}
          </div>

          <div className="relative flex justify-center items-center w-full" style={{ zIndex: 2 }}>
            <div
              ref={amebaRef}
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 pointer-events-none min-w-[800px] w-full max-w-[500px] [&>svg]:w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={amebaMarkup ? { __html: amebaMarkup } : undefined}
            />
            <div className="flex flex-col items-center text-center" style={{ zIndex: 3 }}>
              <h1
                ref={titleRef}
                className="font-bold font-[audiowide] mt-20 leading-tight cursor-default text-[clamp(48px,10vw,140px)] text-foreground "
              >
                Algo Ameba
              </h1>
              <p ref={subtitleRef} className="text-xl text-muted-foreground font-[arima] max-w-xl mt-4">
                Visualize algorithms with buttery‑smooth GSAP animations. Learn by watching them breathe.
              </p>
            </div>
          </div>

          <div
            ref={buttonRef}
            className="action-btn action-btn--primary relative flex justify-center items-center font-[arima] text-xl w-52 h-14 overflow-hidden"
            onClick={() => navigate(ROUTES.home)}
            aria-label="Get Started"
            style={{ zIndex: 2 }}
          >
            <div ref={buttonBgRef} className="absolute inset-0 bg-[#007f04] z-10" />
            <span className="relative z-20 text-white font-semibold tracking-wide">Get Started</span>
          </div>

          <span className="text-muted-foreground text-sm animate-bounce select-none" style={{ zIndex: 2 }}>
            ↓ scroll
          </span>
        </div>
      </section>

      {/* ─── CARDS SECTION ────────────────────────────────────────────── */}
      <section className="section-fade min-h-screen flex flex-col items-center justify-around py-24 md:py-32 px-8 gap-16 md:gap-24">
        <h2 className="text-[clamp(40px,7vw,80px)] font-[audiowide] text-foreground text-center">
          What you get
        </h2>

        <div className="w-full h-[1000px] flex m-5">
          <h1 className="font-[audiowide] text-[50px] absolute z-10 m-2 nav-link">Fluid And Mordern Animations</h1>
          <div className="w-full h-full flex items-end justify-end relative">
            <svg width="100%" height="600" viewBox="0 0 900 600" preserveAspectRatio="none">
              <path id="wave-path" d={wave1} fill="blue" stroke="blue" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="w-full h-[1000px] flex m-2">
          <h1 className="font-[audiowide] text-[50px] absolute m-5 nav-link z-10">Simpler to Complex Animations</h1>
          <div className="flex justify-center items-center overflow-hidden relative">
            {bars.map((bar) => (
              <div key={bar} className="flex flex-col bar justify-center self-end items-center bg-blue-600 overflow-hidden" style={{ height: `${bar}%`, width: "75px" }} />
            ))}
          </div>
        </div>

        <div className="w-full h-[1000px] flex m-2">
          <h1 className="font-[audiowide] text-[50px] m-5 absolute z-10 nav-link">Smooth and Easy to Use</h1>
          <div className="flex justify-center items-center w-full relative">
            <div className="flex drag justify-center items-center rounded-[50%] h-[500px] w-[500px] bg-blue-600 shadow-xl shadow-green" onClick={onClick} />
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="section-fade py-14">
        <div className="flex justify-around items-center flex-wrap gap-8">

          <div className="flex flex-col items-center gap-3">
            <span className="green-icon-btn w-12 h-12 flex items-center justify-center text-foreground">
              <GithubIcon />
            </span>
            <span className="nav-link text-sm font-semibold font-[arima]">Contribute Here</span>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="green-icon-btn flex -space-x-2 rounded-full p-1 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background *:data-[slot=avatar]:grayscale">
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
            <span className="nav-link text-sm font-semibold font-[arima]">Contributors</span>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;