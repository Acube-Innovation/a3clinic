import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// NOTE: this file was called `middleware.ts` before Next.js 16 and the exported
// function is now `proxy`. The next-intl import path is unchanged.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|trpc|admin|_next|_vercel|.*\\..*).*)",
};
