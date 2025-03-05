import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("user")?.value; // Perbaikan: Ambil nilai dari cookie dengan key "user"
  // Jika halaman berada di dalam /dashboard dan tidak ada token, redirect ke /login
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*", // Proteksi semua halaman di dalam /dashboard
};