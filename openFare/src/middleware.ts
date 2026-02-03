import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { UserRole } from "@prisma/client";
import { verifyAccessToken } from "@/lib/tokenManager";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log("🛡️ MIDDLEWARE HIT:", pathname);

  // Handle page routes (non-API routes)
  if (!pathname.startsWith("/api")) {
    // Public routes that everyone can access
    if (pathname === "/" || pathname.startsWith("/login")) {
      console.log("✅ PUBLIC ROUTE - ALLOWING");
      return NextResponse.next();
    }

    // Protected page routes
    if (
      pathname.startsWith("/dashboard") || 
      pathname.startsWith("/users")
    ) {
      // For page routes, we still use the cookie token as before
      // In a real implementation, we'd want to check the access token from auth header
      // But for now, keeping compatibility with existing page routes
      const token = req.cookies.get("token")?.value;
      console.log("📋 Cookie Token:", token);

      if (!token) {
        console.log("❌ NO TOKEN - REDIRECTING TO LOGIN");
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
      }

      try {
        const { payload } = await jwtVerify(token, secret);
        console.log("✅ Token verified for page access, role:", payload.role);
        return NextResponse.next();
      } catch (error) {
        console.log("❌ TOKEN VERIFICATION FAILED:", error);
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Let other page routes pass through
    return NextResponse.next();
  }

  // Handle API routes (your existing logic)
  if (pathname.startsWith("/api/auth")) {
    console.log("⏭️ SKIPPING AUTH API ROUTE");
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");
  console.log("📋 Auth Header:", authHeader);
  
  const token = authHeader?.split(" ")[1];
  console.log("🎫 Token:", token);

  if (!token || token.trim() === "") {
    console.log("❌ NO TOKEN - REJECTING API REQUEST");
    return NextResponse.json(
      { success: false, message: "Authorization token missing" },
      { status: 401 }
    );
  }

  try {
    // Verify access token using our new token manager
    const decodedToken = await verifyAccessToken(token);
        
    if (!decodedToken) {
      console.log("❌ ACCESS TOKEN VERIFICATION FAILED - INVALID TOKEN");
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 403 }
      );
    }
        
    console.log("✅ API Token verified, role:", decodedToken.role);
  
    const role = decodedToken.role as UserRole;
  
    // ADMIN-only users route
    if (pathname.startsWith("/api/users") && role !== UserRole.ADMIN) {
      console.log("🚫 NON-ADMIN trying to access /api/users");
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }
  
    console.log("✅ API AUTHORIZED - Proceeding");
    return NextResponse.next();
  
  } catch (error) {
    console.log("❌ API TOKEN VERIFICATION FAILED:", error);
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 403 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};