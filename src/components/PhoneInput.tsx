import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { DIAL_CODES } from "@/lib/dial-codes";

function flag(iso: string): string {
  return [...iso.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}

interface PhoneInputProps {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  defaultDial?: string;
}

export default function PhoneInput({ value, onChange, required, placeholder, defaultDial = "91" }: PhoneInputProps) {
  const { dial, number } = useMemo(() => {
    const m = value?.match(/^\+(\d{1,4})\s*(.*)$/);
    if (m) return { dial: m[1], number: m[2] };
    return { dial: defaultDial, number: value || "" };
  }, [value, defaultDial]);

  const update = (d: string, n: string) => onChange(`+${d} ${n}`.trim());

  return (
    <div className="flex gap-2">
      <select
        value={dial}
        onChange={(e) => update(e.target.value, number)}
        className="h-10 px-2 rounded-md border bg-background text-sm min-w-[180px] max-w-[220px] truncate"
        aria-label="Country dial code"
      >
        {DIAL_CODES.map((c) => (
          <option key={`${c.iso}-${c.code}`} value={c.code}>
            {flag(c.iso)} {c.name} +{c.code}
          </option>
        ))}
      </select>
      <Input
        required={required}
        type="tel"
        inputMode="tel"
        placeholder={placeholder ?? "Phone number"}
        value={number}
        onChange={(e) => update(dial, e.target.value.replace(/[^\d\s-]/g, ""))}
      />
    </div>
  );
}
