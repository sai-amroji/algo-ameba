import { useState, useRef, useEffect } from "react";
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


const PRIMARY_GLOW = "0 0 16px var(--brand)";

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
  const MAX_QUEUE_SIZE = 15;
  const active = queue.filter((i) => !removingIds.has(i.id));

  const { contextSafe } = useGSAP({ scope: queueContainerRef });


  
  
  
  useEffect(() => {
    if(queue.length == 0){
      generateRandomArray()
    }
  },[queue])

  
  const generateRandomArray = () => {
    // Clear queue first
    setQueue([]);
    setRemovingIds(new Set());
    itemRefs.current.clear();
    nextId.current = 0;
    
    let num = Math.floor(Math.random() * 8) + 2; // Generate 2-9 items
    while(num > 0) {
      enqueue(Math.floor(Math.random() * 100));
      num -= 1;
    }
  };
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
    if (active.length >= MAX_QUEUE_SIZE) { 
      toast.error(`Queue is full! (max ${MAX_QUEUE_SIZE} items)`); 
      return; 
    }
    const id = nextId.current++;
    setQueue((prev) => toFront ? [{ id, value }, ...prev] : [...prev, { id, value }]);
    setTimeout(() => {
      const el = itemRefs.current.get(id);
      if (el) animateIn(el);
    }, 20);
  };

  const dequeue = (fromBack = false) => {
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
    <div className="min-h-screen bg-background flex flex-col font-audiowide">
      {/* Navbar */}
      <div className="flex flex-row justify-between items-center h-16 px-6 border-0">
        <div className="flex items-center gap-3">
          <Input
            className="input w-32"
            placeholder="value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyUp={(e) => { if (e.key === "Enter") handleOperation("enqueue"); }}
          />
          <button
            className="btn-primary "
            onClick={() => handleOperation("enqueue")}
          >
            Enqueue
          </button>
          <button
            className="btn-neutral "
            onClick={generateRandomArray}
          >
            Generate Random
          </button>
          <div className="w-px h-6 " />
          <div className="flex gap-2 flex-wrap">
            {options.filter((o) => o !== "enqueue" && o !== "enqueueFirst" && o !== "enqueueLast").map((op) => (
              <button
                key={op}
                className={op.includes("dequeue") || op === "clear" ? "btn-danger" : "btn-neutral"}
                onClick={() => handleOperation(op)}
              >
                {op}
              </button>
            ))}
            {(options.includes("enqueueFirst") || options.includes("enqueueLast")) && (
              <>
                <button
                  className="btn-primary"
                  onClick={() => handleOperation("enqueueFirst")}
                >
                  Enqueue Front
                </button>
                <button
                  className="btn-primary "
                  onClick={() => handleOperation("enqueueLast")}
                >
                  Enqueue Back
                </button>
              </>
            )}
          </div>
        </div>

        <Select value={selectedAlgo} onValueChange={handleAlgoChange}>
          <SelectTrigger className="w-44 select-trigger">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent className="select-content">
            <SelectGroup>
              <SelectLabel>Queue</SelectLabel>
              {algos.map((a) => (
                <SelectItem key={a} value={a}>
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
        <div className="flex w-full max-w-5xl justify-between text-[11px] font-mono muted-text px-1">
          <span>FRONT</span>
          <span>BACK</span>
        </div>

        {/* Queue row */}
        <div
          ref={queueContainerRef}
          className="w-full max-w-5xl min-h-[120px] flex items-center gap-3 flex-nowrap overflow-x-auto
            border-2 rounded-2xl viz-canvas px-6 py-5"
        >
          {queue.length === 0 && (
            <p className="muted-text font-mono text-sm tracking-widest mx-auto">— empty —</p>
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
                className="w-20 h-16 rounded-xl viz-item flex flex-col items-center justify-center gap-0.5 border-2 font-bold shadow-sm"
                style={{ transition: "background-color 0.15s, box-shadow 0.15s" }}
              >
                <span className="text-xl leading-none">{item.value}</span>
              </div>
              {/* Index label */}
              <span className="text-[10px] font-mono mt-1 muted-text">
                [{idx}]
              </span>
            </div>
          ))}
        </div>

        {/* Arrows label row */}
        {queue.length > 0 && (
          <div className="text-[10px] font-mono muted-text tracking-widest">
            ← dequeue from front &nbsp;&nbsp;|&nbsp;&nbsp; enqueue to back →
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-8 py-4 border-t flex justify-between items-center panel-bg">
        <span className="text-xs font-mono muted-text">{selectedAlgo.toUpperCase()}</span>
        <span className="text-xs font-mono text-brand">
          {activeLen} / 10 items
        </span>
      </footer>
    </div>
  );
};

export default QueuePage;
