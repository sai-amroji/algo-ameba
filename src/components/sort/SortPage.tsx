import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import gsap from "@/gsapSetup";
import Flip from "gsap/Flip";
import { useGSAP } from "@gsap/react";
import SharedLayout from "@/components/SharedLayout";
import {
  sortAlgorithmBuilders,
  type SortFrame,
  type SortAlgorithmKey,
  type SortBar,
  type SortBarState,
} from "./SortAlgos";

gsap.registerPlugin(Flip, useGSAP);

const createBarId = () =>
  `bar-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const algoMap = [
  { name: "Bubble Sort",     value: "bubble"    },
  { name: "Selection Sort",  value: "selection" },
  { name: "Insertion Sort",  value: "insertion" },
  { name: "Merge Sort",      value: "merge"     },
  { name: "Quick Sort",      value: "quick"     },
] as const;

const getBarColor = (state: SortBarState | undefined) => {
  switch (state) {
    case "pivot":
      // gold — the chosen pivot, visually distinct from everything else
      return "viz-bar-pivot border-2 border-transparent font-bold";
    case "checking":
      return "viz-bar-checking shadow-sm border-2 border-transparent font-bold";
    case "comparing":
      return "viz-bar-comparing shadow-sm border-2 border-transparent font-bold";
    case "swapping":
      return "viz-bar-swapping border-2 border-transparent font-bold";
    case "placed":
      return "viz-bar-placed border-2 border-transparent font-bold";
    case "active":
      // active range background (dimmed) in quick sort
      return "viz-bar-active border-2 border-transparent";
    case "splitting":
      return "viz-bar-splitting shadow-sm border-2 border-transparent font-bold";
    case "merging":
      return "viz-bar-merging shadow-sm border-2 border-transparent font-bold";
    case "sorted":
      return "viz-bar-sorted border-2 border-transparent font-bold";
    default:
      return "viz-bar border-2 border-transparent";
  }
};

const SortPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode: SortAlgorithmKey = "bubble";
  const [mode, setMode] = useState<SortAlgorithmKey>(initialMode);
  const [bars, setBars] = useState<SortBar[]>([]);
  const [barStates, setBarStates] = useState<Record<string, SortBarState>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(0.75);
  const [inputValue, setInputValue] = useState("");
  const [phaseLabel, setPhaseLabel] = useState("");

  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const [labels, setLabels] = useState<string[]>([]);

  const getExistingBarElements = (ids: string[]) =>
    ids
      .map((id) => barRefs.current[id])
      .filter((el): el is HTMLDivElement => Boolean(el));

  const getAllBarElements = () =>
    Object.values(barRefs.current).filter(
      (el): el is HTMLDivElement => Boolean(el)
    );

  // ── Merge sort frame animator ───────────────────────────────────────────────
  // Translates frame.offsets {xFraction, yLevel} into real pixel GSAP tweens.
  //
  // SPREAD_PX: how far bars spread at xFraction=±1. Scales with container width
  //            so it looks the same on any screen. Caps so bars don't fly off-screen.
  // LIFT_PX:   how far a bar rises when selected during a merge step.
  const animateMergeFrame = (frame: SortFrame) => {
    if (!barsContainerRef.current) return;

    const container    = barsContainerRef.current;
    const containerW   = container.getBoundingClientRect().width;
    const barCount     = frame.bars.length;
    // Spread factor: at barCount=15, SPREAD_PX ≈ 160px. Scales with bar count.
    const SPREAD_PX    = Math.min(containerW * 0.45, (containerW / barCount) * 3.2);
    const LIFT_PX      = 52; // how high a selected bar rises

    const { offsets, bars: frameBars } = frame;

    frameBars.forEach((bar) => {
      const el = barRefs.current[bar.id];
      if (!el) return;

      const off = offsets?.[bar.id];
      const targetX = off ? off.xFraction * SPREAD_PX : 0;
      const targetY = off ? -(off.yLevel * LIFT_PX)   : 0;

      gsap.to(el, {
        x:         targetX,
        y:         targetY,
        duration:  Math.max(0.35, frame.duration * 0.7),
        ease:      "power3.inOut",
        overwrite: "auto",
      });
    });
  };

  // ── Timeline ────────────────────────────────────────────────────────────────
  useGSAP(() => {
    timelineRef.current = gsap.timeline({ paused: true });
    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
    };
  }, []);

  useEffect(() => {
    timelineRef.current?.timeScale(speed);
  }, [speed]);

  useEffect(() => {
    if (bars.length > 0) return;
    const randomBars = Array.from({ length: 12 }, () => ({
      id:    createBarId(),
      value: Math.floor(Math.random() * 50) + 1,
    }));
    setBars(randomBars);
  }, [bars.length]);

  const clampSpeed = (v: number) => Math.min(3, Math.max(0.25, v));

  const validModes = new Set<SortAlgorithmKey>(["bubble", "selection", "insertion", "merge", "quick"]);
  const updateMode = (next: string) => {
    const normalised: SortAlgorithmKey = validModes.has(next as SortAlgorithmKey)
      ? (next as SortAlgorithmKey)
      : "bubble";
    setMode(normalised);
    setSearchParams({ mode: normalised }, { replace: true });
    resetTimeline();
  };

  const resetTimeline = () => {
    timelineRef.current?.clear().pause(0);
    const all = getAllBarElements();
    if (all.length > 0) {
      gsap.killTweensOf(all);
      gsap.set(all, { x: 0, y: 0 });
    }
    setLabels([]);
    setIsPlaying(false);
    setBarStates({});
    setPhaseLabel("");
  };

  const handleInsert = () => {
    const parsed = Number.parseInt(inputValue.trim(), 10);
    if (Number.isNaN(parsed) || parsed < -50 || parsed > 50) return;
    setBars((prev) => [...prev, { id: createBarId(), value: parsed }]);
    setInputValue("");
    resetTimeline();
  };

  const generateRandomArray = () => {
    const randomBars = Array.from({ length: 12 }, () => ({
      id:    createBarId(),
      value: Math.floor(Math.random() * 50) + 1,
    }));
    setBars(randomBars);
    resetTimeline();
  };

  const buildSortTimeline = () => {
    const timeline = timelineRef.current;
    if (!timeline || bars.length === 0) return;

    const frames = sortAlgorithmBuilders[mode](bars);
    if (frames.length === 0) return;

    timeline.clear().pause(0);
    timeline.eventCallback("onComplete", () => {
      setIsPlaying(false);
      setPhaseLabel("");
    });
    timeline.eventCallback("onInterrupt", () => {
      setIsPlaying(false);
      setPhaseLabel("");
    });

    const nextLabels: string[] = [];

    frames.forEach((frame, index) => {
      const label = `step-${index}`;
      nextLabels.push(label);
      timeline.addLabel(label);

      timeline.call(
        () => {
          setBars(frame.bars);
          setBarStates(frame.states);
          if (frame.phaseLabel !== undefined) setPhaseLabel(frame.phaseLabel);

          requestAnimationFrame(() => {
            if (mode === "merge") {
              animateMergeFrame(frame);
              return;
            }

            // Other algorithms: use Flip for position-swap animation
            const targets = getAllBarElements();
            if (targets.length > 0) gsap.killTweensOf(targets);
            const flipState = Flip.getState(targets);
            Flip.from(flipState, {
              targets: getExistingBarElements(frame.bars.map((b) => b.id)),
              duration: Math.max(0.2, frame.duration * 0.45),
              ease:     "power2.inOut",
              absolute: false,
              overwrite: true,
            });
          });
        },
        undefined,
        label
      );

      timeline.to({}, { duration: frame.duration }, label);
    });

    setLabels(nextLabels);
    setIsPlaying(true);
    timeline.play(0);
  };

  const playSteps  = () => { if (!isPlaying) { timelineRef.current?.play(); setIsPlaying(true); } };
  const pauseSteps = () => { if (isPlaying)  { timelineRef.current?.pause(); setIsPlaying(false); } };

  const nextStep = () => {
    const tl = timelineRef.current;
    if (!tl || isPlaying || labels.length === 0) return;
    const ci = labels.indexOf(tl.currentLabel());
    tl.seek(labels[Math.min(ci < 0 ? 0 : ci + 1, labels.length - 1)]);
  };

  const prevStep = () => {
    const tl = timelineRef.current;
    if (!tl || isPlaying || labels.length === 0) return;
    const ci = labels.indexOf(tl.currentLabel());
    tl.seek(labels[Math.max(ci <= 0 ? 0 : ci - 1, 0)]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col">
      <SharedLayout
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleInsert={handleInsert}
        handleSearch={buildSortTimeline}
        actionLabel="Sort"
        generateRandomArray={generateRandomArray}
        algoMap={algoMap.map((a) => ({ name: a.name, value: a.value }))}
        isPlaying={isPlaying}
        onPlay={playSteps}
        onPause={pauseSteps}
        onNext={nextStep}
        onPrev={prevStep}
        selectedAlgorithm={mode}
        onAlgorithmChange={updateMode}
        speed={speed}
        onSpeedChange={(v) => setSpeed(clampSpeed(v))}
        onSpeedIncrease={() => setSpeed((p) => clampSpeed(p + 0.25))}
        onSpeedDecrease={() => setSpeed((p) => clampSpeed(p - 0.25))}
      >
        <div className="w-full flex flex-col justify-center items-center max-w-[1600px] px-6 md:px-12 py-4 overflow-visible"
             style={{ minHeight: (mode === "merge" || mode === "quick") ? "600px" : "400px" }}>

          {/* Phase label — merge sort split/merge context + quick sort pivot announcement */}
          {(mode === "merge" || mode === "quick") && (
            <div
              className="mb-6 text-sm font-mono tracking-wide transition-all duration-500 min-h-[1.5rem]"
              style={{ color: "var(--brand)", opacity: phaseLabel ? 1 : 0 }}
            >
              {phaseLabel}
            </div>
          )}

          <div
            ref={barsContainerRef}
            className="relative bar-container flex gap-2 justify-center items-end p-4 overflow-visible"
            style={{ minHeight: (mode === "merge" || mode === "quick") ? "360px" : "260px" }}
          >
            {bars.map((bar) => (
              <div
                key={bar.id}
                data-barid={bar.id}
                ref={(node) => { barRefs.current[bar.id] = node; }}
                className={`bar w-10 rounded-lg flex items-center justify-center font-mono text-sm ${getBarColor(barStates[bar.id])}`}
                style={{ height: `${Math.max(Math.abs(bar.value) * 4, 30)}px` }}
              >
                {bar.value}
              </div>
            ))}
          </div>
        </div>
      </SharedLayout>
    </div>
  );
};

export default SortPage;
