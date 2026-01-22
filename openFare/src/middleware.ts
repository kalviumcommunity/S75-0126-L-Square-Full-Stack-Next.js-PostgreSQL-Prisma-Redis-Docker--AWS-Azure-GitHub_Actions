import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UserRole } from "@prisma/client";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("🛡️ MIDDLEWARE HIT:", pathname);

  // Protect API routes except auth
  if (!pathname.startsWith("/api") || pathname.startsWith("/api/auth")) {
    console.log("⏭️ SKIPPING (not API or is auth route)");
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  console.log("📋 Auth Header:", authHeader);
  
  const token = authHeader?.split(" ")[1];
  console.log("🎫 Token:", token);

  if (!token || token.trim() === "") {
    console.log("❌ NO TOKEN - REJECTING");
    return NextResponse.json(
      { success: false, message: "Authorization token missing" },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    console.log("✅ Token verified, role:", payload.role);

    const role = payload.role as UserRole;

    // ADMIN-only users route
    if (pathname.startsWith("/api/users") && role !== UserRole.ADMIN) {
      console.log("🚫 NON-ADMIN trying to access /api/users");
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    console.log("✅ AUTHORIZED - Proceeding");
    return NextResponse.next();

  } catch (error) {
    console.log("❌ TOKEN VERIFICATION FAILED:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 403 }
    );
  }
}

export const config = {
  matcher: ["/api/:path*"],
};