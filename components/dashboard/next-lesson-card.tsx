import Link from "next/link";
import { ArrowRight, BookOpen, PartyPopper } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface NextLessonCardProps {
  nextLesson: { moduleSlug: string; lessonSlug: string; lessonTitle: string } | null;
}

export function NextLessonCard({ nextLesson }: NextLessonCardProps) {
  if (!nextLesson) {
    return (
      <Card className="flex flex-col items-start gap-3 p-6 sm:col-span-2">
        <PartyPopper className="h-6 w-6 text-primary" strokeWidth={1.75} />
        <div>
          <p className="font-semibold">You&apos;re all caught up</p>
          <p className="mt-1 text-sm text-muted">
            You&apos;ve completed every published lesson. Check back soon for more.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col justify-between gap-4 p-6 sm:col-span-2 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted">
            Continue learning
          </p>
          <p className="mt-1 font-semibold">{nextLesson.lessonTitle}</p>
        </div>
      </div>
      <Link href={`/dashboard/learn/${nextLesson.moduleSlug}/${nextLesson.lessonSlug}`}>
        <Button className="group w-full sm:w-auto">
          Continue
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Button>
      </Link>
    </Card>
  );
}
