import { Trophy, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { AchievementWithStatus } from "@/features/achievements/queries";

export function BadgeCard({ achievement }: { achievement: AchievementWithStatus }) {
  const earned = achievement.earnedAt !== null;

  return (
    <Card
      className={cn(
        "flex flex-col items-center gap-2 p-6 text-center",
        !earned && "opacity-50"
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full",
          earned ? "bg-primary/10 text-primary" : "bg-surface-elevated text-muted"
        )}
      >
        {earned ? <Trophy className="h-6 w-6" strokeWidth={1.75} /> : <Lock className="h-5 w-5" strokeWidth={1.75} />}
      </div>
      <p className="font-medium">{achievement.title}</p>
      {achievement.description && (
        <p className="text-xs text-muted">{achievement.description}</p>
      )}
    </Card>
  );
}
