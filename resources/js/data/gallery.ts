/**
 * Types and static values only. Content itself comes from Laravel as page
 * props (App\Support\SiteData), replacing the Next.js async getters.
 */

export type GalleryItem = {
  /** /uploads/… URL produced by the admin upload. */
  image: string;
  label: string;
};
