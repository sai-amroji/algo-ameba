import { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import gsap from '@/gsapSetup'; // centralized GSAP instance with plugins registered
import { useGSAP } from '@gsap/react';
import { toast } from 'sonner';
import SharedLayout from '@/components/SharedLayout';
import { ROUTES } from '@/constants/routes';
import { useSearchVizulizer } from '@/hooks/useSearchVizulizer';
import {
  searchAlgorithms,
  type SearchFrame,
} from '@/components/search/searchAlgorithms';

// DrawSVGPlugin is already registered globally via gsapSetup

type SearchMode = 'linear' | 'binary';

const algoMap = [
  { name: 'Linear Search', value: 'linear' },
  { name: 'Binary Search', value: 'binary' },
] as const;

const SearchPage = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const routeMode: SearchMode =
    location.pathname === ROUTES.search ? 'binary' : 'linear';
  const queryMode = searchParams.get('mode');
  const initialMode: SearchMode =
    queryMode === 'binary' || queryMode === 'linear' ? queryMode : routeMode;
  const [mode, setMode] = useState<SearchMode>(initialMode);
  const barsContainerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    bars,
    setBars,
    setBarStates,
    inputValue,
    setInputValue,
    searchValue,
    setSearchValue,
    isPlaying,
    setIsPlaying,
    timelineRef,
    labelsRef,
    resetAnimation,
    handleInsert,
    generateRandomArray,
    playSteps,
    pauseSteps,
    nextStep,
    prevStep,
    getBarColor,
    speed,
    setPlaybackSpeed,
    increaseSpeed,
    decreaseSpeed,
  } = useSearchVizulizer();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const { contextSafe } = useGSAP({ scope: barsContainerRef });
  // Ref for the active dotted path that highlights the current focus range
  const activeLineRef = useRef<SVGPathElement>(null);

  const getExistingBarElements = (ids: string[]) =>
    ids
      .map((id) => barRefs.current[id])
      .filter((element): element is HTMLDivElement => Boolean(element));

  // Clear the dotted underline path — called on reset and animation complete
  const clearActiveLine = contextSafe(() => {
    const path = activeLineRef.current;
    if (!path) return;
    gsap.killTweensOf(path);
    gsap.set(path, { attr: { d: '' }, opacity: 0 });
  });

  // ── Celebration: all bars return, found bar rises green ──
  const animateFoundCelebration = contextSafe((frame: SearchFrame) => {
    const foundId = frame.focusId;
    const allDiscarded = [
      ...(frame.leftDiscardedIds ?? []),
      ...(frame.rightDiscardedIds ?? []),
      ...(frame.discardedIds ?? []),
    ];
    // deduplicate
    const returnIds = [...new Set(allDiscarded)];
    const returnEls = getExistingBarElements(returnIds);
    const foundEl = foundId ? barRefs.current[foundId] : null;

    clearActiveLine();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out', overwrite: 'auto' },
    });

    // 1. All discarded bars sweep back to home — stagger from edges inward
    if (returnEls.length > 0) {
      tl.to(
        returnEls,
        {
          x: 0,
          opacity: 0.28, // stays slightly muted so found bar pops
          filter: 'grayscale(80%)',
          duration: 0.9,
          stagger: { amount: 0.22, from: 'edges' },
          ease: 'power2.out',
        },
        0
      );
    }

    // 2. Found bar: reset any offset, then rise with a big celebratory bounce
    if (foundEl) {
      tl.set(foundEl, { x: 0 }, 0);
      tl.to(
        foundEl,
        {
          y: -32,
          scale: 1.22,
          duration: 0.55,
          ease: 'back.out(2.8)',
        },
        0.5
      ); // starts while others are still sweeping back

      // 3. Pulse glow ring — expand a box-shadow then fade
      tl.to(
        foundEl,
        {
          boxShadow:
            '0 0 0 6px rgba(74,222,128,0.5), 0 0 28px rgba(74,222,128,0.35)',
          duration: 0.35,
          ease: 'power2.out',
        },
        0.8
      );
      tl.to(
        foundEl,
        {
          boxShadow:
            '0 0 0 3px rgba(74,222,128,0.2), 0 0 12px rgba(74,222,128,0.15)',
          duration: 0.6,
          ease: 'power1.inOut',
        },
        1.15
      );
    }
  });

  // ── Not-found ending: everything sinks and desaturates together ──
  const animateNotFound = contextSafe((_frame: SearchFrame) => {
    const allEls = getExistingBarElements(bars.map((b) => b.id));
    clearActiveLine();
    gsap.to(allEls, {
      opacity: 0.2,
      y: 12,
      filter: 'grayscale(100%)',
      duration: 0.7,
      stagger: { amount: 0.18, from: 'center' },
      ease: 'power2.inOut',
      overwrite: 'auto',
    });
  });

  const animateBinaryFrame = contextSafe((frame: SearchFrame) => {
    // Branch to special endings
    if (frame.isFinalFound) {
      animateFoundCelebration(frame);
      return;
    }
    if (frame.isNotFound) {
      animateNotFound(frame);
      return;
    }

    const activeIds = frame.activeIds ?? [];
    const leftDiscarded = frame.leftDiscardedIds ?? [];
    const rightDiscarded = frame.rightDiscardedIds ?? [];
    const focusId = frame.focusId;

    const activeEls = getExistingBarElements(activeIds);
    const leftEls = getExistingBarElements(leftDiscarded);
    const rightEls = getExistingBarElements(rightDiscarded);

    const container = barsContainerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;

    // Each eliminated half slides out by 42% of container width (accumulates per round)
    const SLIDE_AMOUNT = containerWidth * 0.42;

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut', overwrite: 'auto' },
    });

    // ── Step 1: Restore active bars — fully visible ──
    tl.to(
      activeEls,
      { opacity: 1, scale: 1, filter: 'grayscale(0%)', duration: 0.25 },
      0
    );

    // ── Step 2a: Eliminated LEFT half peels away to -x, stagger right-to-left ──
    if (leftEls.length > 0) {
      tl.to(
        leftEls,
        {
          x: (_, el) => (gsap.getProperty(el, 'x') as number) - SLIDE_AMOUNT,
          opacity: 0.12,
          filter: 'grayscale(100%)',
          duration: 0.7,
          stagger: { amount: 0.12, from: 'end' },
        },
        0
      );
    }

    // ── Step 2b: Eliminated RIGHT half peels away to +x, stagger left-to-right ──
    if (rightEls.length > 0) {
      tl.to(
        rightEls,
        {
          x: (_, el) => (gsap.getProperty(el, 'x') as number) + SLIDE_AMOUNT,
          opacity: 0.12,
          filter: 'grayscale(100%)',
          duration: 0.7,
          stagger: { amount: 0.12, from: 'start' },
        },
        0
      );
    }

    // ── Step 3: After slide settles, recentre active range ──
    tl.add(() => {
      if (activeEls.length === 0) return;
      const firstRect = activeEls[0].getBoundingClientRect();
      const lastRect = activeEls[activeEls.length - 1].getBoundingClientRect();
      const rangeCenterX = (firstRect.left + lastRect.right) / 2;
      const containerCenterX = containerRect.left + containerWidth / 2;
      const shiftX = containerCenterX - rangeCenterX;

      gsap.to(activeEls, {
        x: (_, el) => (gsap.getProperty(el, 'x') as number) + shiftX,
        duration: 0.55,
        ease: 'power2.out',
        overwrite: 'auto',
        stagger: { amount: 0.08, from: 'center' },
      });
    }, '+=0.18'); // slide needs ~0.7s; 0.18s offset gives it a head start

    // ── Step 4: Lift the pivot bar — deliberate bounce ──
    if (focusId) {
      const focusEl = barRefs.current[focusId];
      if (focusEl) {
        tl.set(focusEl, { y: 0, scale: 1 }, 0);
        tl.to(
          focusEl,
          { y: -20, scale: 1.14, duration: 0.4, ease: 'back.out(2)' },
          0.28
        );
      }
    }

    // ── Step 5: Dotted underline — draws in, holds, fades out ──
    if (activeLineRef.current && activeEls.length > 0) {
      requestAnimationFrame(() => {
        if (!activeLineRef.current) return;

        const first = activeEls[0].getBoundingClientRect();
        const last = activeEls[activeEls.length - 1].getBoundingClientRect();
        const startX = first.left - containerRect.left;
        const endX = last.right - containerRect.left;
        const yPos = first.top - containerRect.top - 14;

        const path = activeLineRef.current;
        gsap.killTweensOf(path);
        gsap.set(path, {
          attr: { d: `M${startX},${yPos} L${endX},${yPos}` },
          strokeDasharray: '6 4',
          stroke: 'var(--brand)',
          strokeWidth: 2,
          fill: 'none',
          opacity: 1,
        });
        gsap.fromTo(
          path,
          { drawSVG: '0%', opacity: 1 },
          {
            drawSVG: '100%',
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              // hold for 1s then fade — line disappears well before the next frame
              gsap.to(path, {
                opacity: 0,
                duration: 0.45,
                delay: 1.0,
                ease: 'power1.in',
              });
            },
          }
        );
      });
    }
  });

  const resetBarTweens = contextSafe(() => {
    const barElements = getExistingBarElements(bars.map((bar) => bar.id));
    if (barElements.length === 0) return;
    gsap.killTweensOf(barElements);
    gsap.set(barElements, { clearProps: 'x,y,scale,opacity,filter' });
    // Always clear the dotted line on reset
    clearActiveLine();
  });

  const updateMode = (nextMode: string) => {
    const normalizedMode: SearchMode =
      nextMode === 'binary' ? 'binary' : 'linear';
    setMode(normalizedMode);
    setSearchParams({ mode: normalizedMode }, { replace: true });
  };

  const finishTimeline = () => {
    setIsPlaying(false);
  };

  const runSearch = (target: number) => {
    const timeline = timelineRef.current;
    resetAnimation();
    timeline.clear().pause(0);
    resetBarTweens();

    const result = searchAlgorithms[mode](bars, target);
    const labels: string[] = [];

    setBars(result.initialBars);

    result.frames.forEach((frame, index) => {
      const label = `step-${index}`;
      labels.push(label);
      timeline.addLabel(label);

      timeline.call(
        () => {
          setBarStates(frame.states);
          if (mode === 'binary') {
            // Wait for React to apply classes/styles before GSAP reads positions.
            requestAnimationFrame(() => {
              animateBinaryFrame(frame);
            });
          }
        },
        undefined,
        label
      );

      timeline.to({}, { duration: frame.duration }, label);
    });

    timeline.eventCallback('onComplete', () => {
      finishTimeline();
      clearActiveLine();
      if (mode !== 'binary') {
        resetBarTweens();
      }
      if (!result.found) {
        toast('Value not found');
      }
    });
    timeline.eventCallback('onInterrupt', finishTimeline);

    labelsRef.current = labels;

    if (labels.length === 0) {
      finishTimeline();
      return;
    }

    requestAnimationFrame(() => {
      timeline.play(0);
      setIsPlaying(true);
    });
  };

  const handleSearch = () => {
    const target = Number.parseInt(searchValue.trim(), 10);
    if (Number.isNaN(target) || target > 50 || target < -50) {
      toast('Enter a valid target between -50 and 50');
      return;
    }

    if (bars.length === 0) {
      toast('No bars available. Generate or insert values first.');
      return;
    }

    runSearch(target);
  };

  return (
    <SharedLayout
      inputValue={inputValue}
      setInputValue={setInputValue}
      searchValue={searchValue}
      setSearchValue={setSearchValue}
      handleInsert={handleInsert}
      isPlaying={isPlaying}
      handleSearch={handleSearch}
      actionLabel="Search"
      generateRandomArray={generateRandomArray}
      algoMap={algoMap.map((algo) => ({ name: algo.name, value: algo.value }))}
      onPlay={playSteps}
      onPause={pauseSteps}
      onNext={nextStep}
      onPrev={prevStep}
      selectedAlgorithm={mode}
      onAlgorithmChange={updateMode}
      speed={speed}
      onSpeedChange={setPlaybackSpeed}
      onSpeedIncrease={increaseSpeed}
      onSpeedDecrease={decreaseSpeed}
    >
      <div className="w-full h-[900px] flex justify-center items-center max-w-[1600px] px-6 md:px-12 py-4 overflow-visible">
        <div
          ref={barsContainerRef}
          className="relative flex gap-2 justify-center items-end p-4 min-h-[260px] w-full bar-container overflow-visible"
        >
          {bars.map((bar) => (
            <div
              id={`bar-${bar.id}`}
              ref={(node) => {
                barRefs.current[bar.id] = node;
              }}
              key={bar.id}
              data-flip-id={bar.id}
              className={`bar w-10 rounded-sm text-center transition-colors duration-300 ${getBarColor(bar.id)}`}
              style={{ height: `${Math.max(Math.abs(bar.value) * 4, 30)}px` }}
            >
              {bar.value}
            </div>
          ))}
          {/* SVG overlay: full container size so dotted-line paths always fit */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <path ref={activeLineRef} />
          </svg>
        </div>
      </div>
    </SharedLayout>
  );
};

export default SearchPage;
