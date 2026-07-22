import { redirect } from "next/navigation";

import { hasValidSession } from "@/lib/admin/auth";
import { readDoc } from "@/lib/admin/store";
import { Sidebar } from "@/components/admin/Sidebar";
import type { AppointmentRequest, Enquiry } from "@/lib/admin/inbox-types";

/**
 * Guarded shell for every admin page: session check + LHS navigation,
 * with the active page rendering on the right.
 */
export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasValidSession())) redirect("/admin/login");

  const [appointments, enquiries] = await Promise.all([
    readDoc<AppointmentRequest[]>("appointments", []),
    readDoc<Enquiry[]>("enquiries", []),
  ]);

  return (
    <div className="flex min-h-svh">
      <div className="sticky top-0 hidden h-svh w-64 shrink-0 lg:block">
        <Sidebar
          pendingAppointments={appointments.filter((a) => a.status === "pending").length}
          unreadEnquiries={enquiries.filter((e) => !e.read).length}
        />
      </div>

      {/* Mobile: the sidebar collapses to a top strip. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="lg:hidden">
          <MobileAdminNav />
        </div>
        <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileAdminNav() {
  const links = [
    ["/admin", "Dashboard"],
    ["/admin/appointments", "Appointments"],
    ["/admin/enquiries", "Enquiries"],
    ["/admin/content/conditions", "Conditions"],
    ["/admin/content/products", "Products"],
    ["/admin/content/posts", "Blog"],
    ["/admin/content/testimonials", "Testimonials"],
    ["/admin/content/faqs", "FAQs"],
    ["/admin/content/doctor", "Doctor"],
  ] as const;

  return (
    <nav
      aria-label="Admin"
      className="sticky top-0 z-20 flex gap-1 overflow-x-auto bg-teal-950 px-3 py-2.5"
    >
      {links.map(([href, label]) => (
        <a
          key={href}
          href={href}
          className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium text-teal-100/80 hover:bg-white/10 hover:text-white"
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
