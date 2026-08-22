import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";

export type Role = "student" | "club_member" | "super_admin";

const ROLE_RANK: Record<Role, number> = {
  student: 0,
  club_member: 1,
  super_admin: 2,
};

/** Returns the current session's user + profile, or null if signed out. */
export const getCurrentProfile = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
});

/**
 * Server Action / Server Component guard: throws the user back to /login
 * or /dashboard if they don't meet the minimum role.
 * This is layer 3 of the enforcement model — always re-check here even
 * though middleware also runs, since Server Actions can be invoked directly.
 */
export async function requireRole(minRole: Role) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (!profile.is_active) {
    redirect("/suspended");
  }

  if (ROLE_RANK[profile.role as Role] < ROLE_RANK[minRole]) {
    redirect("/dashboard");
  }

  return profile;
}
