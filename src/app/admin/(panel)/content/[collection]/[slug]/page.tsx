import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCollection } from "@/lib/admin/schemas";
import { readDoc } from "@/lib/admin/store";
import { RecordForm } from "@/components/admin/RecordForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import {
  defaultsForCollection,
  type AnyRecord,
} from "@/lib/admin/defaults";

export const dynamic = "force-dynamic";

/** Handles both /new (create) and /[slug] (edit). */
export default async function RecordPage({
  params,
}: PageProps<"/admin/content/[collection]/[slug]">) {
  const { collection, slug } = await params;
  const def = getCollection(collection);
  if (!def || def.kind !== "collection") notFound();

  const creating = slug === "new";
  let record: AnyRecord = {};

  if (!creating) {
    const records = await readDoc<AnyRecord[]>(
      def.key,
      defaultsForCollection(def.key),
    );
    const found = records.find((r) => r.slug === slug);
    if (!found) notFound();
    record = found;
  }

  const title = creating
    ? `New ${def.noun}`
    : String(record[def.titleField] ?? "Untitled");

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/admin/content/${def.key}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900"
      >
        <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
        {def.label}
      </Link>

      <div className="mb-8 mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-teal-900">{title}</h1>
        {!creating ? (
          <DeleteButton collection={def.key} slug={slug} noun={def.noun} />
        ) : null}
      </div>

      <RecordForm def={def} slug={creating ? null : slug} initial={record} />
    </div>
  );
}
