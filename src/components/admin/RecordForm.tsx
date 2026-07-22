"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ImagePlus, Plus, Trash2, X } from "lucide-react";

import { saveRecord, saveSingleton } from "@/lib/admin/actions";
import { uploadImage } from "@/lib/admin/upload";
import { cn } from "@/lib/utils";
import type { CollectionDef, FieldDef } from "@/lib/admin/schemas";

/**
 * One generic editor for every collection and singleton, driven entirely by
 * the FieldDef schema. Values are held as a plain record; nested repeaters
 * recurse through the same <FieldInput>.
 */

type Rec = Record<string, unknown>;

const control =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-[0.9375rem] text-ink " +
  "transition-colors duration-150 placeholder:text-muted/60 " +
  "hover:border-teal-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/15";

/* ------------------------------ field editors ----------------------------- */

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
}) {
  switch (field.kind) {
    case "text":
      return (
        <input
          type="text"
          className={control}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "textarea":
      return (
        <textarea
          rows={4}
          className={cn(control, "resize-y")}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          type="number"
          className={cn(control, "max-w-40")}
          value={value === undefined || value === null ? "" : Number(value)}
          onChange={(e) =>
            onChange(e.target.value === "" ? undefined : Number(e.target.value))
          }
        />
      );

    // Stored in paise; edited in rupees.
    case "price":
      return (
        <div className="flex max-w-48 items-center gap-2">
          <span className="text-muted">₹</span>
          <input
            type="number"
            min={0}
            step="1"
            className={control}
            value={typeof value === "number" && value > 0 ? value / 100 : ""}
            onChange={(e) =>
              onChange(
                e.target.value === ""
                  ? undefined
                  : Math.round(Number(e.target.value) * 100),
              )
            }
          />
        </div>
      );

    case "toggle":
      return (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={cn(
            "relative h-7 w-12 rounded-full transition-colors duration-200",
            value ? "bg-olive-500" : "bg-line",
          )}
        >
          <span
            className={cn(
              "absolute top-1 size-5 rounded-full bg-white shadow-soft transition-[left] duration-200",
              value ? "left-6" : "left-1",
            )}
          />
        </button>
      );

    case "select":
      return (
        <select
          className={cn(control, "max-w-72 cursor-pointer")}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Select…
          </option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );

    case "lines":
      return (
        <textarea
          rows={5}
          className={cn(control, "resize-y font-mono text-sm")}
          value={Array.isArray(value) ? (value as string[]).join("\n") : ""}
          onChange={(e) =>
            onChange(
              e.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            )
          }
        />
      );

    case "image":
      return (
        <ImageField
          value={String(value ?? "")}
          onChange={onChange}
          watermark={field.watermark}
        />
      );

    case "repeater": {
      const items = Array.isArray(value) ? (value as Rec[]) : [];

      const update = (index: number, next: Rec) =>
        onChange(items.map((item, i) => (i === index ? next : item)));
      const remove = (index: number) =>
        onChange(items.filter((_, i) => i !== index));
      const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
      };

      return (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl bg-platinum p-4 ring-1 ring-line"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">
                  #{index + 1}
                </span>
                <div className="flex gap-1">
                  <IconButton
                    label="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="size-3.5" strokeWidth={2} aria-hidden />
                  </IconButton>
                  <IconButton
                    label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="size-3.5" strokeWidth={2} aria-hidden />
                  </IconButton>
                  <IconButton label="Remove" danger onClick={() => remove(index)}>
                    <Trash2 className="size-3.5" strokeWidth={2} aria-hidden />
                  </IconButton>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {field.fields?.map((sub) => (
                  <label key={sub.name} className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-teal-900">
                      {sub.label}
                    </span>
                    <FieldInput
                      field={sub}
                      value={item[sub.name]}
                      onChange={(v) => update(index, { ...item, [sub.name]: v })}
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange([...items, {}])}
            className="inline-flex items-center gap-2 self-start rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 ring-1 ring-teal-100 transition-colors hover:bg-teal-100"
          >
            <Plus className="size-3.5" strokeWidth={2.5} aria-hidden />
            Add item
          </button>
        </div>
      );
    }
  }
}

function ImageField({
  value,
  onChange,
  watermark,
}: {
  value: string;
  onChange: (next: unknown) => void;
  watermark?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      if (watermark) data.append("watermark", "true");
      const result = await uploadImage(data);
      if (result.ok && result.url) {
        onChange(result.url);
      } else {
        setError(result.error ?? "Upload failed — please try again.");
      }
    } catch {
      setError("Upload failed — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="relative w-fit">
          {/* Uploaded images come from our own /uploads route. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-36 w-52 rounded-2xl object-cover ring-1 ring-line"
          />
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => onChange("")}
            className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-white text-red-600 shadow-card ring-1 ring-line transition-colors hover:bg-red-50"
          >
            <X className="size-3.5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      ) : (
        <label
          className={cn(
            "flex h-36 w-52 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-white text-muted transition-colors hover:border-teal-300 hover:text-teal-800",
            busy && "pointer-events-none opacity-60",
          )}
        >
          <ImagePlus className="size-6" strokeWidth={1.6} aria-hidden />
          <span className="text-xs font-semibold">
            {busy ? "Uploading…" : "Upload photo"}
          </span>
          <span className="text-[0.6875rem]">
            {watermark
              ? "JPG, PNG or WebP · max 5 MB · watermarked on upload"
              : "JPG, PNG or WebP · max 5 MB"}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onFile}
          />
        </label>
      )}

      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-lg transition-colors disabled:opacity-30",
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-muted hover:bg-white hover:text-teal-800",
      )}
    >
      {children}
    </button>
  );
}

/* --------------------------------- form ---------------------------------- */

export function RecordForm({
  def,
  slug,
  initial,
}: {
  def: CollectionDef;
  /** null = creating a new record; ignored for singletons. */
  slug: string | null;
  initial: Rec;
}) {
  const [record, setRecord] = useState<Rec>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function onSave() {
    setError(null);

    for (const field of def.fields) {
      if (field.required && !String(record[field.name] ?? "").trim()) {
        setError(`"${field.label}" is required.`);
        return;
      }
    }

    startTransition(async () => {
      const result =
        def.kind === "singleton"
          ? await saveSingleton(def.key, record)
          : await saveRecord(def.key, slug, record);

      if (!result.ok) {
        setError(result.error ?? "Could not save — please try again.");
        return;
      }

      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);

      if (def.kind === "collection" && !slug && "slug" in result) {
        router.replace(`/admin/content/${def.key}/${result.slug}`);
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-7">
      {def.fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-teal-900">
            {field.label}
            {field.required ? (
              <span className="ml-1 text-olive-600" aria-hidden>
                *
              </span>
            ) : null}
          </label>
          {field.hint ? (
            <p className="-mt-1 text-sm text-muted">{field.hint}</p>
          ) : null}
          <FieldInput
            field={field}
            value={record[field.name]}
            onChange={(v) => setRecord((r) => ({ ...r, [field.name]: v }))}
          />
        </div>
      ))}

      {/* Sticky save bar so the action is reachable from anywhere in a long form */}
      <div className="sticky bottom-0 -mx-2 mt-2 flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-4 py-3 shadow-card ring-1 ring-line backdrop-blur-sm">
        <p role="status" className="min-w-0 text-sm">
          {error ? (
            <span className="font-medium text-red-600">{error}</span>
          ) : saved ? (
            <span className="inline-flex items-center gap-1.5 font-medium text-olive-700">
              <Check className="size-4" strokeWidth={2.5} aria-hidden />
              Saved — the website updates immediately.
            </span>
          ) : (
            <span className="text-muted">Unsaved changes are kept on this page only.</span>
          )}
        </p>

        <button
          type="button"
          onClick={onSave}
          disabled={isPending}
          className="shrink-0 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
