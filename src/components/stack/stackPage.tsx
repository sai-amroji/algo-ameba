import { useState, useRef, useCallback } from "react";
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

// ── Types ────────────────────────────────────────────────────────────────────
type Status = "popping" | "pushing" | "about to push";
type StackItem = { id: number; value: number; status: Status };

// ── Constants ────────────────────────────────────────────────────────────────
let uid = 0;
const makeItem = (value: number): StackItem => ({
  id: ++uid,
  value,
  status: "pushing",
});

const ALGO_OPTIONS: Record<string, string[]> = {
  stack: ["push", "pop", "peek", "clear"],
  "monotonic stack": ["push", "pop", "peek", "clear"],
};

// ── Animations ───────────────────────────────────────────────────────────────
const animateIn = (el: HTMLDivElement) =>
  gsap.fromTo(
    el,
    {
      opacity: 0,
      y: -190,
      scale: 0.8,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: "back.out(1.7)",
    },
  );

const animateOut = (el: HTMLDivElement, onComplete: () => void) =>
  gsap.to(el, {
    opacity: 0,
    y: -190,
    scale: 0.8,
    duration: 0.4,
    ease: "power2.in",
    onComplete,
  });

const animatePeek = (el: HTMLDivElement) =>
  gsap.fromTo(
    el,
    { scale: 1 },
    {
      scale: 1.15,
      boxShadow: "0 0 24px rgba(34,211,238,0.9)",
      duration: 0.25,
      yoyo: true,
      repeat: 1,
    },
  );

// ── Component ────────────────────────────────────────────────────────────────
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

  // ── Helpers ────────────────────────────────────────────────────────────────
  const getRef = (id: number) => itemRefs.current.get(id);

  const removeFromState = (id: number) =>
    setStack((prev) => prev.filter((i) => i.id !== id));

  const markExiting = (id: number) =>
    setStack((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: "popping" } : i)),
    );

  // ── Operations ─────────────────────────────────────────────────────────────
  const push = (value: number) => {
    if (isFull) return toast("Stack is full!");
    const item = makeItem(value);
    setStack((prev) => [item, ...prev]);
    setTimeout(() => {
      const el = getRef(item.id);
      if (el) animateIn(el);
    }, 20);
  };

  const pop = (fromBack = false) => {
    if (isEmpty) return toast("Stack is empty!");
    const target = fromBack ? activeS[activeS.length - 1] : activeS[0];
    const el = getRef(target.id);
    if (!el) return;
    markExiting(target.id);
    animateOut(el, () => {
      removeFromState(target.id);
      itemRefs.current.delete(target.id);
      toast(`Popped ${target.value} from ${fromBack ? "back" : "front"}`);
    });
  };

  const peek = () => {
    if (isEmpty) return toast("Stack is empty!");
    const el = getRef(activeS[0].id);
    if (el) animatePeek(el);
    toast(`Top: ${activeS[0].value}`);
  };

  const clear = () => {
    if (isEmpty) return toast("Stack is already empty!");
    activeS.forEach((item, i) => {
      const el = getRef(item.id);
      if (!el) return;
      markExiting(item.id);
      gsap.to(el, {
        opacity: 0,
        scale: 0.4,
        y: -150,
        stagger: {
          each: 0.05,
          grid: "auto",
          from: "start",
        },
        duration: 3,
        delay: i * 0.06,
        ease: "back.in(1.7)",
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
      push(num);
      setInput("");
    } else if (op === "pop") pop();
    else if (op === "peek") peek();
    else if (op === "clear") clear();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Navbar */}
      <div className="flex flex-row justify-between items-center h-16 px-6 py-2 gap-6">
        <div className="flex items-center gap-3">
          <Input
            className="h-10 bg-slate-800 border-cyan-400 text-white"
            placeholder="Enter number"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleOperation("push ")}
          />
          <button
            className="h-10 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md"
            onClick={() => handleOperation("push")}
          >
            Enter
          </button>
          <div className="flex gap-2">
            {options.map((op) => (
              <button
                key={op}
                className="h-10 px-5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all font-semibold shadow-md capitalize"
                onClick={() => handleOperation(op)}
              >
                {op}
              </button>
            ))}
          </div>
        </div>

        <Select value={algo} onValueChange={handleAlgoChange}>
          <SelectTrigger className="w-44 bg-slate-800 border-cyan-400 text-white h-10 hover:bg-slate-700 transition-colors">
            <SelectValue placeholder="Select Queue Type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-cyan-400 text-white">
            <SelectGroup>
              <SelectLabel>Algorithms</SelectLabel>
              {Object.keys(ALGO_OPTIONS).map((a) => (
                <SelectItem
                  key={a}
                  value={a}
                  className="hover:bg-cyan-600 focus:bg-cyan-600 capitalize"
                >
                  {a}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Queue Canvas */}
      <div className="flex justify-center items-center py-6">
        <div
          ref={containerRef}
          className="w-90 h-[800px] mt-10 flex flex-col justify-end items-center gap-3 overflow-y-auto py-6 px-4 border-2 border-t-0 border-purple-500 bg-slate-900 rounded-l-xl rounded-r-xl rounded-b-xl  shadow-xl"
        >
          {stack.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
              }}
              className="w-80 h-32 border-2 border-cyan-400 flex flex-col justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md text-white font-bold text-lg shadow-lg flex-shrink-0"
              style={{ opacity: 0 }}
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-400 pb-6">
        Stack Size: {activeS.length} / 10
      </footer>
    </div>
  );
};

export default StackPage;
