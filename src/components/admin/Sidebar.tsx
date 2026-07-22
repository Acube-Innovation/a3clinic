"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Camera,
  ClipboardList,
  Contact,
  ExternalLink,
  FileText,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Package,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { logoutAction } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

/**
 * LHS navigation: operations first (the daily work), content below.
 * The active page renders on the right — see (panel)/layout.tsx.
 */
const groups = [
  {
    title: "Clinic",
    items: [
      { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
      { href: "/admin/appointments", label: "Appointments", Icon: CalendarDays },
      { href: "/admin/enquiries", label: "Enquiries", Icon: Inbox },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/content/conditions", label: "Treatments & Conditions", Icon: Stethoscope },
      { href: "/admin/content/products", label: "Shop Products", Icon: Package },
      { href: "/admin/content/posts", label: "Blog Posts", Icon: FileText },
      { href: "/admin/content/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
      { href: "/admin/content/faqs", label: "Homepage FAQs", Icon: HelpCircle },
      { href: "/admin/content/doctor", label: "Doctor Profile", Icon: UserRound },
      { href: "/admin/content/gallery", label: "Clinic Photos", Icon: Camera },
      { href: "/admin/content/consultation", label: "Consultation Page", Icon: ClipboardList },
      { href: "/admin/content/clinic", label: "Clinic & Contact", Icon: Contact },
    ],
  },
];

export function Sidebar({
  pendingAppointments,
  unreadEnquiries,
}: {
  pendingAppointments: number;
  unreadEnquiries: number;
}) {
  const pathname = usePathname();

  const badgeFor = (href: string) =>
    href === "/admin/appointments"
      ? pendingAppointments
      : href === "/admin/enquiries"
        ? unreadEnquiries
        : 0;

  return (
    <aside className="flex h-full flex-col bg-teal-950 text-teal-50">
      <div className="flex items-center gap-3 px-6 pb-6 pt-7">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
          <svg viewBox="0 0 24 24" className="size-5.5" aria-hidden fill="none">
            <path
              d="M12 3.5c4.2 2.1 6.5 5.2 6.5 8.6a6.5 6.5 0 1 1-13 0c0-3.4 2.3-6.5 6.5-8.6Z"
              stroke="#9DB955"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M12 20V9.5M12 13.2l3-2.6M12 15.8l-2.6-2.2"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div className="leading-tight">
          <p className="font-display text-[1.0625rem] font-semibold">
            Dr. Riji&rsquo;s
          </p>
          <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-teal-100/60">
            Admin
          </p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="px-3 pb-2 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-teal-100/40">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ href, label, Icon, exact }) => {
                const active = exact
                  ? pathname === href
                  : pathname.startsWith(href);
                const badge = badgeFor(href);

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium transition-colors duration-150",
                        active
                          ? "bg-white/12 text-white"
                          : "text-teal-100/70 hover:bg-white/6 hover:text-white",
                      )}
                    >
                      <Icon className="size-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
                      <span className="flex-1 truncate">{label}</span>
                      {badge > 0 ? (
                        <span className="grid min-w-5 place-items-center rounded-full bg-olive-500 px-1.5 text-[0.6875rem] font-bold leading-5 text-white">
                          {badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <a
          href="/en"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-teal-100/70 transition-colors hover:bg-white/6 hover:text-white"
        >
          <ExternalLink className="size-4.5" strokeWidth={1.75} aria-hidden />
          View site
        </a>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[0.875rem] font-medium text-teal-100/70 transition-colors hover:bg-white/6 hover:text-white"
          >
            <LogOut className="size-4.5" strokeWidth={1.75} aria-hidden />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
