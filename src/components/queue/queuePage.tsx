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

type QueueItem = { id: number; value: number };

const algosOptionMap: Record<string, string[]> = {
  queue: ["enqueue", "dequeue", "peek", "clear"],
  deque: ["enqueueFirst", "enqueueLast", "dequeueFirst", "dequeueLast", "peek", "clear"],
  "monotonic queue": ["enqueueFirst", "enqueueLast", "dequeueFirst", "dequeueLast", "peek", "clear"],
  "circular queue": ["enqueue", "dequeue", "peek", "clear"],
};


const PRIMARY_GLOW = "0 0 16px rgba(0,255,17,0.6)";

const QueuePage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState("queue");
  const [input, setInput] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const queueContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const nextId = useRef(0);

  const options = algosOptionMap[selectedAlgo];
  const algos = Object.keys(algosOptionMap);

  const { contextSafe } = useGSAP({ scope: queueContainerRef });

  const animateIn = contextSafe((el: HTMLDivElement) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: 80, scale: 0.85 },
      { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: "back.out(1.7)" },
    );
  });

  const animateOut = contextSafe((el: HTMLDivElement, onComplete: () => void) => {
    gsap.to(el, {
      opacity: 0,
      x: -80,
      scale: 0.85,
      duration: 0.35,
      ease: "power2.in",
      onComplete,
    });
  });

  const handleAlgoChange = (algo: string) => {
    setSelectedAlgo(algo);
    setQueue([]);
    setRemovingIds(new Set());
    itemRefs.current.clear();
    toast(`Switched to ${algo}`);
  };

  const enqueue = (value: number, toFront = false) => {
    if (queue.length >= 10) { toast("Queue is full!"); return; }
    const id = nextId.current++;
    setQueue((prev) => toFront ? [{ id, value }, ...prev] : [...prev, { id, value }]);
    setTimeout(() => {
      const el = itemRefs.current.get(id);
      if (el) animateIn(el);
    }, 20);
  };

  const dequeue = (fromBack = false) => {
    const active = queue.filter((i) => !removingIds.has(i.id));
    if (active.length === 0) { toast("Queue is empty!"); return; }
    const target = fromBack ? active[active.length - 1] : active[0];
    const el = itemRefs.current.get(target.id);
    if (!el) return;
    setRemovingIds((prev) => new Set(prev).add(target.id));
    animateOut(el, () => {
      setQueue((prev) => prev.filter((i) => i.id !== target.id));
      setRemovingIds((prev) => { const n = new Set(prev); n.delete(target.id); return n; });
      itemRefs.current.delete(target.id);
      toast(`Dequeued ${target.value} from ${fromBack ? "back" : "front"}`);
    });
  };

  const peek = () => {
    const active = queue.filter((i) => !removingIds.has(i.id));
    if (active.length === 0) { toast("Queue is empty!"); return; }
    const el = itemRefs.current.get(active[0].id);
    if (el) {
      gsap.fromTo(
        el,
        { boxShadow: "0 0 0px rgba(0,255,17,0)" },
        { boxShadow: PRIMARY_GLOW, duration: 0.25, yoyo: true, repeat: 1, ease: "power1.inOut" },
      );
    }
    toast(`Front: ${active[0].value}`);
  };

  const clear = () => {
    const active = queue.filter((i) => !removingIds.has(i.id));
    if (active.length === 0) { toast("Queue is already empty!"); return; }
    const allIds = new Set(active.map((i) => i.id));
    setRemovingIds((prev) => new Set([...prev, ...allIds]));
    active.forEach((item, idx) => {
      const el = itemRefs.current.get(item.id);
      if (!el) return;
      gsap.to(el, {
        opacity: 0, scale: 0.4, y: -30,
        duration: 0.3, delay: idx * 0.06, ease: "back.in(1.7)",
        onComplete: () => {
          itemRefs.current.delete(item.id);
          if (idx === active.length - 1) {
            setQueue([]); setRemovingIds(new Set()); toast("Queue cleared");
          }
        },
      });
    });
  };

  const handleOperation = (op: string) => {
    switch (op) {
      case "enqueue":
      case "enqueueLast": {
        const n = parseInt(input);
        if (isNaN(n)) { toast("Enter a valid number"); return; }
        enqueue(n, false); setInput(""); break;
      }
      case "enqueueFirst": {
        const n = parseInt(input);
        if (isNaN(n)) { toast("Enter a valid number"); return; }
        enqueue(n, true); setInput(""); break;
      }
      case "dequeue": case "dequeueFirst": dequeue(false); break;
      case "dequeueLast": dequeue(true); break;
      case "peek": peek(); break;
      case "clear": clear(); break;
    }
  };

  const activeLen = queue.filter((i) => !removingIds.has(i.id)).length;

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
            onKeyUp={(e) => { if (e.key === "Enter") handleOperation("enqueue"); }}
          />
          <button
            className="h-9 px-4 rounded-lg bg-slate-800 border border-[#00ff11]/50 text-[#00ff11] font-mono text-sm hover:bg-[#00ff11]/10 hover:border-[#00ff11] transition-all"
            onClick={() => handleOperation("enqueue")}
          >
            Enqueue
          </button>
          <div className="w-px h-6 bg-slate-800" />
          <div className="flex gap-2 flex-wrap">
            {options.filter((o) => o !== "enqueue" && o !== "enqueueFirst" && o !== "enqueueLast").map((op) => (
              <button
                key={op}
                className="h-9 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-mono text-sm hover:border-cyan-500 hover:text-cyan-400 transition-all capitalize"
                onClick={() => handleOperation(op)}
              >
                {op}
              </button>
            ))}
            {(options.includes("enqueueFirst") || options.includes("enqueueLast")) && (
              <>
                <button
                  className="h-9 px-4 rounded-lg bg-slate-800 border border-[#00ff11]/50 text-[#00ff11] font-mono text-sm hover:bg-[#00ff11]/10 transition-all"
                  onClick={() => handleOperation("enqueueFirst")}
                >
                  Enqueue Front
                </button>
                <button
                  className="h-9 px-4 rounded-lg bg-slate-800 border border-[#00ff11]/50 text-[#00ff11] font-mono text-sm hover:bg-[#00ff11]/10 transition-all"
                  onClick={() => handleOperation("enqueueLast")}
                >
                  Enqueue Back
                </button>
              </>
            )}
          </div>
        </div>

        <Select value={selectedAlgo} onValueChange={handleAlgoChange}>
          <SelectTrigger className="w-44 bg-slate-900 border-slate-700 text-white h-9 hover:border-slate-500 transition-colors font-mono text-sm">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectGroup>
              <SelectLabel className="text-slate-500 font-mono text-xs">Queue Type</SelectLabel>
              {algos.map((a) => (
                <SelectItem key={a} value={a} className="capitalize font-mono text-sm focus:bg-slate-800 focus:text-white">
                  {a}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Main canvas */}
      <div className="flex-1 flex flex-col justify-center items-center px-8 py-6 gap-4">

        {/* Direction label */}
        <div className="flex w-full max-w-5xl justify-between text-[11px] font-mono text-slate-500 px-1">
          <span>FRONT</span>
          <span>BACK</span>
        </div>

        {/* Queue row */}
        <div
          ref={queueContainerRef}
          className="w-full max-w-5xl min-h-[120px] flex items-center gap-3 flex-nowrap overflow-x-auto
            border-y-2 border-slate-800 bg-slate-900/40 px-6 py-5"
        >
          {queue.length === 0 && (
            <p className="text-slate-600 font-mono text-sm tracking-widest mx-auto">— empty —</p>
          )}

          {queue.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
              className="flex flex-col items-center flex-shrink-0"
              style={{ opacity: 0 }}
            >
              {/* Card */}
              <div
                className="w-20 h-16 rounded-xl bg-cyan-500 flex flex-col items-center justify-center gap-0.5 border-2 border-transparent font-bold text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                style={{ transition: "background-color 0.15s, box-shadow 0.15s" }}
              >
                <span className="text-xl leading-none">{item.value}</span>
              </div>
              {/* Index label */}
              <span className="text-[10px] font-mono mt-1 text-slate-500">
                [{idx}]
              </span>
            </div>
          ))}
        </div>

        {/* Arrows label row */}
        {queue.length > 0 && (
          <div className="text-[10px] font-mono text-slate-600 tracking-widest">
            ← dequeue from front &nbsp;&nbsp;|&nbsp;&nbsp; enqueue to back →
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 border-t border-slate-800 flex justify-between items-center">
        <span className="text-xs font-mono text-slate-500">{selectedAlgo.toUpperCase()}</span>
        <span className="text-xs font-mono text-cyan-500">
          {activeLen} / 10 items
        </span>
      </footer>
    </div>
  );
};

export default QueuePage;
