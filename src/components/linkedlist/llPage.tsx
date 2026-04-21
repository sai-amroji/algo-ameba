import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input.tsx";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select.tsx";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup.ts";
import { toast } from "sonner";
import { Toaster } from "sonner";

type LLNode = { id: number; value: number; addr: number };

// Prime-ish random address the user asked for
const genAddr = () => Math.floor(Math.random() * 100 + 17 * Math.random());

const SLOT = 196; // 144px node + 52px arrow gap

const LinkedListPage = () => {
  const [selectedAlgo, setSelectedAlgo] = useState("linked list");
  const [input, setInput]   = useState("");
  const [pos,   setPos]     = useState("");

  const [list, setList] = useState<LLNode[]>(() => [
    { id: 0, value: 10, addr: genAddr() },
    { id: 1, value: 20, addr: genAddr() },
    { id: 2, value: 30, addr: genAddr() },
  ]);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const screenRef        = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const headRef          = useRef<HTMLDivElement>(null);
  const newNodeRef       = useRef<HTMLDivElement>(null);
  const newNodeValRef    = useRef<HTMLSpanElement>(null);
  const newNodePtrRef    = useRef<HTMLSpanElement>(null);

  const itemRefs  = useRef<Map<number, HTMLDivElement>>(new Map());
  const arrowRefs = useRef<Map<number, SVGLineElement>>(new Map());
  const nextId    = useRef(3);
  const pending   = useRef<Set<number>>(new Set());

  const algosMap: Record<string, string[]> = {
    "linked list":          ["insertAtHead","insertAtTail","insertAtIndex","deleteAtHead","deleteAtTail","deleteAtIndex","reverse","clear"],
    "doubly linked list":   ["insertAtHead","insertAtTail","insertAtIndex","deleteAtHead","deleteAtTail","deleteAtIndex","reverse","clear"],
    "circular linked list": ["insertAtHead","insertAtTail","insertAtIndex","deleteAtHead","deleteAtTail","deleteAtIndex","reverse","clear"],
  };

  /* ── GSAP context ───────────────────────────────────────────────────── */
  const { contextSafe } = useGSAP({ scope: screenRef });

  /* node entrance */
  const animNodeIn = contextSafe((el: HTMLDivElement) => {
    gsap.fromTo(el,
      { opacity: 0, y: -48, scale: 0.75 },
      { opacity: 1, y: 0,   scale: 1, duration: 0.75, ease: "back.out(1.6)" }
    );
  });

  /* arrow draw-in via DrawSVGPlugin */
  const animArrowIn = contextSafe((line: SVGLineElement) => {
    gsap.fromTo(line,
      { drawSVG: "0% 0%" },
      { drawSVG: "0% 100%", duration: 0.7, ease: "power2.out" }
    );
  });

  /* run entrance anims after React commits new nodes */
  useEffect(() => {
    if (!pending.current.size) return;
    pending.current.forEach((id) => {
      const el   = itemRefs.current.get(id);
      const line = arrowRefs.current.get(id);
      if (el)   animNodeIn(el);
      if (line) animArrowIn(line);
    });
    if (headRef.current)
      gsap.fromTo(headRef.current, { scale: 1.12 }, { scale: 1, duration: 0.55, ease: "elastic.out(1,0.5)" });
    pending.current.clear();
  }, [list]);

  /* ── INSERT ─────────────────────────────────────────────────────────── */
  const insert = contextSafe((value: number, position: number) => {
    const newNode: LLNode = { id: nextId.current++, value, addr: genAddr() };

    if (newNodeValRef.current) newNodeValRef.current.textContent = String(value);
    if (newNodePtrRef.current)
      newNodePtrRef.current.textContent =
        position < list.length ? String(list[position].addr) : "NULL";

    gsap.set(newNodeRef.current, { opacity: 1, x: 0, y: 0 });

    const commit = () => {
      gsap.set(newNodeRef.current, { opacity: 0, x: 0, y: 0 });
      pending.current.add(newNode.id);
    };

    if (position === 0) {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .addLabel("lift")
        .to(newNodeRef.current,       { y: -120, duration: 0.6 }, "lift")
        .to(listContainerRef.current, { x: SLOT,  duration: 0.7 }, "lift+=0.1")
        .addLabel("drop", ">")
        .to(newNodeRef.current, {
          y: 0, duration: 0.7, ease: "back.out(1.5)",
          onComplete: () => {
            gsap.set(listContainerRef.current, { x: 0 });
            commit();
            setList((p) => [newNode, ...p]);
            toast.success(`Inserted ${value} at head`);
          },
        }, "drop");

    } else if (position === list.length) {
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .addLabel("lift")
        .to(newNodeRef.current, { y: -120, duration: 0.6 }, "lift")
        .addLabel("fly", ">")
        .to(newNodeRef.current, { x: (position +1)* SLOT, duration:2.75, ease: "power2.inOut" }, "fly")
        .addLabel("drop", ">")
        .to(newNodeRef.current, {
          y: 0, duration: 1.7, ease: "back.out(1.5)",
          onComplete: () => { commit(); setList((p) => [...p, newNode]); toast.success(`Inserted ${value} at tail`); },
        }, "drop");

    } else {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
      tl.addLabel("lift")
        .to(newNodeRef.current, { y: -120, duration: 0.6, ease: "power2.out" }, "lift");
      for (let i = position; i < list.length; i++) {
        const el = itemRefs.current.get(list[i].id);
        if (el) tl.to(el, { x: "+=196", duration: 0.65 }, "lift");
      }
      tl.addLabel("fly", ">")
        .to(newNodeRef.current, { x: position * SLOT, duration: 0.6 }, "fly")
        .addLabel("drop", ">")
        .to(newNodeRef.current, {
          y: 0, duration: 0.7, ease: "back.out(1.5)",
          onComplete: () => {
            for (let i = position; i < list.length; i++) {
              const el = itemRefs.current.get(list[i].id);
              if (el) gsap.set(el, { x: 0 });
            }
            commit();
            setList((p) => { const n = [...p]; n.splice(position, 0, newNode); return n; });
            toast.success(`Inserted ${value} at index ${position}`);
          },
        }, "drop");
    }
  });

  /* ── DELETE ─────────────────────────────────────────────────────────── */
  const del = contextSafe((position: number) => {
    if (!list.length) { toast.error("List is empty"); return; }
    const target = list[position];
    const el     = itemRefs.current.get(target.id);
    if (!el) return;

    const removeFromState = () => {
      setRemovingIds((p) => new Set(p).add(target.id));
      itemRefs.current.delete(target.id);
      arrowRefs.current.delete(target.id);
      setList((p) => p.filter((n) => n.id !== target.id));
      setRemovingIds((p) => { const s = new Set(p); s.delete(target.id); return s; });
    };

    if (position === 0) {
      // highlight → pause → HEAD nudges (pointer moving) → fly up
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .addLabel("mark")
        .to(el, { borderColor: "#ef4444", boxShadow: "0 0 0 2px #ef444466", duration: 0.5 }, "mark")
        .addLabel("pause", "+=0.55")
        .addLabel("headNudge", "pause")
        .to(headRef.current, { x: 14, duration: 0.2 }, "headNudge")
        .to(headRef.current, { x: 0,  duration: 0.2 }, ">")
        .addLabel("exit", ">+=0.08")
        .to(el, {
          y: -80, opacity: 0, scale: 0.65, duration: 0.65, ease: "power3.in",
          onComplete: () => { removeFromState(); toast.success(`Deleted ${target.value} from head`); },
        }, "exit");

    } else if (position === list.length - 1) {
      // highlight tail → pause → prev flashes green (→ NULL) → tail falls down
      const prevEl = itemRefs.current.get(list[position - 1].id) ?? null;
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .addLabel("markTail")
        .to(el, { borderColor: "#ef4444", boxShadow: "0 0 0 2px #ef444466", duration: 0.5 }, "markTail")
        .addLabel("pause", "+=0.55")
        .addLabel("ptrNull", "pause")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#22c55e", boxShadow: "0 0 0 2px #22c55e66", duration: 0.4 } : {}, "ptrNull")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#22d3ee", boxShadow: "none", duration: 0.4 } : {}, ">")
        .addLabel("exit", ">+=0.08")
        .to(el, {
          y: 80, opacity: 0, scale: 0.65, duration: 0.65, ease: "power3.in",
          onComplete: () => { removeFromState(); toast.success(`Deleted ${target.value} from tail`); },
        }, "exit");

    } else {
      // orange prev (traversing) → pause → red target → pause → green prev (bypass) → restore → fly up
      const prevEl = itemRefs.current.get(list[position - 1].id) ?? null;
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .addLabel("traverse")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#f97316", boxShadow: "0 0 0 2px #f9731666", duration: 0.45 } : {}, "traverse")
        .addLabel("pauseTraverse", "+=0.45")
        .addLabel("markTarget", "pauseTraverse")
        .to(el, { borderColor: "#ef4444", boxShadow: "0 0 0 2px #ef444466", duration: 0.45 }, "markTarget")
        .addLabel("pauseTarget", "+=0.45")
        .addLabel("bypass", "pauseTarget")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#22c55e", boxShadow: "0 0 0 2px #22c55e66", duration: 0.38 } : {}, "bypass")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#22d3ee", boxShadow: "none", duration: 0.38 } : {}, ">")
        .addLabel("exit", ">+=0.08")
        .to(el, {
          y: -80, opacity: 0, scale: 0.65, duration: 0.65, ease: "power3.in",
          onComplete: () => { removeFromState(); toast.success(`Deleted ${target.value} from index ${position}`); },
        }, "exit");
    }
  });

  /* ── CLEAR ──────────────────────────────────────────────────────────── */
  const clear = contextSafe(() => {
    const active = list.filter((n) => !removingIds.has(n.id));
    if (!active.length) { toast("Already empty"); return; }
    setRemovingIds(new Set(active.map((n) => n.id)));
    active.forEach((item, i) => {
      const el = itemRefs.current.get(item.id);
      if (!el) return;
      gsap.to(el, {
        opacity: 0, y: -50, scale: 0.45, duration: 0.45,
        delay: i * 0.08, ease: "back.in(1.6)",
        onComplete: () => {
          itemRefs.current.delete(item.id);
          if (i === active.length - 1) {
            setList([]); setRemovingIds(new Set()); toast.success("Cleared");
          }
        },
      });
    });
  });

  /* ── HANDLERS ────────────────────────────────────────────────────────── */
  const handleOp = (op: string) => {
    const num = parseInt(input);
    const idx = parseInt(pos);
    switch (op) {
      case "insertAtHead":
        if (isNaN(num)) return void toast.error("Enter a value");
        insert(num, 0); setInput(""); break;
      case "insertAtTail":
        if (isNaN(num)) return void toast.error("Enter a value");
        insert(num, list.length); setInput(""); break;
      case "insertAtIndex":
        if (isNaN(num)) return void toast.error("Enter a value");
        if (isNaN(idx) || idx < 0 || idx > list.length)
          return void toast.error(`Index must be 0–${list.length}`);
        insert(num, idx); setInput(""); setPos(""); break;
      case "deleteAtHead":  del(0); break;
      case "deleteAtTail":  del(list.length - 1); break;
      case "deleteAtIndex":
        if (isNaN(idx) || idx < 0 || idx >= list.length)
          return void toast.error(`Index must be 0–${list.length - 1}`);
        del(idx); setPos(""); break;
      case "reverse": setList((p) => [...p].reverse()); toast.success("Reversed"); break;
      case "clear":   clear(); break;
    }
  };

  const switchAlgo = (algo: string) => {
    setSelectedAlgo(algo); setList([]); setRemovingIds(new Set());
    itemRefs.current.clear(); arrowRefs.current.clear();
    toast(`Switched to ${algo}`);
  };

  const activeLen = list.filter((n) => !removingIds.has(n.id)).length;

  /* ── JSX ─────────────────────────────────────────────────────────────── */
  return (
    <div ref={screenRef} className="flex flex-col min-h-screen bg-slate-950 text-white select-none">
      <Toaster position="top-center" richColors />

      {/* shared SVG defs — single arrowhead marker */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <marker id="ll-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#22d3ee" />
          </marker>
        </defs>
      </svg>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3
        bg-slate-950 border-b border-slate-800">

        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-28 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500
              focus:border-cyan-500 text-sm rounded-lg"
            placeholder="Value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOp("insertAtTail")}
          />
          <Input
            className="h-9 w-24 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500
              focus:border-cyan-500 text-sm rounded-lg"
            placeholder="Index"
            value={pos}
            onChange={(e) => setPos(e.target.value)}
          />
          {(["insertAtHead","insertAtTail","insertAtIndex"] as const).map((op) => (
            <button key={op} onClick={() => handleOp(op)}
              className="h-9 px-3 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white
                font-semibold text-xs transition-colors whitespace-nowrap">
              {op === "insertAtHead" ? "Insert Head" : op === "insertAtTail" ? "Insert Tail" : "Insert At"}
            </button>
          ))}
          <div className="w-px h-6 bg-slate-700 mx-1" />
          {(["deleteAtHead","deleteAtTail","deleteAtIndex","reverse","clear"] as const).map((op) => (
            <button key={op} onClick={() => handleOp(op)}
              className="h-9 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-600
                hover:border-slate-500 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap">
              {op === "deleteAtHead" ? "Del Head" : op === "deleteAtTail" ? "Del Tail"
                : op === "deleteAtIndex" ? "Del At" : op.charAt(0).toUpperCase() + op.slice(1)}
            </button>
          ))}
        </div>

        <Select value={selectedAlgo} onValueChange={switchAlgo}>
          <SelectTrigger className="w-[200px] h-9 bg-slate-800 border-slate-600 text-white text-sm rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700 text-white">
            <SelectGroup>
              <SelectLabel className="text-slate-400 text-xs">List Type</SelectLabel>
              {Object.keys(algosMap).map((a) => (
                <SelectItem key={a} value={a} className="capitalize focus:bg-slate-700">{a}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* ── Visualization ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-10 py-8 overflow-hidden relative">

        {/* HEAD pointer box */}
        <div className="flex flex-col items-start mb-1">
          <div ref={headRef}
            className="flex flex-col items-center justify-center w-36 h-16
              border-2 border-cyan-500 rounded-xl bg-slate-900 font-mono">
            <span className="text-[9px] text-cyan-400 uppercase tracking-widest mb-0.5">HEAD</span>
            <span className="text-cyan-300 text-sm font-semibold">
              {list.length > 0 ? list[0].addr : "NULL"}
            </span>
          </div>
          {/* tick down to list */}
          <div className="w-px h-5 bg-cyan-700 ml-[71px]" />
        </div>

        {/* Staging node (used only during insert animation) */}
        <div ref={newNodeRef}
          style={{ opacity: 0, position: "absolute", top: 112, left: 40, zIndex: 30 }}
          className="flex flex-col items-center mt-25">
          <div className="flex w-36 h-16 border-2 border-emerald-500 rounded-xl bg-slate-900
            items-center justify-around">
            <span ref={newNodeValRef} className="text-xl font-bold text-white">?</span>
            <div className="w-px h-8 bg-slate-600" />
            <span ref={newNodePtrRef} className="text-xs font-mono text-emerald-400 px-1">NULL</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 mt-1">new</span>
        </div>

        {/* The list */}
        <div ref={listContainerRef}
          className="flex items-end flex-nowrap overflow-x-auto pb-2"
          style={{ minHeight: 90 }}>

          {list.length === 0 && (
            <p className="text-slate-600 font-mono text-sm tracking-wider self-center">— empty —</p>
          )}

          {list.map((item, index) => (
            <div key={item.id} className="flex items-center flex-shrink-0">
              {/* node + addr label stacked */}
              <div className="flex flex-col items-center">
                <div
                  ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
                  className="flex w-36 h-16 border-2 border-cyan-600 rounded-xl bg-slate-900
                    items-center justify-around"
                  style={{ transition: "border-color 0.15s, box-shadow 0.15s" }}
                >
                  <span className="text-xl font-bold text-white">{item.value}</span>
                  <div className="w-px h-8 bg-slate-600" />
                  {/* pointer → next node addr */}
                  <span className="text-sm font-mono font-semibold text-cyan-300 px-1">
                    {index === list.length - 1 ? "NULL" : list[index + 1].addr}
                  </span>
                </div>
                {/* own address below node */}
                <span className="text-[11px] font-mono text-slate-500 mt-1">
                  addr: <span className="text-slate-400">{item.addr}</span>
                </span>
              </div>

              {/* arrow to next node — animated via DrawSVG */}
              {index < list.length - 1 && (
                <svg className="flex-shrink-0 mb-5" width="52" height="28" viewBox="0 0 52 28">
                  <line
                    ref={(el) => { if (el) arrowRefs.current.set(item.id, el); }}
                    x1="2" y1="14" x2="44" y2="14"
                    stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"
                    markerEnd="url(#ll-arrow)"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-5 mt-8 text-[11px] font-mono text-slate-600">
          <span><span className="text-cyan-400">■</span> active</span>
          <span><span className="text-orange-400">■</span> traversing</span>
          <span><span className="text-red-400">■</span> deleting</span>
          <span><span className="text-green-400">■</span> pointer update</span>
          <span><span className="text-emerald-400">■</span> inserting</span>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-3 border-t border-slate-800
        text-xs font-mono text-slate-600">
        <span>nodes: <span className="text-cyan-500">{activeLen}</span></span>
        <span className="capitalize">{selectedAlgo}</span>
      </div>
    </div>
  );
};

export default LinkedListPage;