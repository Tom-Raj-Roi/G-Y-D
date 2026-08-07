import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Contact from "./Contact";

vi.mock("@/contexts/LanguageContext", () => ({
  useLanguage: () => ({
    translate: (_key: string, fallback?: string) => fallback ?? _key,
  }),
}));

vi.mock("@/components/Layout", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/PhoneInput", () => ({
  default: ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <input
      data-testid="phone-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/EmailOTPAuth", () => ({
  default: ({ email }: { email: string }) => (
    <div data-testid="email-otp-auth">{email}</div>
  ),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: () => ({
      insert: async () => ({ error: null }),
    }),
  },
}));

describe("Contact page", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("renders contact form properly", () => {
    act(() => {
      root.render(<Contact />);
    });

    const input = container.querySelector("[data-testid='phone-input']") as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });
});
