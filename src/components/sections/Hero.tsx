import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { CalendarCheck, Check, ShieldCheck, ShoppingBag, Sparkles, Star } from "lucide-react";

import { Container } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { doctor } from "@/lib/site";

/** Decorative leaf, floated around the portrait. */
function Leaf({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden fill="none">
      <path
        d="M16 2C6 10 2 20 6 28c3 6 12 8 18 3 6-4 8-14 4-22-2-4-6-6-12-7Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M16 38V10M16 20l7-6M16 27l-6-5"
        stroke="#F5F8EC"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

export async function Hero() {
  const t = await getTranslations("hero");
  const tc = await getTranslations("common");

  const features = [
    t("features.qualified"),
    t("features.specialist"),
    t("features.online"),
    t("features.formulated"),
  ];

  return (
    <section className="relative isolate overflow-hidden pb-20 pt-28 sm:pb-28 sm:pt-36 lg:pb-32 lg:pt-44">
      {/* ---------------------------- Background ---------------------------- */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {/* The clinic reception photograph. Decorative — the adjacent copy
            carries the information, so alt stays empty. */}
        <Image
          src="/images/hero-clinic.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          // object-left slides the photo's own signage wall toward the right
          // of the frame so it doesn't tangle with the headline text.
          className="object-cover object-left"
        />

        {/* 85% dark-green overlay: deep, near-solid brand surface with the
            clinic interior as a faint texture behind the white copy. */}
        <div className="absolute inset-0 bg-teal-950/85" />
        {/* Soft fade into the next (platinum) section. */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </div>

      <Container>
        <div className="grid items-center gap-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          {/* ------------------------------- Left ------------------------------- */}
          <Reveal className="max-w-2xl">
            <div>
              <span className="inline-flex items-center gap-2.5 rounded-full bg-teal-50/90 py-2 pl-2.5 pr-4 ring-1 ring-teal-100">
                <span className="grid size-6 place-items-center rounded-full bg-white text-olive-600 shadow-soft">
                  <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
                </span>
                <span className="text-eyebrow font-semibold uppercase text-teal-700">
                  {t("eyebrow")}
                </span>
              </span>

              <h1 className="mt-7 text-display text-white">
                {t("titleLine1")}
                <br />
                <span className="text-olive-300">{t("titleLine2")}</span>
              </h1>

              <p className="mt-7 max-w-xl text-lead text-teal-50/90">
                {t("description")}
              </p>

              <div className="mt-10 grid gap-3.5 sm:grid-cols-2">
                <Button href="/book" size="xl" variant="lime" className="w-full">
                  <CalendarCheck aria-hidden strokeWidth={2} className="size-5.5" />
                  {tc("bookConsultation")}
                </Button>
                <Button href="/shop" size="xl" variant="secondary" className="w-full">
                  <ShoppingBag aria-hidden strokeWidth={2} className="size-5.5" />
                  {tc("shopProducts")}
                </Button>
              </div>

              <ul className="mt-11 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-olive-100 text-olive-700">
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span className="text-[0.9375rem] font-medium text-white/90">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ------------------------------- Right ------------------------------ */}
          <Reveal direction="left" delay={0.15} className="relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Portrait with the soft olive frame */}
              <div className="relative rounded-[2.75rem] bg-white/80 p-2.5 shadow-lift ring-1 ring-olive-200/70 backdrop-blur-sm">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2.25rem]">
                  <Image
                    src="/images/doctor-portrait.jpg"
                    alt={`${doctor.name}, ${doctor.credentials}, at the consultation desk of the Kattakkada clinic`}
                    fill
                    priority
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 28rem, 100vw"
                    className="object-cover"
                  />
                </div>

                {/* Credential ribbon */}
                <div className="absolute inset-x-2.5 bottom-2.5 rounded-b-[2.25rem] bg-gradient-to-t from-teal-950/85 via-teal-950/55 to-transparent px-7 pb-7 pt-16">
                  <p className="font-display text-2xl text-white">
                    {doctor.name}
                  </p>
                  <p className="mt-1 text-sm text-teal-100/80">
                    {doctor.credentials} &middot; {doctor.speciality}
                  </p>
                </div>
              </div>

              {/* Floating: rating chip */}
              <div className="absolute -left-4 top-10 hidden animate-float-slow rounded-2xl bg-white/90 p-4 shadow-card ring-1 ring-line backdrop-blur-sm sm:block lg:-left-10">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      aria-hidden
                      className="size-3.5 fill-olive-500 text-olive-500"
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-semibold text-teal-800">
                  Trusted by families
                </p>
                <p className="text-xs text-muted">across Kerala &amp; abroad</p>
              </div>

              {/* Floating: product bottle */}
              <div className="absolute -right-3 bottom-16 animate-float-slower lg:-right-10">
                <div className="rounded-3xl bg-white/90 p-4 shadow-card ring-1 ring-line backdrop-blur-sm">
                  <div className="flex items-center gap-3.5">
                    {/* Simple bottle illustration in-palette */}
                    <svg
                      viewBox="0 0 40 64"
                      className="h-16 w-10 shrink-0"
                      aria-hidden
                    >
                      <rect x="15" y="2" width="10" height="9" rx="2" fill="#044B4D" />
                      <rect x="13" y="9" width="14" height="5" rx="1.5" fill="#0A5456" />
                      <path
                        d="M11 18a6 6 0 0 1 6-6h6a6 6 0 0 1 6 6v38a6 6 0 0 1-6 6h-6a6 6 0 0 1-6-6V18Z"
                        fill="url(#bottle-fill)"
                      />
                      <rect x="14" y="27" width="12" height="18" rx="2" fill="#FCFCFC" opacity="0.9" />
                      <path d="M17 33h6M17 37h6M17 41h4" stroke="#7A9833" strokeWidth="1.3" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="bottle-fill" x1="11" y1="12" x2="29" y2="62">
                          <stop stopColor="#156063" />
                          <stop offset="1" stopColor="#044B4D" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-olive-600">
                        Doctor formulated
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-teal-800">
                        Root Revival
                      </p>
                      <p className="text-xs text-muted">Hair Oil &middot; 200 ml</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating: verification badge */}
              <div className="absolute -left-2 bottom-40 hidden animate-float-slow rounded-2xl bg-teal-800 px-4 py-3 shadow-lift lg:flex lg:items-center lg:gap-2.5">
                <ShieldCheck className="size-4 text-olive-300" strokeWidth={2} aria-hidden />
                <span className="text-xs font-semibold text-white">
                  BHMS registered
                </span>
              </div>

              {/* Decorative leaves */}
              <Leaf className="absolute -right-2 -top-4 h-10 w-8 animate-float-slow text-olive-400/70" />
              <Leaf className="absolute -left-6 bottom-4 h-7 w-6 rotate-[-35deg] animate-float-slower text-teal-300/60" />
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
