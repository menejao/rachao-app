import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/signup", "/convite"];

export default auth((req) => {
  const isAuth = !!req.auth;
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (!isAuth && !isPublic) {
    const url = new URL("/login", req.nextUrl);
    url.searchParams.set("from", pathname);
    return Response.redirect(url);
  }

  if (isAuth && (pathname === "/login" || pathname === "/signup")) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|icons|sw\\.js|api/auth).*)",
  ],
};
