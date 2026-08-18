import { createClient } from "@/lib/supabase/server";

export interface AchievementWithStatus {
  id: string;
  title: string;
  description: string | null;
  icon_url: string | null;
  criteria_type: string;
  criteria_value: number | null;
  earnedAt: string | null;
}

/** All achievements in the system, flagged with whether this user has earned each one. */
export async function getAchievementsWithStatus(
  userId: string
): Promise<AchievementWithStatus[]> {
  const supabase = await createClient();

  const [{ data: achievements }, { data: earned }] = await Promise.all([
    supabase
      .from("achievements")
      .select("id, title, description, icon_url, criteria_type, criteria_value"),
    supabase
      .from("user_achievements")
      .select("achievement_id, earned_at")
      .eq("user_id", userId),
  ]);

  const earnedMap = new Map(
    (earned ?? []).map((e) => [e.achievement_id, e.earned_at])
  );

  return (achievements ?? []).map((a) => ({
    ...a,
    earnedAt: earnedMap.get(a.id) ?? null,
  }));
}
