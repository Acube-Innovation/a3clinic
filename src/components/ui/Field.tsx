"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Form primitives shared by the contact form and the booking wizard.
 * Each field owns its label/error wiring so aria-describedby is never forgotten.
 */

type BaseFieldProps = {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
};

const control =
  "w-full rounded-2xl border border-line bg-white px-4 py-3.5 text-[0.9375rem] text-ink " +
  "transition-colors duration-200 placeholder:text-muted/60 " +
  "hover:border-teal-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/15 " +
  "disabled:bg-platinum disabled:text-muted";

const controlError = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

function Wrapper({
  label,
  error,
  hint,
  required,
  className,
  id,
  children,
}: BaseFieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-teal-800">
        {label}
        {required ? (
          <span className="ml-1 text-olive-600" aria-hidden>
            *
          </span>
        ) : (
          <span className="ml-1.5 font-normal text-muted">(optional)</span>
        )}
      </label>

      {children}

      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: BaseFieldProps & React.ComponentProps<"input">) {
  const id = useId();
  return (
    <Wrapper
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, error && controlError)}
        {...props}
      />
    </Wrapper>
  );
}

export function TextArea({
  label,
  error,
  hint,
  required,
  className,
  ...props
}: BaseFieldProps & React.ComponentProps<"textarea">) {
  const id = useId();
  return (
    <Wrapper
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <textarea
        id={id}
        rows={5}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, "resize-y", error && controlError)}
        {...props}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  error,
  hint,
  required,
  className,
  options,
  ...props
}: BaseFieldProps &
  React.ComponentProps<"select"> & {
    options: Array<{ value: string; label: string }>;
  }) {
  const id = useId();
  return (
    <Wrapper
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
      className={className}
    >
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={cn(control, "cursor-pointer appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-11", error && controlError)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23667676' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Wrapper>
  );
}
