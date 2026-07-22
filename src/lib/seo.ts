import type { Metadata } from "next";
import { site, doctor, contact, social, phoneIntlOf } from "./site";
import type { ClinicSettings } from "@/data/clinic";
import type { Locale } from "@/i18n/routing";

/* ==========================================================================
   Metadata helpers
   ========================================================================== */

type PageMetaInput = {
  title: string;
  description: string;
  path: string; // locale-less path, e.g. "/hair-treatment"
  locale: Locale;
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  locale,
  images,
  type = "website",
  publishedTime,
}: PageMetaInput): Metadata {
  const canonical = `${site.url}/${locale}${path === "/" ? "" : path}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        en: `${site.url}/en${path === "/" ? "" : path}`,
        ml: `${site.url}/ml${path === "/" ? "" : path}`,
        "x-default": `${site.url}/en${path === "/" ? "" : path}`,
      },
    },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: site.name,
      locale: locale === "ml" ? "ml_IN" : "en_IN",
      // Omitting `images` lets Next's opengraph-image.tsx file convention
      // supply the generated card — there is no static PNG to keep in sync.
      ...(images ? { images } : {}),
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

/* ==========================================================================
   JSON-LD builders

   Every node carries a stable @id so the graph can cross-reference rather
   than duplicating the organisation on each page.
   ========================================================================== */

const ORG_ID = `${site.url}/#organization`;
const DOCTOR_ID = `${site.url}/#physician`;

function postalAddressFor(settings?: ClinicSettings) {
  const a = settings
    ? {
        line1: settings.addressLine1,
        line2: settings.addressLine2,
        city: settings.city,
        state: settings.state,
        postalCode: settings.postalCode,
      }
    : {
        line1: contact.address.line1,
        line2: contact.address.line2,
        city: contact.address.city,
        state: contact.address.state,
        postalCode: contact.address.postalCode,
      };
  return {
    "@type": "PostalAddress",
    streetAddress: `${a.line1}, ${a.line2}`,
    addressLocality: a.city,
    addressRegion: a.state,
    postalCode: a.postalCode,
    addressCountry: "IN",
  };
}

const openingHours = contact.openingHoursSpec.map((slot) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: slot.days,
  opens: slot.opens,
  closes: slot.closes,
}));

/** MedicalClinic + LocalBusiness for the clinic itself. */
export function medicalClinicSchema(settings?: ClinicSettings) {
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "@id": ORG_ID,
    name: site.name,
    description: site.description,
    url: site.url,
    telephone: settings ? phoneIntlOf(settings.phone) : contact.phoneIntl,
    email: settings?.email ?? contact.email,
    address: postalAddressFor(settings),
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.geo.lat,
      longitude: contact.geo.lng,
    },
    openingHoursSpecification: openingHours,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    medicalSpecialty: "Dermatology",
    availableService: [
      { "@type": "MedicalTherapy", name: "Homeopathic hair and scalp treatment" },
      { "@type": "MedicalTherapy", name: "Homeopathic treatment for skin conditions" },
      { "@type": "MedicalTherapy", name: "Chronic disease management" },
      { "@type": "MedicalTherapy", name: "Women's health consultation" },
      { "@type": "MedicalTherapy", name: "Paediatric homeopathy" },
    ],
    sameAs: [social.instagram, social.facebook, social.youtube],
  };
}

/** Physician node for Dr. Riji Rasheed. */
export function physicianSchema(settings?: ClinicSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": DOCTOR_ID,
    name: doctor.name,
    honorificSuffix: doctor.credentials,
    jobTitle: doctor.role,
    medicalSpecialty: "Dermatology",
    url: `${site.url}/en/about`,
    telephone: settings ? phoneIntlOf(settings.phone) : contact.phoneIntl,
    address: postalAddressFor(settings),
    worksFor: { "@id": ORG_ID },
    memberOf: { "@id": ORG_ID },
    knowsAbout: [
      "Homeopathy",
      "Hair fall treatment",
      "Alopecia areata",
      "Dandruff and seborrhoeic dermatitis",
      "Skin disorders",
      "Thyroid disorders",
      "PCOD",
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    publisher: { "@id": ORG_ID },
    inLanguage: ["en-IN", "ml-IN"],
  };
}

type ProductSchemaInput = {
  name: string;
  slug: string;
  description: string;
  price: number; // paise
  image?: string;
  inStock: boolean;
  rating?: { value: number; count: number };
};

export function productSchema(p: ProductSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.slug,
    brand: { "@type": "Brand", name: site.name },
    ...(p.image ? { image: [`${site.url}${p.image}`] } : {}),
    offers: {
      "@type": "Offer",
      url: `${site.url}/en/shop/${p.slug}`,
      priceCurrency: site.currency,
      price: (p.price / 100).toFixed(2),
      availability: p.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: { "@id": ORG_ID },
    },
    ...(p.rating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: p.rating.value,
            reviewCount: p.rating.count,
          },
        }
      : {}),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function blogPostingSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: { "@id": DOCTOR_ID },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: `${site.url}/en/blog/${post.slug}`,
    ...(post.image ? { image: [`${site.url}${post.image}`] } : {}),
  };
}

export function breadcrumbSchema(
  crumbs: Array<{ name: string; href: string }>,
  locale: Locale,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${site.url}/${locale}${crumb.href === "/" ? "" : crumb.href}`,
    })),
  };
}

export function medicalConditionSchema(condition: {
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalCondition",
    name: condition.name,
    description: condition.description,
    signOrSymptom: condition.symptoms.map((s) => ({
      "@type": "MedicalSymptom",
      name: s,
    })),
    cause: condition.causes.map((c) => ({ "@type": "MedicalCause", name: c })),
    possibleTreatment: {
      "@type": "MedicalTherapy",
      name: "Individualised homeopathic treatment",
      provider: { "@id": ORG_ID },
    },
  };
}
