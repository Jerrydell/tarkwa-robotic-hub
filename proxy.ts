import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Route guard layer 1 of 3 (see Phase 1 architecture doc, Section 5).
 * This is a UX convenience — the real enforcement is Postgres RLS.
 * Never trust this alone for anything security-sensitive.
 *
 * Named "proxy" per the Next.js 16 convention (formerly "middleware" —
 * same behavior, renamed file/export, see nextjs.org/docs/messages/middleware-to-proxy).
 */
export async function proxy(request: NextRequest) {
  const { response, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isDashboardRoute = path.startsWith("/dashboard");
  const isAdminRoute = path.startsWith("/admin");
  const isExemptRoute = path === "/login" || path === "/suspended" || path === "/maintenance";

  // Not logged in, trying to reach a protected route -> send to login
  if (!user && (isDashboardRoute || isAdminRoute)) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", path);
    return NextResponse.redirect(redirectUrl);
  }

  let role: string | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    role = profile?.role;

    if ((isDashboardRoute || isAdminRoute) && profile && !profile.is_active && path !== "/suspended") {
      return NextResponse.redirect(new URL("/suspended", request.url));
    }

    if (isAdminRoute && role !== "super_admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Site-wide maintenance mode: everyone except a logged-in Super Admin
  // gets redirected, on every route except the exempt ones above.
  if (!isExemptRoute && role !== "super_admin") {
    const { data: isMaintenance } = await supabase
      .rpc("get_site_setting", { setting_key: "maintenance_mode" });

    if (isMaintenance === true) {
      return NextResponse.redirect(new URL("/maintenance", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on everything except static assets and Next internals,
     * so session cookies stay fresh across the whole app.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
