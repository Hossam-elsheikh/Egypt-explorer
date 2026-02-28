import createMiddleware from 'next-intl/middleware';
import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ['en', 'de', 'ru', 'fr'],
  defaultLocale: 'en'
});

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSession(request);

  // Run next-intl middleware
  const intlResponse = intlMiddleware(request);

  // Merge cookies from supabase
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
