import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@/lib/admin/inbox-types";

const styles: Record<AppointmentStatus, string> = {
  pending: "bg-olive-100 text-olive-800 ring-olive-200",
  confirmed: "bg-teal-50 text-teal-700 ring-teal-200",
  completed: "bg-platinum text-muted ring-line",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1",
        styles[status],
      )}
    >
      {status}
    </span>
  );
}
