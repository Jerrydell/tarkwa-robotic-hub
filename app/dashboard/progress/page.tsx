import { Flame, BookOpen, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getProgressSummary } from "@/features/learning/queries";
import { getAchievementsWithStatus } from "@/features/achievements/queries";
import { BadgeCard } from "@/components/dashboard/badge-card";

export default async function ProgressPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [summary, achievements] = await Promise.all([
    getProgressSummary(profile.id),
    getAchievementsWithStatus(profile.id),
  ]);

  const earnedCount = achievements.filter((a) => a.earnedAt).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Progress & Badges</h1>
        <p className="mt-1 text-sm text-muted">
          Everything you&apos;ve completed so far.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-6">
          <BookOpen className="h-6 w-6 text-primary" strokeWidth={1.75} />
          <div>
            <p className="font-display text-2xl font-semibold">
              {summary.completedLessons}/{summary.totalLessons}
            </p>
            <p className="text-sm text-muted">Lessons complete</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <Flame className="h-6 w-6 text-warning" strokeWidth={1.75} />
          <div>
            <p className="font-display text-2xl font-semibold">
              {summary.currentStreak}
            </p>
            <p className="text-sm text-muted">Day streak</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-6">
          <Trophy className="h-6 w-6 text-primary" strokeWidth={1.75} />
          <div>
            <p className="font-display text-2xl font-semibold">
              {earnedCount}/{achievements.length}
            </p>
            <p className="text-sm text-muted">Badges earned</p>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {achievements.map((a) => (
            <BadgeCard key={a.id} achievement={a} />
          ))}
        </div>
      </div>
    </div>
  );
}
