import { useEffect, useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Props {
  direction?: "left" | "right" | "up";
  delay?: number;
  className?: string;
  children: ReactNode;
}

export default function Reveal({ direction = "up", delay = 0, className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.animationDelay = `${delay}ms`;
          el.classList.add(
            direction === "left" ? "animate-slide-left"
            : direction === "right" ? "animate-slide-right"
            : "animate-fade-up"
          );
          obs.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [direction, delay]);

  return <div ref={ref} className={cn("opacity-0", className)} style={{ animationFillMode: "both" }}>{children}</div>;
}
