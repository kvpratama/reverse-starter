import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { signToken, verifyToken } from "@/lib/auth/session";

const protectedRoutes = "/admin";
const protectedRoutes2 = "/recruiter";
const protectedRoutes3 = "/jobseeker";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session");
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isProtectedRoute2 = pathname.startsWith(protectedRoutes2);
  const isProtectedRoute3 = pathname.startsWith(protectedRoutes3);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isProtectedRoute2 && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  } else if (isProtectedRoute3 && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      const userRole = parsed.user.role;

      // Role-based redirection
      if (pathname.startsWith(protectedRoutes2) && userRole !== "Recruiter") {
        return NextResponse.redirect(new URL("/", request.url));
      } else if (
        pathname.startsWith(protectedRoutes3) &&
        userRole !== "Job Seeker"
      ) {
        return NextResponse.redirect(new URL("/", request.url));
      } else if (pathname.startsWith(protectedRoutes) && userRole !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }

      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: "session",
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error("Error updating session:", error);
      res.cookies.delete("session");
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  runtime: "nodejs",
};
