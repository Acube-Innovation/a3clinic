"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarCheck,
  Check,
  FileUp,
  MonitorSmartphone,
  X,
} from "lucide-react";

import { TextField, TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { submitBooking } from "@/lib/admin/submit";

/**
 * Booking wizard. Requests persist to the appointments inbox via the
 * submitBooking server action and are managed in the admin panel. No payment
 * is taken and slots are not exclusively held.
 *
 * STILL NEEDED for production:
 *   • availability fetched per date (slots below are hardcoded)
 *   • a server action to hold, then confirm, the slot (guard double-booking)
 *   • payment (Razorpay) between review and confirmation
 *   • authenticated upload to private storage — reports are health data and
 *     must never be world-readable
 *   • email/SMS confirmation
 */

const STEPS = [
  "Service",
  "Date",
  "Time",
  "Your details",
  "Reports",
  "Review",
] as const;

const concerns = [
  { value: "", label: "Select your main concern…" },
  { value: "hair-fall", label: "Hair fall" },
  { value: "alopecia", label: "Alopecia / patchy hair loss" },
  { value: "dandruff", label: "Dandruff or scalp condition" },
  { value: "greying", label: "Premature greying" },
  { value: "thinning", label: "Hair thinning" },
  { value: "skin", label: "Skin condition" },
  { value: "thyroid", label: "Thyroid" },
  { value: "pcod", label: "PCOD / women's health" },
  { value: "child", label: "Child care" },
  { value: "other", label: "Something else" },
];

const genders = [
  { value: "", label: "Select…" },
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
];

const MORNING = ["09:00", "09:45", "10:30", "11:15", "12:00"];
const EVENING = ["16:00", "16:45", "17:30", "18:15", "19:00"];

type Mode = "online" | "clinic" | "";

type Values = {
  mode: Mode;
  concern: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  age: string;
  gender: string;
  notes: string;
  files: string[];
};

type Errors = Partial<Record<keyof Values, string>>;

/** Next 21 days, excluding Sundays for clinic visits. */
function useDates(mode: Mode) {
  return useMemo(() => {
    const days: { iso: string; weekday: string; day: string; month: string }[] = [];
    const today = new Date();

    for (let offset = 1; offset <= 21; offset++) {
      const date = new Date(today);
      date.setDate(today.getDate() + offset);

      // The clinic does not hold in-person sessions on Sundays.
      if (mode === "clinic" && date.getDay() === 0) continue;

      days.push({
        iso: date.toISOString().slice(0, 10),
        weekday: date.toLocaleDateString("en-IN", { weekday: "short" }),
        day: date.toLocaleDateString("en-IN", { day: "2-digit" }),
        month: date.toLocaleDateString("en-IN", { month: "short" }),
      });
    }

    return days;
  }, [mode]);
}

function validateStep(step: number, values: Values): Errors {
  const errors: Errors = {};

  if (step === 0) {
    if (!values.mode) errors.mode = "Please choose how you would like to consult.";
    if (!values.concern) errors.concern = "Please select your main concern.";
  }

  if (step === 1 && !values.date) {
    errors.date = "Please choose a date.";
  }

  if (step === 2 && !values.time) {
    errors.time = "Please choose a time slot.";
  }

  if (step === 3) {
    if (!values.name.trim()) errors.name = "Please enter your full name.";

    const phone = values.phone.replace(/[\s-]/g, "");
    if (!phone) {
      errors.phone = "A phone number is required to confirm your appointment.";
    } else if (!/^(\+?91)?[6-9]\d{9}$/.test(phone)) {
      errors.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!values.email.trim()) {
      errors.email = "An email address is required for your prescription.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
      errors.email = "Please enter a valid email address.";
    }

    const age = Number(values.age);
    if (!values.age) {
      errors.age = "Please enter your age.";
    } else if (!Number.isFinite(age) || age < 0 || age > 120) {
      errors.age = "Please enter a valid age.";
    }

    if (!values.gender) errors.gender = "Please select an option.";
  }

  return errors;
}

export function BookingWizard({
  phone,
}: {
  phone: { intl: string; display: string };
}) {
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const [values, setValues] = useState<Values>({
    mode: "",
    concern: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    email: "",
    age: "",
    gender: "",
    notes: "",
    files: [],
  });

  const dates = useDates(values.mode);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function next() {
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  }

  function back() {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  }

  async function confirm() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitBooking({
        mode: values.mode,
        concern: values.concern,
        date: values.date,
        time: values.time,
        name: values.name,
        phone: values.phone,
        email: values.email,
        age: values.age,
        gender: values.gender,
        notes: values.notes,
        files: values.files,
      });
      if (result.ok) {
        setConfirmed(true);
      } else {
        setSubmitError(result.error ?? "Something went wrong — please try again.");
      }
    } catch {
      setSubmitError("Could not reach the clinic server — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function onFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const names = Array.from(event.target.files ?? []).map((file) => file.name);
    update("files", [...values.files, ...names]);
    // Reset so the same file can be re-selected after removal.
    event.target.value = "";
  }

  /* --------------------------- Confirmation --------------------------- */
  if (confirmed) {
    return (
      <div className="mx-auto max-w-2xl rounded-5xl bg-card p-10 text-center ring-1 ring-line sm:p-14">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-teal-50 text-olive-600">
          <CalendarCheck className="size-8" strokeWidth={1.6} aria-hidden />
        </span>

        <h2 className="mt-7 text-h2 text-teal-800">Appointment requested</h2>
        <p className="mt-4 text-lead text-muted">
          Thank you, {values.name.split(" ")[0]}. The clinic will confirm your
          slot by WhatsApp on {values.phone} shortly.
        </p>

        <dl className="mt-9 flex flex-col gap-3 rounded-4xl bg-platinum p-7 text-left">
          {[
            ["Consultation", values.mode === "online" ? "Online (video)" : "At the Kattakkada clinic"],
            ["Date", new Date(values.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
            ["Time", values.time],
            ["Reports uploaded", values.files.length > 0 ? `${values.files.length} file(s)` : "None"],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-wrap justify-between gap-x-6 gap-y-1">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-teal-800">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 rounded-3xl bg-olive-50 px-6 py-4 text-sm leading-relaxed text-olive-800">
          Your request has been recorded with the clinic. The slot is held only
          once the clinic confirms it — no payment has been taken. For anything
          urgent, call{" "}
          <a href={`tel:${phone.intl}`} className="font-semibold underline">
            {phone.display}
          </a>
          .
        </p>

        <Button
          className="mt-8"
          variant="secondary"
          onClick={() => {
            setConfirmed(false);
            setStep(0);
          }}
        >
          Start over
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* ----------------------------- Progress ---------------------------- */}
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
        {STEPS.map((label, index) => {
          const done = index < step;
          const current = index === step;

          return (
            <li key={label} className="flex items-center gap-2">
              <span
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-sm font-semibold transition-colors duration-300",
                  current && "bg-teal-800 text-white",
                  done && "bg-olive-50 text-olive-700",
                  !current && !done && "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid size-6 place-items-center rounded-full text-xs",
                    current && "bg-white/20 text-white",
                    done && "bg-olive-500 text-white",
                    !current && !done && "bg-platinum text-muted",
                  )}
                >
                  {done ? (
                    <Check className="size-3" strokeWidth={3} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </span>

              {index < STEPS.length - 1 ? (
                <span aria-hidden className="h-px w-4 bg-line" />
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* ------------------------------ Steps ------------------------------ */}
      <div className="mt-10 rounded-5xl bg-card p-8 ring-1 ring-line sm:p-11">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduced ? false : { opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? undefined : { opacity: 0, x: -12 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* -------------------------- 0. Service -------------------------- */}
            {step === 0 ? (
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="text-h3 text-teal-800">
                    How would you like to consult?
                  </h2>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        value: "online" as const,
                        Icon: MonitorSmartphone,
                        title: "Online",
                        detail: "By video, from anywhere. Medicines couriered to you.",
                      },
                      {
                        value: "clinic" as const,
                        Icon: Building2,
                        title: "At the clinic",
                        detail: "In Kattakkada. Direct examination, medicines dispensed on site.",
                      },
                    ].map(({ value, Icon, title, detail }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => update("mode", value)}
                        aria-pressed={values.mode === value}
                        className={cn(
                          "flex flex-col rounded-4xl p-6 text-left ring-1 transition-all duration-300",
                          values.mode === value
                            ? "bg-teal-50 ring-2 ring-teal-600"
                            : "bg-white ring-line hover:ring-teal-200",
                        )}
                      >
                        <span
                          className={cn(
                            "grid size-11 place-items-center rounded-2xl transition-colors",
                            values.mode === value
                              ? "bg-teal-800 text-white"
                              : "bg-teal-50 text-olive-600",
                          )}
                        >
                          <Icon className="size-5" strokeWidth={1.7} aria-hidden />
                        </span>
                        <span className="mt-4 text-lg font-semibold text-teal-800">
                          {title}
                        </span>
                        <span className="mt-1.5 text-sm leading-relaxed text-muted">
                          {detail}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.mode ? (
                    <p role="alert" className="mt-3 text-sm font-medium text-red-600">
                      {errors.mode}
                    </p>
                  ) : null}
                </div>

                <SelectField
                  label="Main concern"
                  required
                  options={concerns}
                  value={values.concern}
                  error={errors.concern}
                  onChange={(event) => update("concern", event.target.value)}
                />
              </div>
            ) : null}

            {/* --------------------------- 1. Date ---------------------------- */}
            {step === 1 ? (
              <div>
                <h2 className="text-h3 text-teal-800">Choose a date</h2>
                <p className="mt-2 text-muted">
                  {values.mode === "clinic"
                    ? "Clinic sessions run Monday to Saturday."
                    : "Online slots are available every day, including Sundays."}
                </p>

                <div className="mt-7 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
                  {dates.map((date) => (
                    <button
                      key={date.iso}
                      type="button"
                      onClick={() => update("date", date.iso)}
                      aria-pressed={values.date === date.iso}
                      className={cn(
                        "flex flex-col items-center rounded-2xl px-2 py-3.5 ring-1 transition-all duration-200",
                        values.date === date.iso
                          ? "bg-teal-800 text-white ring-teal-800"
                          : "bg-white text-teal-800 ring-line hover:ring-teal-300",
                      )}
                    >
                      <span
                        className={cn(
                          "text-xs uppercase tracking-wider",
                          values.date === date.iso ? "text-teal-100" : "text-muted",
                        )}
                      >
                        {date.weekday}
                      </span>
                      <span className="mt-1 font-display text-xl">{date.day}</span>
                      <span
                        className={cn(
                          "text-xs",
                          values.date === date.iso ? "text-teal-100" : "text-muted",
                        )}
                      >
                        {date.month}
                      </span>
                    </button>
                  ))}
                </div>

                {errors.date ? (
                  <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                    {errors.date}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* --------------------------- 2. Time ---------------------------- */}
            {step === 2 ? (
              <div>
                <h2 className="text-h3 text-teal-800">Choose a time</h2>
                <p className="mt-2 text-muted">
                  All times are India Standard Time (IST, UTC+5:30).
                </p>

                {[
                  { label: "Morning session", slots: MORNING },
                  { label: "Evening session", slots: EVENING },
                ].map((session) => (
                  <div key={session.label} className="mt-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-olive-600">
                      {session.label}
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                      {session.slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => update("time", slot)}
                          aria-pressed={values.time === slot}
                          className={cn(
                            "rounded-2xl px-3 py-3 text-sm font-semibold ring-1 transition-all duration-200",
                            values.time === slot
                              ? "bg-teal-800 text-white ring-teal-800"
                              : "bg-white text-teal-800 ring-line hover:ring-teal-300",
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {errors.time ? (
                  <p role="alert" className="mt-4 text-sm font-medium text-red-600">
                    {errors.time}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* -------------------------- 3. Details -------------------------- */}
            {step === 3 ? (
              <div className="flex flex-col gap-6">
                <h2 className="text-h3 text-teal-800">Your details</h2>

                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    label="Full name"
                    required
                    autoComplete="name"
                    value={values.name}
                    error={errors.name}
                    onChange={(event) => update("name", event.target.value)}
                  />
                  <TextField
                    label="Phone"
                    required
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile"
                    value={values.phone}
                    error={errors.phone}
                    onChange={(event) => update("phone", event.target.value)}
                  />
                </div>

                <TextField
                  label="Email"
                  required
                  type="email"
                  autoComplete="email"
                  hint="Your prescription is sent here after the consultation."
                  value={values.email}
                  error={errors.email}
                  onChange={(event) => update("email", event.target.value)}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <TextField
                    label="Age"
                    required
                    type="number"
                    min={0}
                    max={120}
                    value={values.age}
                    error={errors.age}
                    onChange={(event) => update("age", event.target.value)}
                  />
                  <SelectField
                    label="Gender"
                    required
                    options={genders}
                    value={values.gender}
                    error={errors.gender}
                    onChange={(event) => update("gender", event.target.value)}
                  />
                </div>

                <TextArea
                  label="Anything the doctor should know beforehand"
                  hint="How long the concern has been present, what you have already tried, and any current medication."
                  value={values.notes}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </div>
            ) : null}

            {/* -------------------------- 4. Reports -------------------------- */}
            {step === 4 ? (
              <div>
                <h2 className="text-h3 text-teal-800">Upload your reports</h2>
                <p className="mt-2 leading-relaxed text-muted">
                  Optional, but genuinely useful. Blood reports from the last
                  year — even ones you were told were normal — and for hair
                  concerns, clear photographs of the scalp, parting and hairline
                  in bright indoor daylight.
                </p>

                <label className="mt-7 flex cursor-pointer flex-col items-center gap-3 rounded-4xl border-2 border-dashed border-line bg-white px-6 py-12 text-center transition-colors hover:border-teal-300 hover:bg-teal-50/40">
                  <span className="grid size-12 place-items-center rounded-2xl bg-teal-50 text-olive-600">
                    <FileUp className="size-5.5" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="font-semibold text-teal-800">
                    Choose files to upload
                  </span>
                  <span className="text-sm text-muted">
                    PDF, JPG or PNG — up to 10 MB each
                  </span>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={onFiles}
                    className="sr-only"
                  />
                </label>

                {values.files.length > 0 ? (
                  <ul className="mt-5 flex flex-col gap-2.5">
                    {values.files.map((file, index) => (
                      <li
                        key={`${file}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-platinum px-4 py-3"
                      >
                        <span className="truncate text-sm text-ink/80">
                          {file}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            update(
                              "files",
                              values.files.filter((_, i) => i !== index),
                            )
                          }
                          aria-label={`Remove ${file}`}
                          className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white hover:text-red-600"
                        >
                          <X className="size-4" strokeWidth={2} aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <p className="mt-6 rounded-3xl bg-platinum px-5 py-4 text-sm leading-relaxed text-muted">
                  Files are listed here for demonstration only — nothing is
                  uploaded or stored. In the live clinic, medical reports are
                  health data and are handled under access-controlled storage.
                </p>
              </div>
            ) : null}

            {/* --------------------------- 5. Review -------------------------- */}
            {step === 5 ? (
              <div>
                <h2 className="text-h3 text-teal-800">Review and confirm</h2>

                <dl className="mt-7 flex flex-col divide-y divide-line">
                  {[
                    ["Consultation", values.mode === "online" ? "Online (video)" : "At the Kattakkada clinic"],
                    ["Main concern", concerns.find((c) => c.value === values.concern)?.label ?? "—"],
                    ["Date", values.date ? new Date(values.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "—"],
                    ["Time", `${values.time} IST`],
                    ["Name", values.name],
                    ["Phone", values.phone],
                    ["Email", values.email],
                    ["Age", values.age],
                    ["Gender", genders.find((g) => g.value === values.gender)?.label ?? "—"],
                    ["Reports", values.files.length > 0 ? values.files.join(", ") : "None uploaded"],
                    ["Notes", values.notes || "—"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="grid gap-1 py-3.5 sm:grid-cols-[12rem_1fr] sm:gap-6"
                    >
                      <dt className="text-sm text-muted">{label}</dt>
                      <dd className="text-ink/85">{value}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-8 rounded-3xl bg-platinum px-6 py-5 text-sm leading-relaxed text-muted">
                  Submitting sends a request — your slot is confirmed by the
                  clinic on WhatsApp. Homeopathic treatment complements
                  conventional medical care; please continue any medication
                  prescribed by another doctor until you have discussed it with
                  them. In an emergency, go directly to hospital.
                </p>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {/* ---------------------------- Navigation --------------------------- */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-8">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className={cn(step === 0 && "invisible")}
          >
            <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={next} size="lg">
              Continue
              <ArrowRight
                aria-hidden
                strokeWidth={2}
                className="size-4.5 transition-transform duration-300 group-hover:translate-x-1"
              />
            </Button>
          ) : (
            <div className="flex flex-col items-end gap-2.5">
              {submitError ? (
                <p role="alert" className="text-sm font-medium text-red-600">
                  {submitError}
                </p>
              ) : null}
              <Button
                onClick={confirm}
                size="lg"
                variant="olive"
                disabled={submitting}
              >
                {submitting ? "Sending…" : "Confirm appointment"}
                <Check className="size-4.5" strokeWidth={2.5} aria-hidden />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
