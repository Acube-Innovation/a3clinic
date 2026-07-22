"use client";

import { useState } from "react";
import {
  CalendarDays,
  Download,
  FileText,
  FlaskConical,
  Package,
  Receipt,
  Video,
} from "lucide-react";

import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  appointments,
  invoices,
  orders,
  prescriptions,
  reports,
} from "@/data/portal";

const tabs = [
  { key: "appointments", label: "Appointments", Icon: CalendarDays },
  { key: "prescriptions", label: "Prescriptions", Icon: FileText },
  { key: "orders", label: "Orders", Icon: Package },
  { key: "reports", label: "Reports", Icon: FlaskConical },
  { key: "invoices", label: "Invoices", Icon: Receipt },
] as const;

type TabKey = (typeof tabs)[number]["key"];

/** Shared shell so every panel gets the same rhythm. */
function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-h3 text-teal-800">{title}</h2>
        {action}
      </div>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-4xl bg-card p-6 ring-1 ring-line transition-shadow duration-300 hover:shadow-soft">
      {children}
    </li>
  );
}

export function PortalDashboard() {
  const [tab, setTab] = useState<TabKey>("appointments");

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr] lg:gap-14">
      {/* ------------------------------ Sidebar ----------------------------- */}
      {/* min-w-0: grid items default to min-width:auto, so the horizontally
          scrollable tab strip would otherwise stretch the whole track and
          force the page to scroll sideways. */}
      <nav
        aria-label="Portal sections"
        className="min-w-0 lg:sticky lg:top-32 lg:self-start"
      >
        <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map(({ key, label, Icon }) => (
            <li key={key} className="shrink-0 lg:shrink">
              <button
                type="button"
                onClick={() => setTab(key)}
                aria-current={tab === key ? "page" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-[0.9375rem] font-medium transition-colors duration-200",
                  tab === key
                    ? "bg-teal-800 text-white"
                    : "text-muted hover:bg-teal-50 hover:text-teal-800",
                )}
              >
                <Icon className="size-4.5 shrink-0" strokeWidth={1.75} aria-hidden />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ------------------------------ Panels ------------------------------ */}
      <div className="min-w-0">
        {tab === "appointments" ? (
          <Panel
            title="Appointments"
            action={
              <Button href="/book" size="sm">
                Book another
              </Button>
            }
          >
            <ul className="flex flex-col gap-4">
              {appointments.map((item) => (
                <Row key={item.id}>
                  <div className="flex min-w-0 items-center gap-5">
                    <span
                      className={cn(
                        "grid size-14 shrink-0 place-items-center rounded-2xl",
                        item.status === "upcoming"
                          ? "bg-teal-800 text-white"
                          : "bg-platinum text-muted",
                      )}
                    >
                      {item.mode.startsWith("Online") ? (
                        <Video className="size-5.5" strokeWidth={1.7} aria-hidden />
                      ) : (
                        <CalendarDays className="size-5.5" strokeWidth={1.7} aria-hidden />
                      )}
                    </span>

                    <div>
                      <p className="font-semibold text-teal-800">{item.type}</p>
                      <p className="mt-1 text-sm text-muted">
                        {formatDate(item.date)} &middot; {item.time} &middot;{" "}
                        {item.mode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge tone={item.status === "upcoming" ? "olive" : "neutral"}>
                      {item.status === "upcoming" ? "Upcoming" : "Completed"}
                    </Badge>
                    {item.status === "upcoming" ? (
                      <Button size="sm" variant="secondary">
                        Join call
                      </Button>
                    ) : null}
                  </div>
                </Row>
              ))}
            </ul>
          </Panel>
        ) : null}

        {tab === "prescriptions" ? (
          <Panel title="Prescriptions">
            <ul className="flex flex-col gap-4">
              {prescriptions.map((item) => (
                <Row key={item.id}>
                  <div>
                    <p className="font-semibold text-teal-800">{item.id}</p>
                    <p className="mt-1 text-sm text-muted">{item.summary}</p>
                    <p className="mt-1.5 text-sm text-muted">
                      Issued {formatDate(item.issued)} &middot; {item.items} items
                      &middot; valid to {formatDate(item.validUntil)}
                    </p>
                  </div>
                  <Button size="sm" variant="secondary">
                    <Download className="size-4" strokeWidth={2} aria-hidden />
                    PDF
                  </Button>
                </Row>
              ))}
            </ul>
          </Panel>
        ) : null}

        {tab === "orders" ? (
          <Panel
            title="Orders"
            action={
              <Button href="/shop" size="sm" variant="secondary">
                Shop again
              </Button>
            }
          >
            <ul className="flex flex-col gap-4">
              {orders.map((item) => (
                <Row key={item.id}>
                  <div>
                    <p className="font-semibold text-teal-800">{item.id}</p>
                    <p className="mt-1 text-sm text-muted">{item.items}</p>
                    <p className="mt-1.5 text-sm text-muted">
                      Placed {formatDate(item.placed)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-teal-800">
                      {formatPrice(item.total)}
                    </span>
                    <Badge tone="teal">Delivered</Badge>
                  </div>
                </Row>
              ))}
            </ul>
          </Panel>
        ) : null}

        {tab === "reports" ? (
          <Panel title="Reports &amp; documents">
            <ul className="flex flex-col gap-4">
              {reports.map((item) => (
                <Row key={item.id}>
                  <div className="flex min-w-0 items-center gap-5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-olive-600">
                      <FlaskConical className="size-5" strokeWidth={1.7} aria-hidden />
                    </span>
                    <div>
                      <p className="font-semibold text-teal-800">{item.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {item.kind} &middot; uploaded {formatDate(item.uploaded)}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary">
                    <Download className="size-4" strokeWidth={2} aria-hidden />
                    View
                  </Button>
                </Row>
              ))}
            </ul>
          </Panel>
        ) : null}

        {tab === "invoices" ? (
          <Panel title="Invoices">
            <ul className="flex flex-col gap-4">
              {invoices.map((item) => (
                <Row key={item.id}>
                  <div>
                    <p className="font-semibold text-teal-800">{item.id}</p>
                    <p className="mt-1 text-sm text-muted">
                      {item.description} &middot; {formatDate(item.date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-teal-800">
                      {formatPrice(item.amount)}
                    </span>
                    <Badge tone="olive">Paid</Badge>
                  </div>
                </Row>
              ))}
            </ul>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
