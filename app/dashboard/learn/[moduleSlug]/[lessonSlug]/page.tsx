import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getLessonDetail } from "@/features/learning/queries";
import { LessonContentRenderer } from "@/components/dashboard/lesson-content-renderer";
import { MarkCompleteButton } from "@/components/dashboard/mark-complete-button";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ moduleSlug: string; lessonSlug: string }>;
}) {
  const { moduleSlug, lessonSlug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const data = await getLessonDetail(moduleSlug, lessonSlug, profile.id);
  if (!data) notFound();

  const { module: mod, lesson, status, quiz, nextLesson, previousLesson } = data;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div>
        <Link
          href={`/dashboard/learn/${mod.slug}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {mod.title}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{lesson.title}</h1>
      </div>

      {(lesson.objectives?.length > 0 || lesson.materials?.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {lesson.objectives?.length > 0 && (
            <Card className="p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                Objectives
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {lesson.objectives.map((obj: string, i: number) => (
                  <li key={i} className="text-sm text-foreground/90">
                    • {obj}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {lesson.materials?.length > 0 && (
            <Card className="p-5">
              <p className="font-mono text-xs uppercase tracking-wider text-muted">
                Materials needed
              </p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {lesson.materials.map((mat: string, i: number) => (
                  <li key={i} className="text-sm text-foreground/90">
                    • {mat}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      <LessonContentRenderer blocks={lesson.content_body} />

      {quiz && (
        <Link href={`/dashboard/quizzes/${quiz.id}`}>
          <Card className="flex items-center gap-4 border-primary/30 bg-primary/5 p-5 transition-colors hover:border-primary">
            <ClipboardCheck className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
            <div className="flex-1">
              <p className="font-medium">Quiz: {quiz.title}</p>
              <p className="text-sm text-muted">Test what you just learned</p>
            </div>
            <ArrowRight className="h-4 w-4 text-primary" />
          </Card>
        </Link>
      )}

      <div className="flex flex-col-reverse items-center justify-between gap-4 border-t border-border/60 pt-6 sm:flex-row">
        {previousLesson ? (
          <Link href={`/dashboard/learn/${mod.slug}/${previousLesson.slug}`}>
            <Button variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Previous lesson
            </Button>
          </Link>
        ) : (
          <span />
        )}

        <MarkCompleteButton
          lessonId={lesson.id}
          moduleSlug={mod.slug}
          isComplete={status === "completed"}
        />

        {nextLesson ? (
          <Link href={`/dashboard/learn/${mod.slug}/${nextLesson.slug}`}>
            <Button variant="ghost">
              Next lesson
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
