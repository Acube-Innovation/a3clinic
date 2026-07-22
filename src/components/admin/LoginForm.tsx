"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";

import { loginAction } from "@/lib/admin/actions";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField
        label="Email"
        name="email"
        type="email"
        required
        autoComplete="username"
        placeholder="admin@…"
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        placeholder="••••••••"
      />

      {state.error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="mt-1 w-full">
        {pending ? "Signing in…" : "Sign in"}
        <LogIn className="size-4" strokeWidth={2} aria-hidden />
      </Button>
    </form>
  );
}
