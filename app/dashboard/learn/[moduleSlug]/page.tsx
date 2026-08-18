import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, PlayCircle, ArrowLeft, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getModuleWithLessons } from "@/features/learning/queries";

const STATUS_ICONS = {
  completed: CheckCircle2,
  in_progress: PlayCircle,
  not_started: Circle,
};

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const data = await getModuleWithLessons(moduleSlug, profile.id);
  if (!data) notFound();

  const { module: mod, lessons } = data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/learn"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Learning
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">{mod.title}</h1>
        {mod.description && (
          <p className="mt-1 max-w-xl text-sm text-muted">{mod.description}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {lessons.map((lesson, i) => {
          const StatusIcon = STATUS_ICONS[lesson.status as keyof typeof STATUS_ICONS];

          return (
            <Link key={lesson.id} href={`/dashboard/learn/${mod.slug}/${lesson.slug}`}>
              <Card className="flex items-center gap-4 p-5 transition-colors hover:border-primary/50">
                <StatusIcon
                  className={
                    lesson.status === "completed"
                      ? "h-5 w-5 shrink-0 text-success"
                      : "h-5 w-5 shrink-0 text-muted"
                  }
                />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted">
                    Lesson {i + 1}
                  </p>
                  <p className="font-medium leading-snug">{lesson.title}</p>
                </div>
                {lesson.estimated_minutes && (
                  <span className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-muted">
                    <Clock className="h-3.5 w-3.5" />
                    {lesson.estimated_minutes}m
                  </span>
                )}
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
