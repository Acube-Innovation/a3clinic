import { readDoc } from "@/lib/admin/store";
import { EnquiriesList } from "@/components/admin/EnquiriesList";
import type { Enquiry } from "@/lib/admin/inbox-types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage() {
  const enquiries = await readDoc<Enquiry[]>("enquiries", []);
  const unread = enquiries.filter((e) => !e.read).length;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-3xl text-teal-900">Enquiries</h1>
      <p className="mt-1.5 text-muted">
        {enquiries.length} message{enquiries.length === 1 ? "" : "s"}
        {unread > 0 ? ` · ${unread} unread` : ""} from the website contact form.
      </p>

      <div className="mt-8">
        <EnquiriesList enquiries={enquiries} />
      </div>
    </div>
  );
}
