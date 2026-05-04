import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { type BarState } from '@/components/SharedLayout';
import { toast } from 'sonner';

type Bar = {
  value: number;
  id: string;
};

export const useSearchVizulizer = () => {
  const [bars, setBars] = useState<Bar[]>([]);

  const [barStates, setBarStates] = useState<Record<string, BarState>>({});
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const MIN_VALUE = -50;
  const MAX_VALUE = 50;
  const MAX_ARR_SIZE = 25;

  const timelineRef = useRef(gsap.timeline({ paused: true }));
  const labelsRef = useRef<string[]>([]);
  useEffect(() => {
    return () => {
      timelineRef.current.kill();
    };
  }, []);

  useEffect(() => {
    timelineRef.current.timeScale(speed);
  }, [speed]);

  const resetAnimation = () => {
    timelineRef.current.clear().pause(0);
    labelsRef.current = [];
    setIsPlaying(false);
    setBarStates({});
  };

  const handleInsert = () => {
    const values = inputValue
      .split(',')
      .map((num) => Number(num.trim()))
      .filter((num) => !isNaN(num) && num.toString() !== '');

    if (values.length === 0) {
      const trimmed = inputValue.trim();
      if (trimmed !== '') {
        toast.error('Please enter a valid number', {
          position: 'bottom-right',
          closeButton: true,
          duration: 2000,
        });
        return;
      }

      // If empty input, generate random number
      if (bars.length >= MAX_ARR_SIZE) {
        toast.error('Array size exceeds maximum limit', {
          position: 'bottom-right',
          closeButton: true,
          duration: 2000,
        });
        return;
      }

      const parsed =
        Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE;
      const newBar: Bar = {
        value: parsed,
        id: (Date.now() + Math.random()).toString(),
      };
      setBars((prev) => [...prev, newBar]);
      resetAnimation();
      setInputValue('');
      return;
    }

    let outOfBounds = false;
    const validValues = values.filter((n) => {
      if (n < MIN_VALUE || n > MAX_VALUE) {
        outOfBounds = true;
        return false;
      }
      return true;
    });

    if (outOfBounds) {
      toast.error(
        `Please enter numbers between ${MIN_VALUE} and ${MAX_VALUE}`,
        {
          position: 'bottom-right',
          closeButton: true,
          duration: 2000,
        }
      );
      if (validValues.length === 0) return;
    }

    setBars((prev) => {
      const availableSpace = MAX_ARR_SIZE - prev.length;
      if (validValues.length > availableSpace) {
        toast.error('Array size exceeds maximum limit', {
          position: 'bottom-right',
          closeButton: true,
          duration: 2000,
        });
      }
      const toAdd = validValues.slice(0, availableSpace);
      const newBars = toAdd.map((v) => ({
        value: v,
        id: (Date.now() + Math.random()).toString(),
      }));
      return [...prev, ...newBars];
    });

    resetAnimation();
    setInputValue('');
  };

  const generateRandomArray = (length = 15) => {
    const requestedLength =
      typeof length === 'number' && Number.isFinite(length) ? length : 8;
    const safeLength = Math.min(Math.max(Math.floor(requestedLength), 1), 20);
    const random = Array.from({ length: safeLength }, () => ({
      value:
        Math.floor(Math.random() * (MAX_VALUE - MIN_VALUE + 1)) + MIN_VALUE,
      id: Math.random().toString(),
    }));

    // Directly set bars without Flip animation to avoid thin initial rendering.
    setBars(random);
    resetAnimation();
  };

  useEffect(() => {
    if (bars.length === 0) {
      generateRandomArray();
    }
    // Run only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clampSpeed = (value: number) => Math.min(3, Math.max(0.25, value));

  const setPlaybackSpeed = (value: number) => {
    setSpeed(clampSpeed(value));
  };

  const increaseSpeed = () => {
    setSpeed((prev) => clampSpeed(prev + 0.25));
  };

  const decreaseSpeed = () => {
    setSpeed((prev) => clampSpeed(prev - 0.25));
  };

  const playSteps = () => {
    if (!isPlaying) {
      timelineRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseSteps = () => {
    if (isPlaying) {
      timelineRef.current.pause();
      setIsPlaying(false);
    }
  };

  const nextStep = () => {
    if (isPlaying) return;
    const currentLabel = timelineRef.current.currentLabel();
    const currentIndex = labelsRef.current.indexOf(currentLabel);
    if (currentIndex < labelsRef.current.length - 1) {
      timelineRef.current.seek(labelsRef.current[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    if (isPlaying) return;
    const currentLabel = timelineRef.current.currentLabel();
    const currentIndex = labelsRef.current.indexOf(currentLabel);
    if (currentIndex > 0) {
      timelineRef.current.seek(labelsRef.current[currentIndex - 1]);
    }
  };

  const getBarColor = (id: string) => {
    switch (barStates[id]) {
      case 'checking':
        return 'viz-search-check shadow-sm font-bold';
      case 'found':
        return 'viz-search-found shadow-sm font-bold';
      case 'discarded':
        return 'viz-search-discard';
      default:
        return 'viz-search flex items-center justify-center';
    }
  };

  return {
    bars,
    setBars,
    barStates,
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
  };
};
