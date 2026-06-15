import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { locales, defaultLocale, isValidLocale } from "@/lib/i18n/config";

const { auth } = NextAuth(authConfig);

function getLocale(request: NextRequest): string {
  const pathname = request.nextUrl.pathname;
  const pathnameLocale = pathname.split("/")[1];
  if (isValidLocale(pathnameLocale)) return pathnameLocale;

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale;

  const acceptLang = request.headers.get("accept-language") ?? "";
  if (acceptLang.includes("ar")) return "ar";
  return defaultLocale;
}

function handleAboutAnchorRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const normalized = pathname.replace(/\/$/, "") || "/";

  let locale: string | null = null;
  if (normalized === "/about") {
    locale = getLocale(request);
  } else {
    for (const l of locales) {
      if (normalized === `/${l}/about`) {
        locale = l;
        break;
      }
    }
  }

  if (!locale) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}`;
  url.hash = "about";
  return NextResponse.redirect(url);
}

function handleBlogNewsRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const normalized = pathname.replace(/\/$/, "") || "/";

  let locale: string | null = null;
  if (normalized === "/blog") {
    locale = getLocale(request);
  } else {
    for (const l of locales) {
      if (normalized === `/${l}/blog`) {
        locale = l;
        break;
      }
    }
  }

  if (!locale) return null;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/news`;
  url.hash = "";
  return NextResponse.redirect(url);
}

function handleLocaleRedirect(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/admin") ||
    pathname.includes(".")
  ) {
    return null;
  }

  const aboutRedirect = handleAboutAnchorRedirect(request);
  if (aboutRedirect) return aboutRedirect;

  const blogRedirect = handleBlogNewsRedirect(request);
  if (blogRedirect) return blogRedirect;

  const pathnameHasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  const locale = pathname.split("/")[1];
  if (isValidLocale(locale)) {
    response.cookies.set("NEXT_LOCALE", locale, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }
  return response;
}

export default auth((request) => {
  const localeResponse = handleLocaleRedirect(request);
  if (localeResponse) return localeResponse;
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|uploadthing|.*\\..*).*)",
  ],
};
