import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllQuizzesAdmin } from "@/features/admin/learning/queries";
import { deleteQuiz } from "@/features/admin/learning/actions";

export default async function AdminQuizzesPage() {
  const quizzes = await getAllQuizzesAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Learning — Quizzes"
        action={
          <div className="flex gap-2">
            <Link href="/admin/learning/modules">
              <Button variant="outline" size="sm">Modules</Button>
            </Link>
            <Link href="/admin/learning/quizzes/new">
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                New quiz
              </Button>
            </Link>
          </div>
        }
      />

      {quizzes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No quizzes yet" description="Create your first quiz." />
      ) : (
        <div className="flex flex-col gap-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/learning/quizzes/${quiz.id}/edit`}
                  className="font-medium hover:text-primary"
                >
                  {quiz.title}
                </Link>
                <p className="text-xs text-muted">{quiz.lessonTitle}</p>
              </div>
              <Badge tone="muted">Pass: {quiz.passing_score}%</Badge>
              <DeleteButton action={deleteQuiz} id={quiz.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
