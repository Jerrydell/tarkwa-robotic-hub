import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getModulesWithProgress } from "@/features/learning/queries";
import type { ModuleLevel } from "@/types/database.types";

const LEVEL_LABELS: Record<ModuleLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default async function MyLearningPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const modules = await getModulesWithProgress(profile.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My Learning</h1>
        <p className="mt-1 text-sm text-muted">
          Every published module, in order. Pick up where you left off.
        </p>
      </div>

      {modules.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No modules published yet"
          description="Check back soon — new learning content is on its way."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => {
            const percent =
              mod.totalLessons > 0
                ? Math.round((mod.completedLessons / mod.totalLessons) * 100)
                : 0;
            const isComplete = mod.totalLessons > 0 && percent === 100;

            return (
              <Link key={mod.id} href={`/dashboard/learn/${mod.slug}`}>
                <Card className="flex h-full flex-col p-6 transition-colors hover:border-primary/50">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug">{mod.title}</h3>
                    {isComplete && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                    )}
                  </div>
                  {mod.description && (
                    <p className="mt-2 flex-1 text-sm text-muted">
                      {mod.description}
                    </p>
                  )}
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Badge tone="muted">{LEVEL_LABELS[mod.level]}</Badge>
                    <span className="font-mono text-xs text-muted">
                      {mod.completedLessons}/{mod.totalLessons} lessons
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
