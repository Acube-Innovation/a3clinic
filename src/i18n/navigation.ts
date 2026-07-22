import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation. Always import
 * `Link` from here rather than from `next/link` so locale prefixes are preserved.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
