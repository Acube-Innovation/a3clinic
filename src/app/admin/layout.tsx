import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "../globals.css";

/**
 * Admin root layout. Lives outside the [locale] segment — the panel is
 * English-only and next-intl's proxy explicitly skips /admin.
 */

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Admin — Dr. Riji's Health Care",
    template: "%s | Admin — Dr. Riji's Health Care",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-platinum">{children}</body>
    </html>
  );
}
