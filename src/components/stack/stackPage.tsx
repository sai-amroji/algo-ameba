import { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input.tsx';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx';
import { useGSAP } from '@gsap/react';
import gsap from '../../gsapSetup.ts';
import { toast } from 'sonner';

type Status = 'popping' | 'pushing';
type StackItem = { id: number; value: number; status: Status };

let uid = 0;

const makeItem = (value: number): StackItem => ({
  id: ++uid,
  value,
  status: 'pushing',
});

const ALGO_OPTIONS: Record<string, string[]> = {
  stack: ['push', 'pop', 'peek', 'clear'],
  'monotonic stack': ['push', 'pop', 'peek', 'clear'],
};

const PRIMARY_GLOW = '0 0 16px var(--brand)';

const StackPage = () => {
  const [algo, setAlgo] = useState('stack');
  const [input, setInput] = useState('');
  const [stack, setStack] = useState<StackItem[]>([]);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP({ scope: containerRef });

  const options = ALGO_OPTIONS[algo];
  const activeS = stack.filter((i) => i.status === 'pushing');
  const MAX_STACK_SIZE = 15;
  const isFull = activeS.length >= MAX_STACK_SIZE;
  const isEmpty = activeS.length === 0;

  const getRef = (id: number) => itemRefs.current.get(id);
  const removeFromState = (id: number) =>
    setStack((prev) => prev.filter((i) => i.id !== id));
  const markExiting = (id: number) =>
    setStack((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'popping' as Status } : i))
    );

  useEffect(() => {
    if (stack.length === 0) generateRandom();
  }, [stack]);

  const generateRandom = () => {
    setStack([]);
    itemRefs.current.clear();
    uid = 0;

    let size = Math.floor(Math.random() * 8) + 2; // Generate 2-9 items
    while (size > 0) {
      const num = Math.floor(Math.random() * 100);
      push(num);
      size--;
    }
  };

  const push = (value: number) => {
    if (isFull)
      return toast('Stack is full!', {
        position: 'bottom-right',
        closeButton: true,
      });
    const item = makeItem(value);
    setStack((prev) => [item, ...prev]);
    setTimeout(() => {
      const el = getRef(item.id);
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: -60, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.7)' }
      );
    }, 20);
  };

  const pop = () => {
    if (isEmpty)
      return toast('Stack is empty!', {
        position: 'bottom-right',
        closeButton: true,
      });
    const target = activeS[0];
    const el = getRef(target.id);
    if (!el) return;
    markExiting(target.id);
    gsap.to(el, {
      opacity: 0,
      y: -60,
      scale: 0.85,
      duration: 0.38,
      ease: 'power2.in',
      onComplete: () => {
        removeFromState(target.id);
        itemRefs.current.delete(target.id);
        toast(`Popped ${target.value}`, {
          position: 'bottom-right',
          closeButton: true,
        });
      },
    });
  };

  const peek = () => {
    if (isEmpty)
      return toast('Stack is empty!', {
        position: 'bottom-right',
        closeButton: true,
      });
    const el = getRef(activeS[0].id);
    if (el) {
      gsap.fromTo(
        el,
        { boxShadow: '0 0 0px rgba(0,255,17,0)' },
        {
          boxShadow: PRIMARY_GLOW,
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: 'power1.inOut',
        }
      );
    }
    toast(`Top: ${activeS[0].value}`, {
      position: 'bottom-right',
      closeButton: true,
    });
  };

  const clear = () => {
    if (isEmpty)
      return toast('Stack is already empty!', {
        position: 'bottom-right',
        closeButton: true,
      });
    activeS.forEach((item, i) => {
      const el = getRef(item.id);
      if (!el) return;
      markExiting(item.id);
      gsap.to(el, {
        opacity: 0,
        scale: 0.4,
        y: -50,
        duration: 0.3,
        delay: i * 0.06,
        ease: 'back.in(1.7)',
        onComplete: () => {
          removeFromState(item.id);
          itemRefs.current.delete(item.id);
          if (i === activeS.length - 1)
            toast('Stack cleared', {
              position: 'bottom-right',
              closeButton: true,
            });
        },
      });
    });
  };


  const handleAlgoChange = (next: string) => {
    setAlgo(next);
    setStack([]);
    itemRefs.current.clear();
    toast(`Switched to ${next}`, {
      position: 'bottom-right',
      closeButton: true,
    });
  };

  const handleOperation = (op: string) => {
    if (op === 'push') {
      const vals = input
        .split(',')
        .map((v) => parseInt(v.trim()))
        .filter((v) => !isNaN(v));
      if (vals.length === 0) {
        return toast('Enter a valid number', {
          position: 'bottom-right',
          closeButton: true,
        });
      }

      const availableSpace = MAX_STACK_SIZE - activeS.length;
      if (vals.length > availableSpace) {
        toast('Stack is full or not enough space!', {
          position: 'bottom-right',
          closeButton: true,
        });
      }

      const toPush = vals.slice(0, availableSpace);
      toPush.forEach((num, index) => {
        setTimeout(() => push(num), index * 150);
      });
      setInput('');
    } else if (op === 'pop') pop();
    else if (op === 'peek') peek();
    else if (op === 'clear') clear();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-audiowide">
      {/* Navbar */}
      <div className="flex flex-row justify-between items-center h-16 px-6 border-0  b">
        <div className="flex items-center gap-3">
          <Input
            className="input w-32"
            placeholder="value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') handleOperation('push');
            }}
          />
          <button
            className="btn-primary"
            onClick={() => handleOperation('push')}
          >
            Push
          </button>
          <button className="btn-neutral" onClick={generateRandom}>
            Generate Random
          </button>
          <div className="w-px h-6 bg-border" />
          <div className="flex gap-2">
            {options
              .filter((o) => o !== 'push')
              .map((op) => (
                <button
                  key={op}
                  className={
                    op === 'pop' || op === 'clear'
                      ? 'btn-danger'
                      : 'btn-neutral'
                  }
                  onClick={() => handleOperation(op)}
                >
                  {op}
                </button>
              ))}
          </div>
        </div>

        <Select value={algo} onValueChange={handleAlgoChange}>
          <SelectTrigger className="w-44 select-trigger">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="select-content">
            <SelectGroup>
              <SelectLabel>Stack</SelectLabel>
              {Object.keys(ALGO_OPTIONS).map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Main canvas */}
      <div className="flex-1 flex canvas border-0 justify-center items-start pt-10 px-8">
        <div className="flex flex-col items-center gap-2">
          {/* TOP label */}
          <span className="text-[11px] font-mono mb-1 muted-text">TOP ↓</span>

          {/* Stack column */}
          <div
            ref={containerRef}
            className="w-72 flex flex-col items-center gap-2 min-h-[480px] max-h-[620px] overflow-y-auto
              border-2 rounded-2xl viz-canvas px-4 py-5"
          >
            {stack.length === 0 && (
              <p className="muted-text font-mono text-sm tracking-widest mt-auto mb-auto">
                — empty —
              </p>
            )}

            {stack.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                }}
                className="w-full flex items-center justify-between rounded-xl viz-item px-4 py-0 flex-shrink-0 border-2 shadow-sm"
                style={{
                  height: 52,
                  opacity: 0,
                  transition: 'background-color 0.15s, box-shadow 0.15s',
                }}
              >
                {/* Index badge */}
                <span className="text-[12px] font-mono w-6 text-center rounded opacity-100">
                  {activeS.length - 1 - idx}
                </span>
                {/* Value */}
                <span className="text-xl font-bold">{item.value}</span>
                {/* Top indicator */}
                <span
                  className="text-[10px] font-mono w-8 text-right font-bold"
                  style={{ color: idx === 0 ? 'var(--brand)' : 'transparent' }}
                >
                  top
                </span>
              </div>
            ))}
          </div>

          {/* BOTTOM label */}
          <span className="text-[11px] font-mono mt-1 muted-text">BOTTOM</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 border-0  flex justify-between items-center panel-bg">
        <span className="text-xs font-mono muted-text">
          {algo.toUpperCase()}
        </span>
        <span className="text-xs font-mono text-brand">
          {activeS.length} / 10 items
        </span>
      </footer>
    </div>
  );
};

export default StackPage;
