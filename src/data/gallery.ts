/**
 * Clinic photo gallery for the About page — admin-editable via the
 * "Clinic Photos" workspace. Images are uploaded through the admin panel and
 * served from /uploads. Until photos exist, the About page falls back to its
 * labelled placeholder slots.
 */

import { readDoc } from "@/lib/admin/store";

export type GalleryItem = {
  /** /uploads/… URL produced by the admin upload. */
  image: string;
  label: string;
};

export async function getGallery(): Promise<GalleryItem[]> {
  const items = await readDoc<GalleryItem[]>("gallery", []);
  // Only items with an actual image render on the site.
  return items.filter((item) => Boolean(item.image));
}

export function getGalleryDefaults(): GalleryItem[] {
  return [];
}
