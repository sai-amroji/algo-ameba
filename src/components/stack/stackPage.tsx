import { useState, useRef } from "react";
import { Input } from "../ui/input.tsx";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup.ts";
import { toast } from "sonner";

type Status = "popping" | "pushing";
type StackItem = { id: number; value: number; status: Status };

let uid = 0;
const makeItem = (value: number): StackItem => ({ id: ++uid, value, status: "pushing" });

const ALGO_OPTIONS: Record<string, string[]> = {
  stack: ["push", "pop", "peek", "clear"],
  "monotonic stack": ["push", "pop", "peek", "clear"],
};

const PRIMARY_GLOW = "0 0 16px rgba(0,255,17,0.6)";

const StackPage = () => {
  const [algo, setAlgo] = useState("stack");
  const [input, setInput] = useState("");
  const [stack, setStack] = useState<StackItem[]>([]);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP({ scope: containerRef });

  const options = ALGO_OPTIONS[algo];
  const activeS = stack.filter((i) => i.status === "pushing");
  const isFull = activeS.length >= 10;
  const isEmpty = activeS.length === 0;

  const getRef = (id: number) => itemRefs.current.get(id);
  const removeFromState = (id: number) => setStack((prev) => prev.filter((i) => i.id !== id));
  const markExiting = (id: number) =>
    setStack((prev) => prev.map((i) => (i.id === id ? { ...i, status: "popping" as Status } : i)));

  const push = (value: number) => {
    if (isFull) return toast("Stack is full!");
    const item = makeItem(value);
    setStack((prev) => [item, ...prev]);
    setTimeout(() => {
      const el = getRef(item.id);
      if (!el) return;
      gsap.fromTo(el,
        { opacity: 0, y: -60, scale: 0.85 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" }
      );
    }, 20);
  };

  const pop = () => {
    if (isEmpty) return toast("Stack is empty!");
    const target = activeS[0];
    const el = getRef(target.id);
    if (!el) return;
    markExiting(target.id);
    gsap.to(el, {
      opacity: 0, y: -60, scale: 0.85, duration: 0.38, ease: "power2.in",
      onComplete: () => {
        removeFromState(target.id);
        itemRefs.current.delete(target.id);
        toast(`Popped ${target.value}`);
      },
    });
  };

  const peek = () => {
    if (isEmpty) return toast("Stack is empty!");
    const el = getRef(activeS[0].id);
    if (el) {
      gsap.fromTo(el,
        { boxShadow: "0 0 0px rgba(0,255,17,0)" },
        { boxShadow: PRIMARY_GLOW, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" }
      );
    }
    toast(`Top: ${activeS[0].value}`);
  };

  const clear = () => {
    if (isEmpty) return toast("Stack is already empty!");
    activeS.forEach((item, i) => {
      const el = getRef(item.id);
      if (!el) return;
      markExiting(item.id);
      gsap.to(el, {
        opacity: 0, scale: 0.4, y: -50,
        duration: 0.3, delay: i * 0.06, ease: "back.in(1.7)",
        onComplete: () => {
          removeFromState(item.id);
          itemRefs.current.delete(item.id);
          if (i === activeS.length - 1) toast("Stack cleared");
        },
      });
    });
  };

  const handleAlgoChange = (next: string) => {
    setAlgo(next);
    setStack([]);
    itemRefs.current.clear();
    toast(`Switched to ${next}`);
  };

  const handleOperation = (op: string) => {
    if (op === "push") {
      const num = parseInt(input);
      if (isNaN(num)) return toast("Enter a valid number");
      push(num); setInput("");
    } else if (op === "pop") pop();
    else if (op === "peek") peek();
    else if (op === "clear") clear();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Navbar */}
      <div className="flex flex-row justify-between items-center h-16 px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Input
            className="h-9 w-32 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-0 focus-visible:border-[#00ff11] font-mono text-sm"
            placeholder="value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => { if (e.key === "Enter") handleOperation("push"); }}
          />
          <button
            className="h-9 px-4 rounded-lg bg-slate-800 border border-[#00ff11]/50 text-[#00ff11] font-mono text-sm hover:bg-[#00ff11]/10 hover:border-[#00ff11] transition-all"
            onClick={() => handleOperation("push")}
          >
            Push
          </button>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex gap-2">
            {options.filter((o) => o !== "push").map((op) => (
              <button
                key={op}
                className="h-9 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm hover:border-cyan-500 hover:text-cyan-400 transition-all capitalize"
                onClick={() => handleOperation(op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        <Select value={algo} onValueChange={handleAlgoChange}>
          <SelectTrigger className="w-44 bg-slate-900 border-slate-700 text-white h-9 hover:border-slate-500 transition-colors font-mono text-sm">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectGroup>
              <SelectLabel className="text-slate-500 font-mono text-xs">Stack Type</SelectLabel>
              {Object.keys(ALGO_OPTIONS).map((a) => (
                <SelectItem key={a} value={a} className="capitalize font-mono text-sm focus:bg-slate-800 focus:text-white">
                  {a}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Main canvas */}
      <div className="flex-1 flex justify-center items-start pt-10 px-8">
        <div className="flex flex-col items-center gap-2">

          {/* TOP label */}
          <span className="text-[11px] font-mono mb-1 text-slate-500">TOP ↓</span>

          {/* Stack column */}
          <div
            ref={containerRef}
            className="w-72 flex flex-col items-center gap-2 min-h-[480px] max-h-[620px] overflow-y-auto
              border-y-2 border-slate-800 bg-slate-900/40 px-4 py-5"
          >
            {stack.length === 0 && (
              <p className="text-slate-600 font-mono text-sm tracking-widest mt-auto mb-auto">— empty —</p>
            )}

            {stack.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
                className="w-full flex items-center justify-between rounded-xl bg-cyan-500 px-4 py-0 flex-shrink-0 border-2 border-transparent shadow-[0_0_10px_rgba(6,182,212,0.4)] text-black"
                style={{
                  height: 52,
                  opacity: 0,
                  transition: "background-color 0.15s, box-shadow 0.15s",
                }}
              >
                {/* Index badge */}
                <span className="text-[10px] font-mono w-6 text-center rounded text-black/50">
                  {activeS.length - 1 - idx}
                </span>
                {/* Value */}
                <span className="text-xl font-bold">{item.value}</span>
                {/* Top indicator */}
                <span className="text-[10px] font-mono w-8 text-right font-bold"
                  style={{ color: idx === 0 ? "#00ff11" : "transparent" }}>
                  top
                </span>
              </div>
            ))}
          </div>

          {/* BOTTOM label */}
          <span className="text-[11px] font-mono mt-1 text-slate-500">BOTTOM</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-slate-800 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500">{algo.toUpperCase()}</span>
        <span className="text-xs font-mono text-cyan-500">
          {activeS.length} / 10 items
        </span>
      </footer>
    </div>
  );
};

export default StackPage;
