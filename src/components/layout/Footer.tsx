import { getTranslations } from "next-intl/server";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiWhatsapp,
  SiYoutube,
} from "@icons-pack/react-simple-icons";

import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Section";
import { Logo } from "./Logo";
import { NewsletterForm } from "./NewsletterForm";
import { footerNav, social, site, phoneIntlOf, phoneDisplayOf } from "@/lib/site";
import { getClinicSettings } from "@/data/clinic";

// lucide 1.0 removed all brand icons, so social marks come from simple-icons.
const socialLinks = [
  { href: social.instagram, label: "Instagram", Icon: SiInstagram },
  { href: social.facebook, label: "Facebook", Icon: SiFacebook },
  { href: social.youtube, label: "YouTube", Icon: SiYoutube },
  { href: social.whatsapp, label: "WhatsApp", Icon: SiWhatsapp },
];

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const clinic = await getClinicSettings();

  const columns = [
    { title: t("treatments"), links: footerNav.treatments },
    { title: t("products"), links: footerNav.products },
    { title: t("clinic"), links: footerNav.clinic },
  ];

  return (
    <footer className="relative mt-auto bg-teal-900 text-teal-50">
      <Container className="py-20 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_2fr]">
          {/* ---------- Brand + contact ---------- */}
          <div className="max-w-sm">
            <Logo tone="dark" />

            <p className="mt-6 leading-relaxed text-teal-100/70">
              Homeopathic care for hair, skin and long-term wellbeing — led by{" "}
              <span className="text-white">Dr. Riji Rasheed, BHMS</span> in
              Kattakkada, Kerala.
            </p>

            <ul className="mt-8 flex flex-col gap-4 text-sm">
              <li>
                <a
                  href={`tel:${phoneIntlOf(clinic.phone)}`}
                  className="group flex items-start gap-3 text-teal-100/80 transition-colors hover:text-white"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-olive-400" strokeWidth={1.75} aria-hidden />
                  {phoneDisplayOf(clinic.phone)}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${clinic.email}`}
                  className="group flex items-start gap-3 text-teal-100/80 transition-colors hover:text-white"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-olive-400" strokeWidth={1.75} aria-hidden />
                  {clinic.email}
                </a>
              </li>
              <li className="flex items-start gap-3 text-teal-100/80">
                <MapPin className="mt-0.5 size-4 shrink-0 text-olive-400" strokeWidth={1.75} aria-hidden />
                <span>
                  {clinic.addressLine2},<br />
                  {clinic.city}, {clinic.state} {clinic.postalCode}
                </span>
              </li>
            </ul>

            <div className="mt-8">
              <p className="text-eyebrow font-semibold uppercase text-olive-300">
                {t("followUs")}
              </p>
              <ul className="mt-4 flex gap-2.5">
                {socialLinks.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid size-11 place-items-center rounded-2xl bg-white/5 text-teal-100/80 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                    >
                      <Icon size={18} aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ---------- Link columns + newsletter ---------- */}
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-eyebrow font-semibold uppercase tracking-[0.18em] text-olive-300">
                  {column.title}
                </h2>
                <ul className="mt-5 flex flex-col gap-3.5">
                  {column.links.map((link) => (
                    <li key={link.key}>
                      <Link
                        href={link.href}
                        className="text-[0.9375rem] text-teal-100/70 transition-colors hover:text-white"
                      >
                        {tn(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="sm:col-span-2 lg:col-span-3">
              <div className="rounded-4xl bg-white/5 p-8 ring-1 ring-white/10">
                <h2 className="font-display text-xl text-white">
                  {t("newsletterTitle")}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-teal-100/70">
                  {t("newsletterBody")}
                </p>
                <NewsletterForm
                  placeholder={t("emailPlaceholder")}
                  submitLabel={t("subscribe")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Legal ---------- */}
        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="max-w-4xl text-xs leading-relaxed text-teal-100/50">
            {t("disclaimer")}
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-teal-100/60">
              &copy; {new Date().getFullYear()} {site.name}. {t("rights")}
            </p>
            <ul className="flex gap-6">
              {footerNav.legal.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-teal-100/60 transition-colors hover:text-white"
                  >
                    {tn(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
}
