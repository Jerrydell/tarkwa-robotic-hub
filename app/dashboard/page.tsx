import { getCurrentProfile } from "@/lib/auth/helpers";
import { getProgressSummary, getNextLesson } from "@/features/learning/queries";
import { getMembershipApplication } from "@/features/membership/queries";
import { getNotifications } from "@/features/notifications/queries";
import { StreakCard } from "@/components/dashboard/streak-card";
import { NextLessonCard } from "@/components/dashboard/next-lesson-card";
import { MembershipStatusCard } from "@/components/dashboard/membership-status-card";
import { NotificationsPreview } from "@/components/dashboard/notifications-preview";
import { Card } from "@/components/ui/card";

export default async function DashboardHomePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [summary, nextLesson, application, notifications] = await Promise.all([
    getProgressSummary(profile.id),
    getNextLesson(profile.id),
    getMembershipApplication(profile.id),
    getNotifications(profile.id, 4),
  ]);

  const percentComplete =
    summary.totalLessons > 0
      ? Math.round((summary.completedLessons / summary.totalLessons) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome back, {profile.full_name?.split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {summary.completedLessons} of {summary.totalLessons} lessons complete
          ({percentComplete}%)
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StreakCard
          currentStreak={summary.currentStreak}
          longestStreak={summary.longestStreak}
        />
        <MembershipStatusCard status={application?.status ?? null} />
        <NextLessonCard nextLesson={nextLesson} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NotificationsPreview notifications={notifications} />
        <Card className="p-6">
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            Overall progress
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-muted">
            {percentComplete}% of all published lessons complete
          </p>
        </Card>
      </div>
    </div>
  );
}
