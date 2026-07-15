import { Input } from "@/components/ui/input";
import { CURRENCIES, Currency } from "@/lib/currencies";

interface CurrencyInputProps {
  amount: string;
  currency: string;
  onAmountChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function CurrencyInput({
  amount, currency, onAmountChange, onCurrencyChange, placeholder, required,
}: CurrencyInputProps) {
  return (
    <div className="flex gap-2">
      <select
        value={currency}
        onChange={(e) => onCurrencyChange(e.target.value)}
        className="h-10 px-2 rounded-md border bg-background text-sm min-w-[180px] max-w-[220px] truncate"
        aria-label="Currency"
      >
        {CURRENCIES.map((c: Currency) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.country} - {c.name} ({c.symbol})
          </option>
        ))}
      </select>
      <Input
        required={required}
        type="text"
        inputMode="numeric"
        placeholder={placeholder ?? "Amount"}
        value={amount}
        onChange={(e) => onAmountChange(e.target.value.replace(/[^\d.,]/g, ""))}
      />
    </div>
  );
}
