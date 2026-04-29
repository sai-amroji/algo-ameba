import { Button } from "@/components/ui/button.tsx";
import {
  FastForwardIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RewindIcon,
} from "lucide-react";
import { Slider } from "@/components/ui/slider.tsx";

type ControllerFooterProps = {
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  isPlaying: boolean;
  speed?: number;
  onSpeedChange?: (value: number) => void;
  onSpeedIncrease?: () => void;
  onSpeedDecrease?: () => void;
};

const ControllerFooter = ({
                            onPlay,
                            onPause,
                            onNext,
                            onPrev,
                            isPlaying,
                            speed = 1,
                            onSpeedChange,
                            onSpeedIncrease,
                            onSpeedDecrease,
                          }: ControllerFooterProps) => {
  const handlePlayPause = () => {
    if (isPlaying) {
      onPause();
    } else {
      onPlay();
    }
  };

  return (
      <footer className="footer flex justify-between items-center p-4 w-full">
        {/* Speed Controls */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={onSpeedIncrease}
            disabled={!onSpeedIncrease}
          >
            <PlusIcon />
          </Button>

          <Slider
            value={[Math.round(speed * 100)]}
            onValueChange={(values) => {
              const next = (values[0] ?? 100) / 100;
              onSpeedChange?.(next);
            }}
            min={25}
            max={300}
            step={5}
            className="w-64 "
          />

          <Button
            
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={onSpeedDecrease}
            disabled={!onSpeedDecrease}
          >
            <MinusIcon />
          </Button>

          <span className="text-sm muted-text min-w-14 text-right">
            {speed.toFixed(2)}x
          </span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 ">
          <Button variant="secondary" size="icon" onClick={onPrev}>
            <RewindIcon />
          </Button>

          <Button variant="secondary" size="icon" onClick={handlePlayPause}>
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>

          <Button variant="secondary" size="icon" onClick={onNext}>
            <FastForwardIcon />
          </Button>
        </div>
      </footer>
  );
};

export default ControllerFooter;
