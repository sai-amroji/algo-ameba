import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { ModeToggle } from "@/components/mode-toggle.tsx";
import { ROUTES } from "@/constants/routes";
import gsap from "@/gsapSetup";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LandingPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  
  // Floating elements refs
  const floatingElementsRef = useRef<HTMLDivElement>(null);
  const bar1Ref = useRef<HTMLDivElement>(null);
  const bar2Ref = useRef<HTMLDivElement>(null);
  const bar3Ref = useRef<HTMLDivElement>(null);
  const bar4Ref = useRef<HTMLDivElement>(null);
  const bar5Ref = useRef<HTMLDivElement>(null);
  const node1Ref = useRef<HTMLDivElement>(null);
  const node2Ref = useRef<HTMLDivElement>(null);
  const node3Ref = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!heroRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from(".hero-bg", { opacity: 0, scale: 1.1, duration: 1.2 })
      .from(titleRef.current, {
        opacity: 0,
        y: 60,
        duration: 0.9,
      }, "-=0.6")
      .from(subtitleRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.7,
      }, "-=0.5")
      .from(ctaRef.current, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        duration: 0.6,
      }, "-=0.4");

  }, { scope: containerRef });

  // Floating algorithm elements animation
  useGSAP(() => {
    if (!floatingElementsRef.current) return;

    const bars = [bar1Ref.current, bar2Ref.current, bar3Ref.current, bar4Ref.current, bar5Ref.current];
    const nodes = [node1Ref.current, node2Ref.current, node3Ref.current];
    
    // Staggered bar heights animation (simulating sort visualization)
    bars.forEach((bar, i) => {
      if (!bar) return;
      gsap.to(bar, {
        y: -15 - (i * 8),
        duration: 1.2 + (i * 0.15),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.12
      });
    });

    // Floating node animation
    nodes.forEach((node, i) => {
      if (!node) return;
      gsap.to(node, {
        y: -12,
        x: i === 1 ? 8 : -8,
        duration: 2 + (i * 0.3),
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: i * 0.4
      });
    });

    // Arrow pulse animation
    if (arrowRef.current) {
      gsap.to(arrowRef.current, {
        scale: 1.15,
        opacity: 0.7,
        duration: 0.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }

  }, { scope: containerRef });

  // Feature cards scroll animation
  useGSAP(() => {
    if (!featuresRef.current) return;

    const featureCards = featuresRef.current.querySelectorAll(".feature-card");

    gsap.fromTo(
      featureCards,
      {
        opacity: 0,
        y: 24,
        scale: 0.98,
      },
      {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: "back.out(1.4)",
        immediateRender: false,
      }
    );

  }, { scope: containerRef });

  // Stats counter animation
  useGSAP(() => {
    if (!statsRef.current) return;

    const statNumbers = document.querySelectorAll(".stat-number");
    
    statNumbers.forEach((stat) => {
      const target = stat.getAttribute("data-target");
      if (!target) return;
      
      gsap.from(stat, {
        scrollTrigger: {
          trigger: statsRef.current,
          start: "top 75%",
          toggleActions: "play none none none"
        },
        textContent: 0,
        duration: 2,
        ease: "power1.out",
        snap: { textContent: 1 },
        delay: 0.2
      });
    });

    gsap.from(".stat-item", {
      scrollTrigger: {
        trigger: statsRef.current,
        start: "top 75%",
        toggleActions: "play none none none"
      },
      opacity: 0,
      y: 40,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });

  }, { scope: containerRef });

  // Showcase cards hover effects
  useGSAP(() => {
    const cards = document.querySelectorAll(".showcase-card");
    
    cards.forEach((card) => {
      const onEnter = () => {
        gsap.to(card, {
          y: -8,
          scale: 1.03,
          duration: 0.35,
          ease: "power2.out"
        });
        gsap.to(card.querySelector(".card-glow"), {
          opacity: 1,
          duration: 0.3
        });
        gsap.to(card.querySelector(".card-icon"), {
          scale: 1.15,
          rotation: 5,
          duration: 0.4,
          ease: "back.out(2)"
        });
      };
      
      const onLeave = () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          duration: 0.35,
          ease: "power2.out"
        });
        gsap.to(card.querySelector(".card-glow"), {
          opacity: 0,
          duration: 0.3
        });
        gsap.to(card.querySelector(".card-icon"), {
          scale: 1,
          rotation: 0,
          duration: 0.4,
          ease: "power2.out"
        });
      };
      
      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
    });

  }, { scope: containerRef });

  // How it works steps animation
  useGSAP(() => {
    if (!howItWorksRef.current) return;

    gsap.from(".step-number", {
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse"
      },
      scale: 0,
      rotation: -180,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: "back.out(2)"
    });

    gsap.from(".step-content", {
      scrollTrigger: {
        trigger: howItWorksRef.current,
        start: "top 70%",
        toggleActions: "play none none reverse"
      },
      x: -40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: "power2.out",
      delay: 0.3
    });

  }, { scope: containerRef });

  // CTA button animation
  useGSAP(() => {
    if (!ctaRef.current) return;

    const btn = ctaRef.current.querySelector("button");
    if (!btn) return;

    gsap.to(btn, {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 90%",
        toggleActions: "play none none reverse"
      },
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: "back.out(1.7)"
    });

    // Continuous pulse on CTA
    gsap.to(btn, {
      boxShadow: "0 0 30px rgba(0, 255, 17, 0.4)",
      duration: 1.2,
      ease: "sine.inOut",
      yoyo: true,
      repeat: -1,
      delay: 2
    });

  }, { scope: containerRef });

  // Footer fade in
  useGSAP(() => {
    if (!footerRef.current) return;

    gsap.from(footerRef.current, {
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top 90%",
        toggleActions: "play none none reverse"
      },
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: "power2.out"
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="min-h-screen overflow-x-hidden bg-background">
      {/* ─── NAVBAR ───────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-background/70 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center mr-4 ml-2">
            {/* <span className="text-background font-bold text-sm">A</span> */}
            <img src="/Ameba.svg" alt="Logo" className="w-10 h-10 absolute mr-4" />
          </div>
          <span className="font-[audiowide] text-lg font-semibold tracking-wide">AlgoAmeba</span>
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate(ROUTES.home)}
            className="nav-link text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            Algorithms
          </button>
          <button 
            onClick={() => navigate(ROUTES.about)}
            className="nav-link text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
          >
            About
          </button>
          <ModeToggle />
        </div>
      </nav>

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Animated Background */}
        <div className="hero-bg absolute inset-0 bg-gradient-to-br from-background via-background to-emerald-950/20" />
        
        {/* Floating Algorithm Visualization Elements */}
        <div ref={floatingElementsRef} className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Sort bars */}
          <div ref={bar1Ref} className="absolute top-32 left-[8%]">
            <div className="w-6 h-20 rounded-md bg-gradient-to-b from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30" />
          </div>
          <div ref={bar2Ref} className="absolute top-48 left-[15%]">
            <div className="w-6 h-32 rounded-md bg-gradient-to-b from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30" />
          </div>
          <div ref={bar3Ref} className="absolute top-28 right-[12%]">
            <div className="w-6 h-24 rounded-md bg-gradient-to-b from-violet-400 to-purple-500 shadow-lg shadow-purple-500/30" />
          </div>
          <div ref={bar4Ref} className="absolute top-40 right-[20%]">
            <div className="w-6 h-16 rounded-md bg-gradient-to-b from-pink-400 to-rose-500 shadow-lg shadow-rose-500/30" />
          </div>
          <div ref={bar5Ref} className="absolute top-56 right-[8%]">
            <div className="w-6 h-28 rounded-md bg-gradient-to-b from-amber-400 to-orange-500 shadow-lg shadow-orange-500/30" />
          </div>

          {/* Tree nodes */}
          <div ref={node1Ref} className="absolute bottom-40 left-[10%]">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg shadow-green-500/40 flex items-center justify-center">
              <span className="text-background font-bold text-sm">8</span>
            </div>
          </div>
          <div ref={node2Ref} className="absolute bottom-52 left-[18%]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/40 flex items-center justify-center">
              <span className="text-background font-bold text-xs">3</span>
            </div>
          </div>
          <div ref={node3Ref} className="absolute bottom-48 left-[22%]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 shadow-lg shadow-purple-500/40 flex items-center justify-center">
              <span className="text-background font-bold text-xs">10</span>
            </div>
          </div>

          {/* Animated arrow connecting nodes */}
          <div ref={arrowRef} className="absolute bottom-44 left-[14%] opacity-50">
            <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
              <path d="M5 25 Q30 5 55 20" stroke="url(#arrowGrad)" strokeWidth="2" strokeDasharray="4 4" fill="none"/>
              <defs>
                <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e"/>
                  <stop offset="100%" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Decorative circles */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-brand/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand/10 border border-brand/30 mb-8">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-sm font-medium text-brand/90">Interactive Algorithm Visualization</span>
          </div>
          
          <h1 
            ref={titleRef}
            className="font-[audiowide] text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-foreground via-cyan-600 to-foreground bg-clip-text text-transparent">
              Algo
            </span>
            <span className="bg-gradient-to-r from-brand via-emerald-400 to-brand bg-clip-text text-transparent">
              Ameba
            </span>
          </h1>
          
          <p 
            ref={subtitleRef}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Watch algorithms come alive with buttery-smooth GSAP animations. 
            Learn sorting, searching, and data structures by seeing them breathe.
          </p>
          
          <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate(ROUTES.home)}
              className="group relative px-8 py-4 rounded-xl bg-brand text-background font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 transition-shadow"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Visualizing
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            <button
              onClick={() => navigate(ROUTES.about)}
              className="px-8 py-4 rounded-xl border-2 border-border hover:border-brand/50 font-semibold text-lg hover:bg-brand/5 transition-all"
            >
              Learn More
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─────────────────────────────────────────── */}
      <section ref={featuresRef} className="py-24 px-6 bg-gradient-to-b from-background to-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[audiowide] text-3xl md:text-4xl font-bold mb-4">
              Why Choose AlgoAmeba?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Built for learners who want to understand algorithms, not just memorize them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Step-by-Step Playback</h3>
              <p className="text-muted-foreground">
                Control animations frame by frame. Pause, rewind, and speed up to match your learning pace.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Algorithms</h3>
              <p className="text-muted-foreground">
                From bubble sort to binary trees, explore sorting, searching, and data structures all in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smooth Animations</h3>
              <p className="text-muted-foreground">
                Powered by GSAP for silky-smooth 60fps animations that make complex concepts intuitive.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Interactive Input</h3>
              <p className="text-muted-foreground">
                Enter your own values or generate random arrays. Test edge cases and understand boundaries.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Responsive Design</h3>
              <p className="text-muted-foreground">
                Works seamlessly on desktop, tablet, and mobile. Learn anywhere, anytime.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card p-6 rounded-2xl bg-card border border-border/50 hover:border-brand/30 transition-all hover:shadow-lg hover:shadow-brand/10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand/20 to-emerald-500/20 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Always Free</h3>
              <p className="text-muted-foreground">
                Open source and completely free forever. No subscriptions, no paywalls, just learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ───────────────────────────────────────────────
      <section ref={statsRef} className="py-20 px-6 bg-card/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold font-[audiowide] text-brand mb-2">
                <span className="stat-number" data-target="8">0</span>+
              </div>
              <p className="text-muted-foreground font-medium">Algorithms</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold font-[audiowide] text-cyan-500 mb-2">
                <span className="stat-number" data-target="60">0</span>+
              </div>
              <p className="text-muted-foreground font-medium">Visual States</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold font-[audiowide] text-emerald-500 mb-2">
                <span className="stat-number" data-target="100">0</span>%
              </div>
              <p className="text-muted-foreground font-medium">Free Forever</p>
            </div>
            <div className="stat-item text-center">
              <div className="text-4xl md:text-5xl font-bold font-[audiowide] text-violet-500 mb-2">
                <span className="stat-number" data-target="60">0</span>+
              </div>
              <p className="text-muted-foreground font-medium">FPS Animation</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* ─── ALGORITHM SHOWCASE ─────────────────────────────────────────── */}
      <section ref={showcaseRef} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[audiowide] text-3xl md:text-4xl font-bold mb-4">
              Explore Algorithm Categories
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Click on any category to dive into interactive visualizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sort Card */}
            <div 
              onClick={() => navigate(ROUTES.sort)}
              className="showcase-card group relative p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-border/50 hover:border-blue-500/50 cursor-pointer transition-all overflow-hidden"
            >
              <div className="card-glow absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 transition-opacity" />
              <div className="relative z-10">
                <div className="card-icon w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Sorting Algorithms</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Watch bubble, quick, merge, and insertion sort come to life with smooth animations.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Bubble</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Quick</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Merge</span>
                </div>
              </div>
            </div>

            {/* Search Card */}
            <div 
              onClick={() => navigate(ROUTES.search)}
              className="showcase-card group relative p-6 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border border-border/50 hover:border-emerald-500/50 cursor-pointer transition-all overflow-hidden"
            >
              <div className="card-glow absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 transition-opacity" />
              <div className="relative z-10">
                <div className="card-icon w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Searching Algorithms</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  See linear and binary search in action with range highlighting and found markers.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Linear</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-emerald-400">Binary</span>
                </div>
              </div>
            </div>

            {/* Data Structures Card */}
            <div 
              onClick={() => navigate(ROUTES.tree)}
              className="showcase-card group relative p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/10 border border-border/50 hover:border-violet-500/50 cursor-pointer transition-all overflow-hidden"
            >
              <div className="card-glow absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 transition-opacity" />
              <div className="relative z-10">
                <div className="card-icon w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Data Structures</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Explore trees, graphs, stacks, queues, heaps, and linked lists visually.
                </p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 text-xs rounded-full bg-violet-500/20 text-violet-400">Trees</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-violet-500/20 text-violet-400">Graphs</span>
                  <span className="px-3 py-1 text-xs rounded-full bg-violet-500/20 text-violet-400">Heaps</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section ref={howItWorksRef} className="py-24 px-6 bg-gradient-to-b from-card/50 to-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[audiowide] text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start gap-6">
              <div className="step-number flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-brand to-emerald-500 flex items-center justify-center text-background font-bold text-xl shadow-lg shadow-brand/30">
                1
              </div>
              <div className="step-content pt-2">
                <h3 className="text-xl font-semibold mb-2">Choose an Algorithm</h3>
                <p className="text-muted-foreground">
                  Browse our collection of sorting, searching, and data structure algorithms. Pick the one you want to learn about.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6">
              <div className="step-number flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/30">
                2
              </div>
              <div className="step-content pt-2">
                <h3 className="text-xl font-semibold mb-2">Enter Your Input</h3>
                <p className="text-muted-foreground">
                  Type in your own values or generate random data. Test different scenarios to understand how algorithms behave.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6">
              <div className="step-number flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
                3
              </div>
              <div className="step-content pt-2">
                <h3 className="text-xl font-semibold mb-2">Watch & Learn</h3>
                <p className="text-muted-foreground">
                  Play the animation and watch step-by-step as the algorithm works. Use controls to pause, skip, and adjust speed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ───────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-brand/10 via-emerald-500/10 to-cyan-500/10 border border-brand/30">
            <h2 className="font-[audiowide] text-3xl md:text-4xl font-bold mb-4">
              Ready to Visualize?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of learners who understand algorithms through visualization.
            </p>
            <button
              onClick={() => navigate(ROUTES.home)}
              className="px-10 py-4 rounded-xl bg-brand text-background font-semibold text-lg shadow-lg shadow-brand/30 hover:shadow-brand/50 hover:scale-105 transition-all"
            >
              Start Now - It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <div ref={footerRef} className="py-12 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand to-emerald-400 flex items-center justify-center">
                <span className="text-background font-bold text-sm">A</span>
              </div>
              <span className="font-[audiowide] text-lg font-semibold">AlgoAmeba</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(ROUTES.home)}
                className="nav-link text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
              >
                Algorithms
              </button>
              <button 
                onClick={() => navigate(ROUTES.about)}
                className="nav-link text-sm font-medium opacity-70 hover:opacity-100 transition-opacity"
              >
                About
              </button>
              <a 
                href="https://github.com/sai-amroji/algo-ameba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="nav-link text-sm font-medium opacity-70 hover:opacity-100 transition-opacity flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border/30 text-center">
            <p className="text-sm text-muted-foreground">
              Built with React, TypeScript, and GSAP. Open source forever.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
