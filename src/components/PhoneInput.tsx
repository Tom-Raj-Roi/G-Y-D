import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { DIAL_CODES } from "@/lib/dial-codes";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

function flag(iso: string): string {
  if (!iso || iso.length < 2) return "";
  return [...iso.toUpperCase()].map(c => {
    const code = 0x1F1E6 + c.charCodeAt(0) - 65;
    return code >= 0x1F1E6 && code <= 0x1F1FF ? String.fromCodePoint(code) : "";
  }).join("");
}

interface DialCode {
  name: string; code: string; iso: string;
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
  const [open, setOpen] = useState(false);

  const update = (d: string, n: string) => onChange(`+${d} ${n}`.trim());

  const selectedDialCode = useMemo(() => DIAL_CODES.find(c => c.code === dial), [dial]);

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-10 justify-between min-w-[180px] max-w-[220px] font-normal"
          >
            <span className="truncate">
              {selectedDialCode ? `${flag(selectedDialCode.iso)} +${selectedDialCode.code}` : "Select code"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup className="max-h-72 overflow-y-auto">
              {DIAL_CODES.map((c) => (
                <CommandItem
                  key={`${c.iso}-${c.code}`}
                  value={`${c.name} ${c.code}`}
                  onSelect={() => {
                    update(c.code, number);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      dial === c.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{flag(c.iso)}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground text-xs ml-2">+{c.code}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
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
