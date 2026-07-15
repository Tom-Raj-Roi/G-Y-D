import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  text: string;
  limit?: number;
  className?: string;
}

export default function ReadMore({ text, limit = 180, className }: Props) {
  const [open, setOpen] = useState(false);
  const isLong = text.length > limit;
  const display = !isLong || open ? text : text.slice(0, limit).trimEnd() + "…";

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{display}</p>
      {isLong && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1 text-primary hover:text-primary-glow font-semibold text-sm transition-smooth"
        >
          {open ? "Read less" : "Read more"}
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      )}
    </div>
  );
}
