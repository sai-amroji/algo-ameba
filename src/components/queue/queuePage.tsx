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

const QueuePage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>("queue");
  const [options, setOptions] = useState<string[]>([
    "enqueue",
    "dequeue",
    "peek",
    "clear",
  ]);
  const [input, setInput] = useState<string>("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const queueContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const nextId = useRef(0);

  const algosOptionMap: Record<string, string[]> = {
    deque: [
      "enqueueFirst",
      "enqueueLast",
      "dequeueFirst",
      "dequeueLast",
      "peek",
      "clear",
    ],
    "monotonic queue": [
      "enqueueFirst",
      "enqueueLast",
      "dequeueFirst",
      "dequeueLast",
      "peek",
      "clear",
    ],
    "circular queue": ["enqueue", "dequeue", "peek", "clear"],
    queue: ["enqueue", "dequeue", "peek", "clear"],
  };
  const algos = Object.keys(algosOptionMap);

  const { contextSafe } = useGSAP({ scope: queueContainerRef });

  // Animate new items in after they're rendered
  const animateIn = contextSafe((el: HTMLDivElement, fromRight: boolean) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: fromRight ? 80 : -80, scale: 0.8 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
    );
  });

  // Animate item out, then remove from state
  const animateOut = contextSafe(
    (el: HTMLDivElement, toRight: boolean, onComplete: () => void) => {
      gsap.to(el, {
        opacity: 0,
        x: toRight ? 80 : -80,
        scale: 0.8,
        duration: 0.35,
        ease: "power2.in",
        onComplete,
      });
    },
  );

  const handleAlgoChange = (algo: string) => {
    setSelectedAlgo(algo);
    setOptions(algosOptionMap[algo]);
    setQueue([]);
    setRemovingIds(new Set());
    itemRefs.current.clear();
    toast(`Switched to ${algo}`);
  };

  const enqueue = (value: number, toFront: boolean = false) => {
    if (queue.length >= 10) {
      toast("Queue is full!");
      return;
    }
    const id = nextId.current++;
    const newItem: QueueItem = { id, value };

    setQueue((prev) => (toFront ? [newItem, ...prev] : [...prev, newItem]));

    // Animate in after render via a small timeout to let React paint
    setTimeout(() => {
      const el = itemRefs.current.get(id);
      if (el) animateIn(el, !toFront);
    }, 20);
  };

  const dequeue = (fromBack: boolean = false) => {
    // Filter out any items currently being removed
    const activeQueue = queue.filter((item) => !removingIds.has(item.id));
    if (activeQueue.length === 0) {
      toast("Queue is empty!");
      return;
    }

    const target = fromBack
      ? activeQueue[activeQueue.length - 1]
      : activeQueue[0];

    const el = itemRefs.current.get(target.id);
    if (!el) return;

    setRemovingIds((prev) => new Set(prev).add(target.id));

    animateOut(el, fromBack, () => {
      setQueue((prev) => prev.filter((item) => item.id !== target.id));
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(target.id);
        return next;
      });
      itemRefs.current.delete(target.id);
      toast(`Dequeued ${target.value} from ${fromBack ? "back" : "front"}`);
    });
  };

  const peek = () => {
    const active = queue.filter((item) => !removingIds.has(item.id));
    if (active.length === 0) {
      toast("Queue is empty!");
      return;
    }
    const frontEl = itemRefs.current.get(active[0].id);
    if (frontEl) {
      gsap.fromTo(
        frontEl,
        { scale: 1, boxShadow: "0 0 0px rgba(34,211,238,0)" },
        {
          scale: 1.15,
          boxShadow: "0 0 24px rgba(34,211,238,0.9)",
          duration: 0.25,
          yoyo: true,
          repeat: 1,
          ease: "power1.inOut",
        },
      );
    }
    toast(`Front element: ${active[0].value}`);
  };

  const clear = () => {
    const activeQueue = queue.filter((item) => !removingIds.has(item.id));
    if (activeQueue.length === 0) {
      toast("Queue is already empty!");
      return;
    }
    const allIds = new Set(activeQueue.map((item) => item.id));
    setRemovingIds((prev) => new Set([...prev, ...allIds]));

    activeQueue.forEach((item, index) => {
      const el = itemRefs.current.get(item.id);
      if (!el) return;
      gsap.to(el, {
        opacity: 0,
        scale: 0.4,
        y: -30,
        duration: 0.3,
        delay: index * 0.06,
        ease: "back.in(1.7)",
        onComplete: () => {
          itemRefs.current.delete(item.id);
          if (index === activeQueue.length - 1) {
            setQueue([]);
            setRemovingIds(new Set());
            toast("Queue cleared");
          }
        },
      });
    });
  };

  const handleOperation = (operation: string) => {
    switch (operation) {
      case "enqueue":
      case "enqueueLast": {
        const num = parseInt(input);
        if (isNaN(num)) {
          toast("Enter a valid number");
          return;
        }
        enqueue(num, false);
        setInput("");
        break;
      }
      case "enqueueFirst": {
        const num = parseInt(input);
        if (isNaN(num)) {
          toast("Enter a valid number");
          return;
        }
        enqueue(num, true);
        setInput("");
        break;
      }
      case "dequeue":
      case "dequeueFirst":
        dequeue(false);
        break;
      case "dequeueLast":
        dequeue(true);
        break;
      case "peek":
        peek();
        break;
      case "clear":
        clear();
        break;
    }
  };

  const activeQueueLength = queue.filter(
    (item) => !removingIds.has(item.id),
  ).length;

  return (
    <div>
      <div className="flex nav-bar flex-row justify-between items-center h-16 px-6 py-2 gap-6">
        <div className="flex justify-start items-center gap-4 nav-start-items">
          <div className="flex gap-3 items-center">
            <Input
              className="h-10 bg-slate-800 border-cyan-400 text-white"
              placeholder="Enter number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") handleOperation("enqueue");
              }}
            />
            <button
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all whitespace-nowrap shadow-md"
              onClick={() => handleOperation("enqueue")}
            >
              Enter
            </button>
            <div className="flex gap-2">
              {options.map((option) => (
                <button
                  key={option}
                  className="h-10 px-5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all whitespace-nowrap font-semibold shadow-md capitalize"
                  onClick={() => handleOperation(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="nav-end-items">
          <Select value={selectedAlgo} onValueChange={handleAlgoChange}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-cyan-400 text-white h-10 hover:bg-slate-700 transition-colors">
              <SelectValue placeholder="Select Queue Type" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-cyan-400 text-white">
              <SelectGroup>
                <SelectLabel>Algorithms</SelectLabel>
                {algos.map((algo) => (
                  <SelectItem
                    key={algo}
                    value={algo}
                    className="hover:bg-cyan-600 focus:bg-cyan-600 capitalize"
                  >
                    {algo}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="alog-screen h-full w-full flex justify-center items-center px-6">
        <div
          ref={queueContainerRef}
          className="queue w-full max-w-6xl h-40 m-80 flex justify-start items-center gap-3 flex-nowrap overflow-x-auto px-6 py-4 border-y-2 border-purple-500 bg-slate-900 shadow-xl"
        >
          {queue.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemRefs.current.set(item.id, el);
              }}
              className="queue-item w-24 h-32 border-2 border-cyan-400 flex justify-center items-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-md text-white font-bold text-lg shadow-lg flex-shrink-0"
              style={{ opacity: 0 }} 
            >
              {item.value}
            </div>
          ))}
        </div>
      </div>

      <footer className="footer mt-12 text-center text-slate-400 pb-6">
        <p>Queue Size: {activeQueueLength} / 10</p>
      </footer>
    </div>
  );
};

export default QueuePage;
