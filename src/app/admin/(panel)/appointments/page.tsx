import { readDoc } from "@/lib/admin/store";
import { AppointmentsTable } from "@/components/admin/AppointmentsTable";
import type { AppointmentRequest } from "@/lib/admin/inbox-types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Appointments" };

export default async function AdminAppointmentsPage() {
  const appointments = await readDoc<AppointmentRequest[]>("appointments", []);

  const pending = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-teal-900">Appointments</h1>
      <p className="mt-1.5 text-muted">
        {appointments.length} request{appointments.length === 1 ? "" : "s"}
        {pending > 0 ? ` · ${pending} awaiting confirmation` : ""}. Confirm by
        WhatsApp or phone, then mark the status here.
      </p>

      <div className="mt-8">
        <AppointmentsTable appointments={appointments} />
      </div>
    </div>
  );
}
