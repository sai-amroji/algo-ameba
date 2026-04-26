// Centralized GSAP plugin registration for the project.
// Import the core GSAP object and all plugins used throughout the app.
import { gsap } from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import ScrambleTextPlugin from "gsap/ScrambleTextPlugin";
import Flip from "gsap/Flip";
import DrawSVGPlugin from "gsap/DrawSVGPlugin"; // used for active dotted line animations (bonus plugin)
import { useGSAP } from "@gsap/react";
import TextPlugin from "gsap/TextPlugin";
import { Observer,Draggable } from "gsap/all";

// Register plugins once. This avoids duplicate registration warnings and keeps bundle size minimal.
gsap.registerPlugin(
  ScrollTrigger,
  SplitText,
  ScrambleTextPlugin,
  Flip,
  DrawSVGPlugin,
  useGSAP,
  TextPlugin,
  Draggable,
  Observer
);

export default gsap;
