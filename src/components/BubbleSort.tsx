import React, { useRef, useState, type JSX } from "react";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

const BubbleSortVisualizer = () =>  {
  const [numbers, setNumbers] = useState<number[]>([5, 3, 8, 2, 4]);
  const containerRef = useRef<HTMLDivElement>(null);

  const bubbleSort = async () => {
    if (!containerRef.current) return;

    const nums = [...numbers];

    for (let i = 0; i < nums.length; i++) {
      for (let j = 0; j < nums.length - i - 1; j++) {
        if (nums[j] > nums[j + 1]) {
          // Capture state before DOM updates
          const state = Flip.getState(containerRef.current.children);

          // Swap values
          [nums[j], nums[j + 1]] = [nums[j + 1], nums[j]];
          setNumbers([...nums]);

          // Wait for state to apply
          await new Promise((resolve) => setTimeout(resolve, 0));

          // Animate layout change
          await Flip.from(state, {
            duration: 0.5,
            ease: "power1.inOut",
            absolute: true,
            targets: containerRef.current.children,
          });

          await new Promise((resolve) => setTimeout(resolve, 100)); // brief pause
        }
      }
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        ref={containerRef}
        style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginBottom: "2rem",
        }}
      >
        {numbers.map((num, index) => (
          <div
            key={index}
            style={{
              width: "50px",
              height: "50px",
              backgroundColor: "#4caf50",
              color: "#fff",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
            }}
          >
            {num}
          </div>
        ))}
      </div>

      <button onClick={bubbleSort} style={{ padding: "0.5rem 1rem" }}>
        Start Bubble Sort
      </button>
    </div>
  );
}


export default BubbleSortVisualizer;
