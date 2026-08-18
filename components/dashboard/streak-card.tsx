import { Flame } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StreakCard({
  currentStreak,
  longestStreak,
}: {
  currentStreak: number;
  longestStreak: number;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          Learning streak
        </p>
        <Flame
          className={currentStreak > 0 ? "h-5 w-5 text-warning" : "h-5 w-5 text-muted"}
          strokeWidth={1.75}
        />
      </div>
      <p className="mt-3 font-display text-4xl font-semibold">
        {currentStreak}
        <span className="ml-1.5 text-base font-normal text-muted">
          {currentStreak === 1 ? "day" : "days"}
        </span>
      </p>
      <p className="mt-1 text-sm text-muted">
        Longest streak: {longestStreak} {longestStreak === 1 ? "day" : "days"}
      </p>
    </Card>
  );
}
