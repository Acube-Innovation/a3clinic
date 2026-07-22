"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, ChevronDown, Video } from "lucide-react";

import { setAppointmentStatus } from "@/lib/admin/actions";
import { formatDate, cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type {
  AppointmentRequest,
  AppointmentStatus,
} from "@/lib/admin/inbox-types";

const transitions: Record<AppointmentStatus, AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: [],
  cancelled: ["pending"],
};

export function AppointmentsTable({
  appointments,
}: {
  appointments: AppointmentRequest[];
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function change(id: string, status: AppointmentStatus) {
    startTransition(async () => {
      await setAppointmentStatus(id, status);
      router.refresh();
    });
  }

  if (appointments.length === 0) {
    return (
      <p className="rounded-3xl bg-white px-6 py-14 text-center text-muted ring-1 ring-line">
        No appointment requests yet. Submissions from the website booking form
        appear here immediately.
      </p>
    );
  }

  return (
    <ul className={cn("flex flex-col gap-3", isPending && "opacity-60")}>
      {appointments.map((a) => {
        const expanded = open === a.id;
        return (
          <li key={a.id} className="rounded-3xl bg-white ring-1 ring-line">
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : a.id)}
              aria-expanded={expanded}
              className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 text-left"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                {a.mode === "online" ? (
                  <Video className="size-4.5" strokeWidth={1.75} aria-hidden />
                ) : (
                  <Building2 className="size-4.5" strokeWidth={1.75} aria-hidden />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-teal-900">
                  {a.name}
                  <span className="ml-2 text-sm font-normal text-muted">
                    {a.concern}
                  </span>
                </span>
                <span className="block text-sm text-muted">
                  {formatDate(a.date)} · {a.time} IST ·{" "}
                  {a.mode === "online" ? "Online" : "Clinic"} · requested{" "}
                  {formatDate(a.createdAt)}
                </span>
              </span>

              <StatusBadge status={a.status} />
              <ChevronDown
                aria-hidden
                strokeWidth={2}
                className={cn(
                  "size-4 text-muted transition-transform",
                  expanded && "rotate-180",
                )}
              />
            </button>

            {expanded ? (
              <div className="border-t border-line px-6 py-5">
                <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                  {[
                    ["Phone", a.phone],
                    ["Email", a.email],
                    ["Age", a.age],
                    ["Gender", a.gender],
                    ["Reports", a.files.length ? a.files.join(", ") : "None"],
                    ["Notes", a.notes || "—"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="font-semibold text-teal-900">{label}</dt>
                      <dd className="mt-0.5 break-words text-muted">{value}</dd>
                    </div>
                  ))}
                </dl>

                {transitions[a.status].length > 0 ? (
                  <div className="mt-5 flex flex-wrap gap-2.5">
                    {transitions[a.status].map((next) => (
                      <button
                        key={next}
                        type="button"
                        disabled={isPending}
                        onClick={() => change(a.id, next)}
                        className={cn(
                          "rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
                          next === "cancelled"
                            ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                            : "bg-teal-800 text-white hover:bg-teal-700",
                        )}
                      >
                        Mark {next}
                      </button>
                    ))}
                    <a
                      href={`https://wa.me/91${a.phone.replace(/^\+?91/, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-platinum px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-line transition-colors hover:bg-teal-50"
                    >
                      WhatsApp patient
                    </a>
                  </div>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
