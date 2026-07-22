import { redirect } from "next/navigation";
import { hasValidSession } from "@/lib/admin/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await hasValidSession()) redirect("/admin");

  return (
    <main className="grid min-h-svh place-items-center bg-teal-950 px-5 py-12">
      {/* Faint brand wash so the login doesn't feel like a bare utility page */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(122,152,51,0.15),transparent_55%)]"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <svg viewBox="0 0 24 24" className="size-7" aria-hidden fill="none">
              <path
                d="M12 3.5c4.2 2.1 6.5 5.2 6.5 8.6a6.5 6.5 0 1 1-13 0c0-3.4 2.3-6.5 6.5-8.6Z"
                stroke="#9DB955"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M12 20V9.5M12 13.2l3-2.6M12 15.8l-2.6-2.2"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <h1 className="mt-5 font-display text-3xl text-white">
            Clinic administration
          </h1>
          <p className="mt-2 text-sm text-teal-100/70">
            Dr. Riji&rsquo;s Health Care &middot; staff access only
          </p>
        </div>

        <div className="rounded-4xl bg-white p-8 shadow-lift sm:p-10">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-teal-100/50">
          Access is limited to authorised clinic staff. Activity may be logged.
        </p>
      </div>
    </main>
  );
}
