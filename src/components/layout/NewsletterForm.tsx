"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/**
 * MOCK: validates and shows a success state, but posts nowhere.
 * BACKEND SEAM: swap `onSubmit` for a server action that writes to the
 * mailing-list provider.
 */
export function NewsletterForm({
  placeholder,
  submitLabel,
}: {
  placeholder: string;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "error" | "done">("idle");

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("done");
  }

  if (status === "done") {
    return (
      <p className="mt-6 flex items-center gap-2.5 text-sm font-medium text-olive-300">
        <Check className="size-4" strokeWidth={2.5} aria-hidden />
        Thank you — please confirm via the email we just sent.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="newsletter-email" className="sr-only">
            {placeholder}
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder={placeholder}
            aria-invalid={status === "error"}
            aria-describedby={status === "error" ? "newsletter-error" : undefined}
            className="h-12 w-full rounded-full bg-white/10 px-5 text-[0.9375rem] text-white ring-1 ring-white/15 transition-colors placeholder:text-teal-100/40 hover:ring-white/25 focus:ring-olive-400"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[0.9375rem] font-semibold text-teal-800 transition-all duration-300 hover:-translate-y-0.5 hover:bg-olive-50"
        >
          {submitLabel}
          <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
        </button>
      </div>

      {status === "error" ? (
        <p id="newsletter-error" role="alert" className="mt-2.5 pl-5 text-sm text-olive-200">
          Please enter a valid email address.
        </p>
      ) : null}
    </form>
  );
}
