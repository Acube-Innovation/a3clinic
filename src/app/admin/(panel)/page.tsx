import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  FileText,
  Inbox,
  Package,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";

import { readDoc } from "@/lib/admin/store";
import { getProducts } from "@/data/products";
import { getConditions } from "@/data/conditions";
import { getPosts } from "@/data/posts";
import { ContentProgress } from "@/components/admin/ContentProgress";
import type { AppointmentRequest, Enquiry } from "@/lib/admin/inbox-types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const [appointments, enquiries, products, conditions, posts] =
    await Promise.all([
      readDoc<AppointmentRequest[]>("appointments", []),
      readDoc<Enquiry[]>("enquiries", []),
      getProducts(),
      getConditions(),
      getPosts(),
    ]);

  const pending = appointments.filter((a) => a.status === "pending");
  const unread = enquiries.filter((e) => !e.read);

  const stats = [
    {
      label: "Pending appointments",
      value: pending.length,
      href: "/admin/appointments",
      Icon: CalendarDays,
      highlight: pending.length > 0,
    },
    {
      label: "Unread enquiries",
      value: unread.length,
      href: "/admin/enquiries",
      Icon: Inbox,
      highlight: unread.length > 0,
    },
    {
      label: "Products live",
      value: products.filter((p) => p.inStock).length,
      href: "/admin/content/products",
      Icon: Package,
    },
    {
      label: "Conditions published",
      value: conditions.length,
      href: "/admin/content/conditions",
      Icon: Stethoscope,
    },
    {
      label: "Blog posts",
      value: posts.length,
      href: "/admin/content/posts",
      Icon: FileText,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="font-display text-3xl text-teal-900">Dashboard</h1>
      <p className="mt-1.5 text-muted">
        {pending.length > 0
          ? `${pending.length} appointment request${pending.length === 1 ? "" : "s"} waiting for confirmation.`
          : "No appointment requests waiting — all caught up."}
      </p>

      {/* ------------------------------ Stats ------------------------------ */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(({ label, value, href, Icon, highlight }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-3xl bg-white p-5 ring-1 ring-line transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card"
          >
            <div className="flex items-start justify-between">
              <span
                className={
                  highlight
                    ? "grid size-10 place-items-center rounded-xl bg-olive-500 text-white"
                    : "grid size-10 place-items-center rounded-xl bg-teal-50 text-teal-700"
                }
              >
                <Icon className="size-5" strokeWidth={1.75} aria-hidden />
              </span>
              <ArrowUpRight
                className="size-4 text-line transition-colors group-hover:text-olive-500"
                strokeWidth={2}
                aria-hidden
              />
            </div>
            <p className="mt-4 font-display text-3xl text-teal-900">{value}</p>
            <p className="mt-0.5 text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <ContentProgress />

      {/* ------------------------- Compliance note -------------------------- */}
      <div className="mt-6 flex gap-4 rounded-3xl bg-olive-50 p-6 ring-1 ring-olive-200">
        <ShieldAlert
          className="mt-0.5 size-5 shrink-0 text-olive-700"
          strokeWidth={1.9}
          aria-hidden
        />
        <div className="text-sm leading-relaxed text-olive-900">
          <p className="font-semibold">Before publishing content, remember:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-olive-800">
            <li>
              No cure claims or guaranteed outcomes anywhere — testimonials must
              describe the experience of care, with written consent on file.
            </li>
            <li>
              Patient data on this panel (appointments, enquiries) is sensitive
              personal data under the DPDP Act 2023 — do not export or share it
              outside the clinic.
            </li>
            <li>
              This demo stores data as files on the server and has a single
              shared login. Before real use it needs per-user accounts, audit
              logging and encrypted backups — see README § Admin.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
