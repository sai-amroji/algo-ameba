import { GithubIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { ROUTES } from "@/constants/routes";
import gsap from "@/gsapSetup";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ScrambleTextPlugin } from "gsap/all";

gsap.registerPlugin(SplitText, ScrambleTextPlugin, useGSAP);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const buttonBgRef = useRef<HTMLDivElement>(null);
  const simpleComplexRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);

  const wave1 = "M0,300 Q150,200 300,300 T600,300 T900,300 L900,600 L0,600 Z";
  const wave2 = "M0,300 Q150,400 300,300 T600,300 T900,300 L900,600 L0,600 Z";
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
    if (!simpleComplexRef.current || !ballRef.current || !barRef.current || !treeRef.current || !graphRef.current) {
      return;
    }

    gsap.set([barRef.current, treeRef.current, graphRef.current], { autoAlpha: 0, scale: 0.9 });
    gsap.set(ballRef.current, { autoAlpha: 1, scale: 1 });

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: simpleComplexRef.current,
        start: "top top",
        end: "+=500%",
        scrub: 0.8,
        pin: true,
        snap: {
          snapTo: "labels",
          duration: { min: 0.2, max: 0.6 },
          ease: "power1.inOut",
        },
      },
    });

    timeline
      .addLabel("ball")
      .to(ballRef.current, { width: 220, height: 18, borderRadius: 10, duration: 1 })
      .to(barRef.current, { autoAlpha: 1, scale: 1, duration: 0.6 }, "<")
      .addLabel("bar")
      .to(ballRef.current, { autoAlpha: 0, duration: 0.4 })
      .to(barRef.current, { autoAlpha: 0, duration: 0.4 })
      .to(treeRef.current, { autoAlpha: 1, scale: 1, duration: 0.6 })
      .addLabel("tree")
      .to(treeRef.current, { autoAlpha: 0, duration: 0.4 })
      .to(graphRef.current, { autoAlpha: 1, scale: 1, duration: 0.6 })
      .addLabel("graph");
  }, { scope: containerRef });

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

    if (buttonRef.current && buttonBgRef.current) {
      gsap
        .timeline({ delay: 0.9 })
        .from(buttonRef.current, { y: 30, opacity: 0, duration: 0.7, ease: "power2.out" })
        .from(buttonBgRef.current, { x: "-100%", duration: 0.7, ease: "power2.inOut" }, "-=0.4");
    }
  });

  return (
    <div ref={containerRef} className="algo-shell page-enter w-full flex flex-col overflow-hidden">

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="min-h-screen flex flex-col section-fade">

        <nav className="page-nav flex w-full justify-end items-center gap-8 px-6 py-4 text-primary font-[audiowide] text-2xl" style={{ position: "relative", zIndex: 10 }}>
          <div className="green-icon-btn p-1"><ModeToggle /></div>
          <p className="nav-link" onClick={() => navigate(ROUTES.home)}>Home</p>
          <p className="nav-link" onClick={() => navigate(ROUTES.algorithms)}>Algorithms</p>
          <p className="nav-link" onClick={() => navigate(ROUTES.about)}>About Us</p>
        </nav>

        <div className="flex-1 flex flex-col items-center justify-center gap-10 px-8 text-center">

          <div className="relative flex justify-center items-center w-full" style={{ zIndex: 2 }}>
            <img
              src="/Ameba.png"
              alt=""
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-100 pointer-events-none min-w-[800px] w-full max-w-[520px] h-auto"
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
            className="algo-btn-primary relative flex justify-center items-center font-[arima] text-xl w-52 h-14 overflow-hidden"
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

        <div className="w-full h-[1000px] flex m-2" ref={simpleComplexRef}>
          <h1 className="font-[audiowide] text-[50px] absolute m-5 nav-link z-10">Simpler to Complex Animations</h1>
          <div className="flex justify-center items-center w-full overflow-hidden relative">
            <div className="relative flex items-center justify-center w-full max-w-4xl h-[520px]">
              <div
                ref={ballRef}
                className="bg-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                style={{ width: 24, height: 24, borderRadius: 9999 }}
              />

              <div
                ref={barRef}
                className="absolute flex gap-2 items-end"
              >
                {[60, 120, 90, 160, 110].map((height, idx) => (
                  <div
                    key={`bar-${idx}`}
                    className="w-7 rounded-md bg-blue-500"
                    style={{ height }}
                  />
                ))}
              </div>

              <div ref={treeRef} className="absolute flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500" />
                <div className="flex gap-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-400" />
                    <div className="flex gap-6">
                      <div className="w-8 h-8 rounded-full bg-emerald-300" />
                      <div className="w-8 h-8 rounded-full bg-emerald-300" />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-400" />
                    <div className="flex gap-6">
                      <div className="w-8 h-8 rounded-full bg-emerald-300" />
                      <div className="w-8 h-8 rounded-full bg-emerald-300" />
                    </div>
                  </div>
                </div>
              </div>

              <div ref={graphRef} className="absolute w-[360px] h-[260px]">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-indigo-500" />
                <div className="absolute bottom-6 left-6 w-10 h-10 rounded-full bg-indigo-400" />
                <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-indigo-400" />
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[2px] h-24 bg-slate-300" />
                <div className="absolute top-28 left-1/2 w-[120px] h-[2px] bg-slate-300" />
                <div className="absolute top-28 left-1/2 -translate-x-[120px] w-[120px] h-[2px] bg-slate-300" />
              </div>
            </div>
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