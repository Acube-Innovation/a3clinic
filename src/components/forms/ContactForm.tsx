"use client";

import { useState } from "react";
import { Check, Send } from "lucide-react";

import { TextField, TextArea, SelectField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { submitEnquiry } from "@/lib/admin/submit";

/**
 * Persists to the enquiries inbox via the submitEnquiry server action, where
 * the clinic reviews it in the admin panel. Validation here is a convenience;
 * the server action re-validates before writing.
 */

type Values = {
  name: string;
  phone: string;
  email: string;
  reason: string;
  message: string;
};

type Errors = Partial<Record<keyof Values, string>>;

const reasons = [
  { value: "", label: "Select a reason…" },
  { value: "hair", label: "Hair or scalp concern" },
  { value: "skin", label: "Skin concern" },
  { value: "chronic", label: "Chronic condition" },
  { value: "womens", label: "Women's health" },
  { value: "child", label: "Child care" },
  { value: "products", label: "Product enquiry" },
  { value: "other", label: "Something else" },
];

function validate(values: Values): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }

  // Indian mobile numbers: 10 digits starting 6-9, tolerating +91 and spacing.
  const phone = values.phone.replace(/[\s-]/g, "");
  if (!phone) {
    errors.phone = "Please enter a phone number so the clinic can reach you.";
  } else if (!/^(\+?91)?[6-9]\d{9}$/.test(phone)) {
    errors.phone = "Please enter a valid 10-digit Indian mobile number.";
  }

  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.reason) {
    errors.reason = "Please choose a reason for your enquiry.";
  }

  if (!values.message.trim()) {
    errors.message = "Please tell the clinic briefly what you need.";
  } else if (values.message.trim().length < 15) {
    errors.message = "A little more detail helps the clinic respond usefully.";
  }

  return errors;
}

export function ContactForm() {
  const [values, setValues] = useState<Values>({
    name: "",
    phone: "",
    email: "",
    reason: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    // Clear the error as soon as the user starts correcting it.
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitEnquiry(values);
      if (result.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(result.error ?? "Something went wrong — please try again.");
      }
    } catch {
      setSubmitError("Could not reach the clinic server — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-4xl bg-teal-50 p-9 text-center ring-1 ring-teal-100">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-white text-olive-600 shadow-soft">
          <Check className="size-7" strokeWidth={2.5} aria-hidden />
        </span>
        <h3 className="mt-6 text-h3 text-teal-800">Enquiry received</h3>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted">
          Thank you, {values.name.split(" ")[0]}. The clinic will be in touch on{" "}
          {values.phone} within one working day. For anything urgent, please
          call rather than wait for a reply.
        </p>

      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          label="Your name"
          required
          autoComplete="name"
          placeholder="Full name"
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
          placeholder="10-digit mobile number"
          value={values.phone}
          error={errors.phone}
          onChange={(event) => update("phone", event.target.value)}
        />
      </div>

      <TextField
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        hint="Only needed if you would prefer a written reply."
        value={values.email}
        error={errors.email}
        onChange={(event) => update("email", event.target.value)}
      />

      <SelectField
        label="Reason for enquiry"
        required
        options={reasons}
        value={values.reason}
        error={errors.reason}
        onChange={(event) => update("reason", event.target.value)}
      />

      <TextArea
        label="How can the clinic help?"
        required
        placeholder="A brief description of your concern, how long it has been present, and anything you have already tried."
        hint="Please do not include detailed medical records here — those are collected securely at booking."
        value={values.message}
        error={errors.message}
        onChange={(event) => update("message", event.target.value)}
      />

      <p className="text-sm leading-relaxed text-muted">
        By submitting, you agree that the clinic may contact you about your
        enquiry. Your details are not used for marketing.
      </p>

      {submitError ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {submitError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="self-start" disabled={submitting}>
        {submitting ? "Sending…" : "Send enquiry"}
        <Send className="size-4" strokeWidth={2} aria-hidden />
      </Button>
    </form>
  );
}
