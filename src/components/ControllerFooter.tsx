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
};

const ControllerFooter = ({
  onPlay,
  onPause,
  onNext,
  onPrev,
}: ControllerFooterProps) => {
  return (
    <footer className="flex justify-between items-center p-4 w-full">
      {/* Speed Controls */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="icon" className="size-8">
          <PlusIcon />
        </Button>

        <Slider defaultValue={[50]} max={100} step={1} className="w-64" />

        <Button variant="secondary" size="icon" className="size-8">
          <MinusIcon />
        </Button>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" onClick={onPrev}>
          <RewindIcon />
        </Button>

        <Button variant="secondary" size="icon" onClick={onPlay}>
          <PlayIcon />
        </Button>

        <Button variant="secondary" size="icon" onClick={onPause}>
          <PauseIcon />
        </Button>

        <Button variant="secondary" size="icon" onClick={onNext}>
          <FastForwardIcon />
        </Button>
      </div>
    </footer>
  );
};

export default ControllerFooter;
