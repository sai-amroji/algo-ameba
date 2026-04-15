import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(SplitText, ScrollTrigger, useGSAP);

type InfoCardProps = {
    title: string;
    description: string;
    side?: "left" | "right";
};

const InfoCard = ({ title, description, side = "left" }: InfoCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const { contextSafe } = useGSAP({ scope: cardRef });

    useGSAP(() => {
        const card = cardRef.current;
        const titleEl = titleRef.current;
        const descEl = descRef.current;

        if (!card || !titleEl || !descEl) return;

        // Split only the description for scroll‑in animation; title will use simple CSS hover effects.
        const descSplit = SplitText.create(descEl, { type: "words" });

        const xOffset = side === "left" ? -120 : 120;
        const yOffset = Math.min(card.offsetHeight * 0.25, 120);

        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                end: "bottom 65%",
                toggleActions: "play none none reverse",
                invalidateOnRefresh: true,
            },
            opacity: 0,
            x: xOffset,
            y: yOffset,
            duration: 0.9,
            ease: "power3.out",
        });

        // Simple hover effect: underline the title with green color.
        const hoverIn = contextSafe(() => {
            // Add a CSS class to trigger underline via Tailwind utilities.
            titleEl.classList.add("underline", "decoration-green-500");
            // Animate description words as before.
            gsap.fromTo(
                descSplit.words,
                { opacity: 0.4, y: 7 },
                { opacity: 1, y: 0, stagger: 0.025, duration: 0.4, ease: "power2.out" }
            );
        });

        const hoverOut = contextSafe(() => {
            titleEl.classList.remove("underline", "decoration-green-500");
            gsap.to(descSplit.words, {
                opacity: 0.4,
                y: 7,
                stagger: 0.02,
                duration: 0.3,
                ease: "power2.in",
            });
        });

        card.addEventListener("mouseenter", hoverIn);
        card.addEventListener("mouseleave", hoverOut);

        return () => {
            card.removeEventListener("mouseenter", hoverIn);
            card.removeEventListener("mouseleave", hoverOut);
            descSplit.revert();
        };
    }, { scope: cardRef, dependencies: [side] });

    return (
        <div ref={cardRef} className="feature-card  ">
            <div className="text-3xl text-primary font-[baijamjuri] mb-4">
                <h2 ref={titleRef} className="card-heading leading-tight whitespace-nowrap">
                    {title.replace(/\n/g, " ")}
                </h2>
            </div>
            <p
                ref={descRef}
                className="card-desc text-base text-muted-foreground font-[arima] leading-relaxed"
            >
                {description}
            </p>
        </div>
    );
};

export default InfoCard;