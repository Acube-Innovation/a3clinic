"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Phone } from "lucide-react";

import { setEnquiryRead } from "@/lib/admin/actions";
import { formatDate, cn } from "@/lib/utils";
import type { Enquiry } from "@/lib/admin/inbox-types";

const reasonLabels: Record<string, string> = {
  hair: "Hair / scalp",
  skin: "Skin",
  chronic: "Chronic condition",
  womens: "Women's health",
  child: "Child care",
  products: "Products",
  other: "Other",
};

export function EnquiriesList({ enquiries }: { enquiries: Enquiry[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(id: string, read: boolean) {
    startTransition(async () => {
      await setEnquiryRead(id, read);
      router.refresh();
    });
  }

  if (enquiries.length === 0) {
    return (
      <p className="rounded-3xl bg-white px-6 py-14 text-center text-muted ring-1 ring-line">
        No enquiries yet. Messages from the website contact form appear here
        immediately.
      </p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", isPending && "opacity-60")}>
      {enquiries.map((e) => (
        <li
          key={e.id}
          className={cn(
            "rounded-3xl bg-white p-6 ring-1 transition-colors",
            e.read ? "ring-line" : "ring-olive-300",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
            <div className="min-w-0">
              <p className="font-medium text-teal-900">
                {e.name}
                {!e.read ? (
                  <span className="ml-2.5 rounded-full bg-olive-100 px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-olive-800">
                    New
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {reasonLabels[e.reason] ?? e.reason} ·{" "}
                {formatDate(e.createdAt)}
              </p>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={() => toggle(e.id, !e.read)}
              className="inline-flex items-center gap-2 rounded-full bg-platinum px-3.5 py-1.5 text-sm font-semibold text-teal-800 ring-1 ring-line transition-colors hover:bg-teal-50"
            >
              {e.read ? (
                <>
                  <Mail className="size-3.5" strokeWidth={2} aria-hidden />
                  Mark unread
                </>
              ) : (
                <>
                  <MailOpen className="size-3.5" strokeWidth={2} aria-hidden />
                  Mark read
                </>
              )}
            </button>
          </div>

          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink/85">
            {e.message}
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5 border-t border-line pt-4">
            <a
              href={`tel:+91${e.phone.replace(/^\+?91/, "")}`}
              className="inline-flex items-center gap-2 rounded-full bg-teal-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              <Phone className="size-3.5" strokeWidth={2} aria-hidden />
              {e.phone}
            </a>
            <a
              href={`https://wa.me/91${e.phone.replace(/^\+?91/, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-platinum px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-line transition-colors hover:bg-teal-50"
            >
              WhatsApp
            </a>
            {e.email ? (
              <a
                href={`mailto:${e.email}`}
                className="rounded-full bg-platinum px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-line transition-colors hover:bg-teal-50"
              >
                {e.email}
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
