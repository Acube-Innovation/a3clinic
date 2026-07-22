"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { deleteRecord } from "@/lib/admin/actions";

export function DeleteButton({
  collection,
  slug,
  noun,
}: {
  collection: string;
  slug: string;
  noun: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onDelete() {
    startTransition(async () => {
      const result = await deleteRecord(collection, slug);
      if (result.ok) {
        router.replace(`/admin/content/${collection}`);
        router.refresh();
      }
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="text-sm font-medium text-red-700">
          Delete this {noun} permanently?
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={onDelete}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {isPending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full bg-platinum px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-line"
        >
          Keep it
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-red-600 ring-1 ring-red-200 transition-colors hover:bg-red-50"
    >
      <Trash2 className="size-3.5" strokeWidth={2} aria-hidden />
      Delete {noun}
    </button>
  );
}
