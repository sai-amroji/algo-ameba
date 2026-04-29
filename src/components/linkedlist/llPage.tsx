import { useState, useRef, useEffect } from "react";
import { Input } from "../ui/input.tsx";
import { Button } from "../ui/button";
import {
  Select, SelectContent, SelectGroup,
  SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select.tsx";
import { useGSAP } from "@gsap/react";
import gsap from "../../gsapSetup.ts";
import { toast } from "sonner";
import { Toaster } from "sonner";

/* ── TYPE DEFINITIONS ────────────────────────────────────────── */
type ListType = "singly" | "doubly" | "singly-circular" | "doubly-circular";

type LLNode = {
  id: number;
  value: number;
  addr: number;
  prevAddr?: number; // Only populated for doubly variants
};

type ListConfig = {
  type: ListType;
  isCircular: boolean;
  isDoubly: boolean;
  label: string;
};

const listTypeConfig: Record<ListType, ListConfig> = {
  "singly": { type: "singly", isCircular: false, isDoubly: false, label: "Singly Linked List" },
  "doubly": { type: "doubly", isCircular: false, isDoubly: true, label: "Doubly Linked List" },
  "singly-circular": { type: "singly-circular", isCircular: true, isDoubly: false, label: "Circular Linked List" },
  "doubly-circular": { type: "doubly-circular", isCircular: true, isDoubly: true, label: "Doubly Circular Linked List" },
};

const getConfig = (type: ListType): ListConfig => listTypeConfig[type];

// Prime-ish random address the user asked for
const genAddr = () => Math.floor(Math.random() * 100 + 17 * Math.random());

const SLOT = 196; // 144px node + 52px arrow gap

const LinkedListPage = () => {
  const [listType, setListType] = useState<ListType>("singly");
  const config = getConfig(listType);
  const [input, setInput]   = useState("");
  const [pos,   setPos]     = useState("");

  const [list, setList] = useState<LLNode[]>([]);

  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

  const screenRef        = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const headRef          = useRef<HTMLDivElement>(null);
  const newNodeRef       = useRef<HTMLDivElement>(null);
  const newNodeValRef    = useRef<HTMLSpanElement>(null);
  const newNodeNextPtrRef    = useRef<HTMLSpanElement>(null);
  const newNodePrevPtrRef    = useRef<HTMLSpanElement>(null);

  const itemRefs  = useRef<Map<number, HTMLDivElement>>(new Map());
  const nextArrowRefs = useRef<Map<number | string, SVGLineElement>>(new Map());
  const prevArrowRefs = useRef<Map<number | string, SVGLineElement>>(new Map());
  const nextId    = useRef(3);
  const pending   = useRef<Set<number>>(new Set());

  /* ── GSAP context ───────────────────────────────────────────────────── */
  const { contextSafe } = useGSAP({ scope: screenRef });

  /* run entrance anims after React commits new nodes */
  // useEffect(() => {
  //   if (!pending.current.size) return;
  //   pending.current.forEach((id) => {
  //     const el   = itemRefs.current.get(id);
  //     const nextLine = nextArrowRefs.current.get(id);
  //     const prevLine = prevArrowRefs.current.get(id);
  //     if (el) animNodeIn(el);
  //     if (nextLine) animArrowIn(nextLine);
  //     if (prevLine) animArrowIn(prevLine);
  //   });
  //   if (headRef.current)
  //     gsap.fromTo(headRef.current, { scale: 1.12 }, { scale: 1, duration: 0.55, ease: "elastic.out(1,0.5)" });
  //   pending.current.clear();
  // }, [list]);



  useEffect(() => {
    if(list.length == 0){
      generateRandom()
    }
  },[list])


 const generateRandom = () => {

   let size = Math.floor(Math.random()*10);

   while(size > 0){
     insert(Math.floor(Math.random()*10),0)
     size--;
   }

 }
  /* ── INSERT ─────────────────────────────────────────────────────────── */
  const insert = contextSafe((value: number, position: number) => {
    const newNode: LLNode = { 
      id: nextId.current++, 
      value, 
      addr: genAddr(),
      prevAddr: config.isDoubly ? (position > 0 ? list[position - 1].addr : (config.isCircular && list.length > 0 ? list[list.length - 1].addr : undefined)) : undefined,
    };

    if (newNodeValRef.current) newNodeValRef.current.textContent = String(value);
    if (newNodeNextPtrRef.current)
      newNodeNextPtrRef.current.textContent =
        position < list.length ? String(list[position].addr) : (config.isCircular && list.length > 0 ? String(list[0].addr) : "NULL");
    if (newNodePrevPtrRef.current && config.isDoubly)
      newNodePrevPtrRef.current.textContent =
        position > 0 ? String(list[position - 1].addr) : (config.isCircular && list.length > 0 ? String(list[list.length - 1].addr) : "NULL");

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
      nextArrowRefs.current.delete(target.id);
      prevArrowRefs.current.delete(target.id);
      setList((p) => p.filter((n) => n.id !== target.id));
      setRemovingIds((p) => { const s = new Set(p); s.delete(target.id); return s; });
    };

    if (position === 0) {
      // highlight → pause → HEAD nudges (pointer moving) → fly up
      gsap.timeline({ defaults: { ease: "power2.out" } })
        .addLabel("mark")
        .to(el, { borderColor: "#ef4444", boxShadow: "0 0 12px rgba(239,68,68,0.2)", duration: 0.5 }, "mark")
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
        .to(el, { borderColor: "#ef4444", boxShadow: "0 0 12px rgba(239,68,68,0.2)", duration: 0.5 }, "markTail")
        .addLabel("pause", "+=0.55")
        .addLabel("ptrNull", "pause")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#00ff11", boxShadow: "0 0 12px rgba(0,255,17,0.2)", duration: 0.4 } : {}, "ptrNull")
        .to(prevEl ?? {}, prevEl ? { borderColor: "rgba(14, 116, 144, 0.5)", boxShadow: "none", duration: 0.4 } : {}, ">")
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
        .to(prevEl ?? {}, prevEl ? { borderColor: "#f97316", boxShadow: "0 0 12px rgba(249,115,22,0.2)", duration: 0.45 } : {}, "traverse")
        .addLabel("pauseTraverse", "+=0.45")
        .addLabel("markTarget", "pauseTraverse")
        .to(el, { borderColor: "#ef4444", boxShadow: "0 0 12px rgba(239,68,68,0.2)", duration: 0.45 }, "markTarget")
        .addLabel("pauseTarget", "+=0.45")
        .addLabel("bypass", "pauseTarget")
        .to(prevEl ?? {}, prevEl ? { borderColor: "#00ff11", boxShadow: "0 0 12px rgba(0,255,17,0.2)", duration: 0.38 } : {}, "bypass")
        .to(prevEl ?? {}, prevEl ? { borderColor: "rgba(14, 116, 144, 0.5)", boxShadow: "none", duration: 0.38 } : {}, ">")
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

  const switchListType = (type: ListType) => {
    setListType(type); 
    setList([]); 
    setRemovingIds(new Set());
    itemRefs.current.clear(); 
    nextArrowRefs.current.clear();
    prevArrowRefs.current.clear();
    toast(`Switched to ${getConfig(type).label}`);
  };

  const activeLen = list.filter((n) => !removingIds.has(n.id)).length;

  /* ── JSX ─────────────────────────────────────────────────────────────── */
  return (
    <div ref={screenRef} className="flex flex-col min-h-screen bg-slate-950 text-white select-none">
      <Toaster position="top-center" richColors />

      {/* shared SVG defs — arrow markers */}
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <defs>
          <marker id="ll-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#0e7490" />
          </marker>
          <marker id="ll-arrow-purple" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#a78bfa" />
          </marker>
          <marker id="ll-arrow-pink" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
            <polygon points="0 0, 7 3.5, 0 7" fill="#ec4899" />
          </marker>
        </defs>
      </svg>

      {/* ── Navbar ───────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3
        bg-slate-950 border-0 border-slate-800">

        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 w-28 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500
              focus-visible:ring-0 focus-visible:border-[#00ff11] font-mono text-sm rounded-lg"
            placeholder="Value"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleOp("insertAtTail")}
          />
          <Input
            className="h-9 w-24 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500
              focus-visible:ring-0 focus-visible:border-[#00ff11] font-mono text-sm rounded-lg"
            placeholder="Index"
            value={pos}
            onChange={(e) => setPos(e.target.value)}
          />
          {(["insertAtHead","insertAtTail","insertAtIndex"] as const).map((op) => (
            <button key={op} onClick={() => handleOp(op)}
              className="h-9 px-4 rounded-lg bg-green-600 border border-0 text-white font-mono text-sm hover:bg-green-500 hover:border-[#00ff11] transition-all whitespace-nowrap">
              {op === "insertAtHead" ? "Insert Head" : op === "insertAtTail" ? "Insert Tail" : "Insert At"}
            </button>
          ))}
          <Button
            onClick={generateRandom}
            className="algo-btn-neutral bg-purple-500 hover:bg-purple-600 text-white border-0 h-9 px-4 rounded-lg font-mono text-sm whitespace-nowrap"
          >
            Generate Random
          </Button>
          <div className="w-px h-6 bg-slate-800 mx-1" />
          {(["deleteAtHead","deleteAtTail","deleteAtIndex","reverse","clear"] as const).map((op) => (
            <button key={op} onClick={() => handleOp(op)}
              className="h-9 px-4 rounded-lg bg-red-800 border border-red-500 text-white border-0 font-mono text-sm hover:bg-red-500 hover:text-white transition-all whitespace-nowrap">
              {op === "deleteAtHead" ? "Del Head" : op === "deleteAtTail" ? "Del Tail"
                : op === "deleteAtIndex" ? "Del At" : op.charAt(0).toUpperCase() + op.slice(1)}
            </button>
          ))}
        </div>

        <Select value={listType} onValueChange={(type) => switchListType(type as ListType)}>
          <SelectTrigger className="w-[240px] bg-slate-900 border-slate-700 text-white h-9 hover:border-slate-500 transition-colors font-mono text-sm rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectGroup>
              <SelectLabel className="text-slate-500 font-mono text-xs">List Type</SelectLabel>
              {(Object.keys(listTypeConfig) as ListType[]).map((type) => (
                <SelectItem key={type} value={type} className="capitalize font-mono text-sm focus:bg-slate-800 focus:text-white">
                  {getConfig(type).label}
                </SelectItem>
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
              border-2 border-transparent rounded-xl bg-blue-200 font-mono text-black font-bold">
            <span className="text-[9px] text-black/70 uppercase tracking-widest mb-0.5">HEAD</span>
            <span className="text-black text-sm font-semibold">
              {list.length > 0 ? list[0].addr : "NULL"}
            </span>
          </div>
          {/* tick down to list */}
          <div className="w-px h-5 bg-cyan-700/50 ml-[71px]" />
        </div>

        {/* Staging node (used only during insert animation) */}
        <div ref={newNodeRef}
          style={{ opacity: 0, position: "absolute", top: 112, left: 40, zIndex: 30 }}
          className="flex flex-col items-center mt-25">
          {config.isDoubly ? (
            <div className="flex w-48 h-16 border-2 border-transparent rounded-xl bg-[#00ff11] text-black font-bold
              items-center justify-around" style={{ boxShadow: "0 0 15px rgba(0,255,17,0.6)" }}>
              <span ref={newNodePrevPtrRef} className="text-xs font-mono px-1">NULL</span>
              <div className="w-px h-8 bg-black/30" />
              <span className="text-xl">?</span>
              <div className="w-px h-8 bg-black/30" />
              <span ref={newNodeNextPtrRef} className="text-xs font-mono px-1">NULL</span>
            </div>
          ) : (
            <div className="flex w-36 h-16 border-2 border-transparent rounded-xl bg-[#00ff11] text-black font-bold
              items-center justify-around" style={{ boxShadow: "0 0 15px rgba(0,255,17,0.6)" }}>
              <span className="text-xl">?</span>
              <div className="w-px h-8 bg-black/30" />
              <span ref={newNodeNextPtrRef} className="text-xs font-mono px-1">NULL</span>
            </div>
          )}
          <span className="text-[10px] font-mono text-[#00ff11] mt-1">new</span>
        </div>

        {/* The list */}
        <div ref={listContainerRef}
          className="flex items-end flex-nowrap overflow-x-auto pb-2"
          style={{ minHeight: 90 }}>

          {list.length === 0 && (
            <p className="text-slate-600 font-mono text-sm tracking-wider self-center">— empty —</p>
          )}

          {list.map((item, index) => {
            const isLast = index === list.length - 1;
            const nextAddr = isLast ? (config.isCircular ? list[0].addr : undefined) : list[index + 1].addr;
            const prevAddr = index === 0 ? (config.isCircular && list.length > 1 ? list[list.length - 1].addr : undefined) : list[index - 1].addr;

            return (
              <div key={item.id} className="flex items-center flex-shrink-0">
                {/* node + addr label stacked */}
                <div className="flex flex-col items-center">
                  <div
                    ref={(el) => { if (el) itemRefs.current.set(item.id, el); }}
                    className="flex border-2 border-transparent rounded-xl bg-blue-600  text-white  text-black font-bold
                      items-center justify-around"
                    style={{ 
                      width: config.isDoubly ? "200px" : "144px",
                      height: "64px",
                      transition: "background-color 0.15s, box-shadow 0.15s" 
                    }}
                  >
                    {config.isDoubly && (
                      <>
                        <span className="text-sm font-mono px-1">
                          {prevAddr !== undefined ? prevAddr : "NULL"}
                        </span>
                        <div className="w-px h-8 bg-black/30" />
                      </>
                    )}
                    
                    <span className="text-xl leading-none">{item.value}</span>
                    
                    <div className="w-px h-8 bg-black/30" />
                    
                    <span className="text-sm font-mono px-1">
                      {nextAddr !== undefined ? nextAddr : "NULL"}
                    </span>
                  </div>
                  
                  {/* own address below node */}
                  <span className="text-[11px] font-mono text-slate-500 mt-1">
                    addr: <span className="text-slate-400">{item.addr}</span>
                  </span>
                </div>

                {/* arrows (next for singly/circular, both prev+next for doubly) */}
                {config.isDoubly ? (
                  <svg className="flex-shrink-0" width="52" height="56" viewBox="0 0 52 56">
                    {/* prev arrow (top) — points left */}
                    {index > 0 && (
                      <line
                        ref={(el) => { if (el) prevArrowRefs.current.set(item.id, el); }}
                        x1="44" y1="8" x2="2" y2="8"
                        stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"
                        markerEnd="url(#ll-arrow-purple)"
                      />
                    )}
                    {/* next arrow (bottom) — points right. EXPLICITLY DON'T RENDER ON LAST NODE */}
                    {index < list.length - 1 && (
                      <line
                        ref={(el) => { if (el) nextArrowRefs.current.set(item.id, el); }}
                        x1="2" y1="48" x2="44" y2="48"
                        stroke="#0e7490" strokeWidth="2" strokeLinecap="round"
                        markerEnd="url(#ll-arrow)"
                      />
                    )}
                  </svg>
                ) : (
                  index < list.length - 1 && (
                    <svg className="flex-shrink-0 mb-5" width="52" height="28" viewBox="0 0 52 28">
                      <line
                        ref={(el) => { if (el) nextArrowRefs.current.set(item.id, el); }}
                        x1="2" y1="14" x2="44" y2="14"
                        stroke="#0e7490" strokeWidth="2" strokeLinecap="round"
                        markerEnd="url(#ll-arrow)"
                      />
                    </svg>
                  )
                )}
              </div>
            );
          })}
        </div>

        {/* Circular back-arrow (tail → head) for circular lists */}
        {config.isCircular && list.length > 0 && (
          <svg
            style={{
              position: "absolute",
              top: "100px",
              left: "0px",
              width: "100%",
              height: "280px",
              pointerEvents: "none",
              overflow: "visible",
              zIndex: 5,
            }}
            viewBox={`0 0 ${Math.max(800, 40 + list.length * SLOT + 150)} 280`}
          >
            {/* Curved path from last node (right side) down-left back to HEAD */}
            {/* Tail starts at right edge of last node */}
            {/* HEAD center is at x ~72 (halfway through w-36 = 144px box) */}
            <path
              ref={(el) => {
                if (el) {
                  // Initialize stroke-dasharray for DrawSVG animation
                  const length = el.getTotalLength?.() || 200;
                  el.setAttribute('stroke-dasharray', String(length));
                  el.setAttribute('stroke-dashoffset', String(length));
                }
              }}
              d={`M ${40 + list.length * SLOT + 90} 140
                  L ${40 + list.length * SLOT + 90} 220
                  Q ${(40 + list.length * SLOT + 90 + 72) / 2} 260, 72 260
                  L 72 180`}
              fill="none"
              stroke="#ec4899"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#ll-arrow-pink)"
            />
            <text
              x={`${(40 + list.length * SLOT + 150) / 2}`}
              y="275"
              fontSize="10"
              fill="#ec4899"
              textAnchor="middle"
              className="font-mono font-bold"
            >
              ↻ circular
            </text>
          </svg>
        )}

        {/* Legend */}
        <div className="flex gap-5 mt-8 text-[11px] font-mono text-slate-600">
          <span><span className="text-cyan-500">■</span> active</span>
          <span><span className="text-orange-500">■</span> traversing</span>
          <span><span className="text-red-500">■</span> deleting</span>
          <span><span className="text-cyan-400">■</span> pointer update</span>
          <span><span style={{ color: "#00ff11" }}>■</span> inserting</span>
          {config.isDoubly && <span><span className="text-purple-400">■</span> prev pointer</span>}
          {config.isCircular && <span><span className="text-pink-500">■</span> circular link</span>}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-4 border-0 border-slate-800
        text-xs font-mono text-slate-500">
        <span>nodes: <span className="text-cyan-500">{activeLen}</span></span>
        <span>{config.label}</span>
      </div>
    </div>
  );
};

export default LinkedListPage;