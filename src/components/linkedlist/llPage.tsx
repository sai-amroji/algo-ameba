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

type Node = { id: number; value: number; pointer: string };

// Between each node, render this SVG arrow
const NodeArrow = () => (
  <svg className="arrow-svg" width="60" height="20" viewBox="0 0 60 20">
    <defs>
      <marker
        id="arrowhead"
        markerWidth="6"
        markerHeight="6"
        refX="6"
        refY="3"
        orient="auto"
      >
        <polygon points="0 0, 6 3, 0 6" fill="#f87171" />
      </marker>
    </defs>
    <line
      className="arrow-line"
      x1="0"
      y1="10"
      x2="54"
      y2="10"
      stroke="#f87171"
      strokeWidth="2"
      markerEnd="url(#arrowhead)"
    />
  </svg>
);

const LinkedListPage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<string>("linkedlist");
  const [options, setOptions] = useState<string[]>([
    "insertAtHead",
    "deleteAtHead",
    "insertAtTail",
    "insertAtIndex",
    "deleteAtTail",
    "deleteAtIndex",
    "reverse",
    "clear",
  ]);
  const [input, setInput] = useState<string>("");
  const [list, setList] = useState<Node[]>([
    { id: 0, value: 100, pointer: "null" },
    { id: 1, value: 200, pointer: "null" },
  ]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const listContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const nextId = useRef(0);

  const algosOptionMap: Record<string, string[]> = {
    linkedlist: [
      "insertAtHead",
      "deleteAtHead",
      "insertAtTail",
      "insertAtIndex",
      "deleteAtTail",
      "deleteAtIndex",
      "reverse",
      "clear",
    ],
    "doubly linked list": [
      "insertAtHead",
      "deleteAtHead",
      "insertAtTail",
      "insertAtIndex",
      "deleteAtTail",
      "deleteAtIndex",
      "reverse",
      "clear",
    ],
    "circular linked list": [
      "insertAtHead",
      "deleteAtHead",
      "insertAtTail",
      "insertAtIndex",
      "deleteAtTail",
      "deleteAtIndex",
      "reverse",
      "clear",
    ],
    "doubly circular linked list": [
      "insertAtHead",
      "deleteAtHead",
      "insertAtTail",
      "insertAtIndex",
      "deleteAtTail",
      "deleteAtIndex",
      "reverse",
      "clear",
    ],
  };

  const algos = Object.keys(algosOptionMap);

  const { contextSafe } = useGSAP({ scope: listContainerRef });

  const [pos, setPos] = useState<string>("");

  // Animate initial nodes in on component mount
  useEffect(() => {
    const animate = contextSafe(() => {
      list.forEach((item) => {
        const el = itemRefs.current.get(item.id);
        if (el && !removingIds.has(item.id)) {
          gsap.fromTo(
            el,
            { opacity: 0, x: 80, scale: 0.8 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: 0.4,
              ease: "back.out(1.7)",
            },
          );
        }
      });
    });
    animate();
  }, []);

  // When a node enters, animate its arrow drawing in
  const animateArrowIn = (el: SVGLineElement) => {
    const length = el.getTotalLength(); // works on <line> too
    gsap.fromTo(
      el,
      { strokeDasharray: length, strokeDashoffset: length },
      { strokeDashoffset: 0, duration: 0.4, ease: "power2.out" },
    );
  };

  const animateIn = contextSafe((el: HTMLDivElement) => {
    gsap.fromTo(
      el,
      { opacity: 0, x: 80, scale: 0.8 },
      { opacity: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
    );
  });

  // Animate item out, then remove from state
  const animateOut = contextSafe(
    (el: HTMLDivElement, onComplete: () => void) => {
      gsap.to(el, {
        opacity: 0,
        x: 80,
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
    setList([]);
    setRemovingIds(new Set());
    itemRefs.current.clear();
    toast(`Switched to ${algo}`);
  };

  const insert = (value: number, pos: number) => {
    const newNode: Node = { id: nextId.current++, value, pointer: "null" };
    console.log("Inserting", value, "at position", pos);
    if (pos == 0) {
      setList((prev) => [newNode, ...prev]);
    } else if (pos == list.length) {
      setList((prev) => [...prev, newNode]);
    } else {
      setList((prev) => {
        const newList = [...prev];
        newList.splice(pos, 0, newNode);
        return newList;
      });
    }
    setTimeout(() => {
      const el = itemRefs.current.get(newNode.id);
      if (el) {
        animateIn(el);
        // Find arrow next to this node and animate it
        const arrow = el.nextElementSibling?.querySelector(".arrow-line") as SVGLineElement;
        if (arrow) animateArrowIn(arrow);
      }
    }, 50);
  };

  const del = (position: number) => {
    if (position == 0) {
      const target = list[0];
      const el = itemRefs.current.get(target.id);
      if (!el) return;
      setRemovingIds((prev) => new Set(prev).add(target.id));
      animateOut(el, () => {
        itemRefs.current.delete(target.id);
        setList((prev) => prev.filter((item) => item.id !== target.id));
        setRemovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(target.id);
          return newSet;
        });
        toast(`Deleted ${target.value} from head`);
      });
    } else if (position == list.length - 1) {
      const target = list[list.length - 1];
      const el = itemRefs.current.get(target.id);
      if (!el) return;
      setRemovingIds((prev) => new Set(prev).add(target.id));
      animateOut(el, () => {
        itemRefs.current.delete(target.id);
        setList((prev) => prev.filter((item) => item.id !== target.id));
        setRemovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(target.id);
          return newSet;
        });
        toast(`Deleted ${target.value} from tail`);
      });
    } else {
      const target = list[position];
      const el = itemRefs.current.get(target.id);
      if (!el) return;
      setRemovingIds((prev) => new Set(prev).add(target.id));
      animateOut(el, () => {
        itemRefs.current.delete(target.id);
        setList((prev) => prev.filter((item) => item.id !== target.id));
        setRemovingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(target.id);
          return newSet;
        });
        toast(`Deleted ${target.value} from index ${position}`);
      });
    }
  };

  const clear = () => {
    const activeList = list.filter((item) => !removingIds.has(item.id));
    if (activeList.length === 0) {
      toast("Linked List is already empty!");
      return;
    }
    const allIds = new Set(activeList.map((item) => item.id));
    setRemovingIds((prev) => new Set([...prev, ...allIds]));

    activeList.forEach((item, index) => {
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
          // Clear state after last item animates out
          if (index === activeList.length - 1) {
            setList([]);
            setRemovingIds(new Set());
            toast("Linked List cleared");
          }
        },
      });
    });
  };

  const handleOperation = (operation: string) => {
    switch (operation) {
      case "insertAtTail": {
        const num = parseInt(input);
        if (isNaN(num)) {
          toast("Enter a valid number");
          return;
        }
        insert(num, list.length);
        setInput("");
        break;
      }
      case "insertAtHead": {
        const num = parseInt(input);
        if (isNaN(num)) {
          toast("Enter a valid number");
          return;
        }
        insert(num, 0);
        setInput("");
        break;
      }
      case "insertAtIndex": {
        const num = parseInt(input);
        if (isNaN(num)) {
          toast("Enter a valid number");
          return;
        }
        const idx = parseInt(pos);
        if (isNaN(idx) || idx < 0 || idx > list.length) {
          toast("Enter a valid index");
          return;
        }
        insert(num, idx);
        setInput("");
        setPos("");
        break;
      }

      case "deleteAtHead":
        del(0);
        break;
      case "deleteAtTail":
        del(list.length - 1);
        break;
      case "deleteAtIndex": {
        const idx = parseInt(pos);
        if (isNaN(idx) || idx < 0 || idx >= list.length) {
          toast("Enter a valid index");
          return;
        }
        del(idx);
        setPos("");
        break;
      }
      case "reverse":
        setList((prev) => [...prev].reverse());
        toast("Linked List reversed");
        break;
      case "clear":
        clear();
        break;
    }
  };

  const activeListLength = list.filter(
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
            />
            <button
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all whitespace-nowrap shadow-md"
              onClick={() => handleOperation("insertAtTail")}
            >
              Enter
            </button>
            <Input
              className="h-10 bg-slate-800 border-cyan-400 text-white"
              placeholder="Enter position for insertion"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
            />
            <button
              className="h-10 px-5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all whitespace-nowrap shadow-md"
              onClick={() => handleOperation("insertAtIndex")}
            >
              Insert At Position
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
              <SelectValue placeholder="Select LinkedList Type" />
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
          ref={listContainerRef}
          className="list w-full  h-40 mt-80 gap-6 flex justify-start items-center flex-nowrap overflow-x-auto px-6 py-4 border-purple-500 bg-slate-900 shadow-xl"
        >
          {list.map((item, index) => (
            <div key={item.id} className="flex items-center gap-0">
              {/* Node box */}
              <div
                ref={(el) => {
                  if (el) itemRefs.current.set(item.id, el);
                }}
                className="node flex w-32 h-20 border-2 border-purple-400 bg-slate-800
                 text-white justify-around items-center rounded-lg"
              >
                <span className="text-lg font-bold">{item.value}</span>
                <div className="h-full w-px bg-purple-400" /> {/* divider */}
                <span className="text-xs text-slate-400">
                  {index === list.length - 1 ? "null" : "→"}
                </span>
              </div>

              {/* Arrow — don't render after last node */}
              {index < list.length - 1 && <NodeArrow />}
            </div>
          ))}{" "}
        </div>
      </div>

      <footer className="footer mt-12 text-center text-slate-400 pb-6">
        <p>Total Nodes: {activeListLength} / 10</p>
      </footer>
    </div>
  );
};

export default LinkedListPage;
