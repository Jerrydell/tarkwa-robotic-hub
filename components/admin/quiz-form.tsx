"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AiDraftPanel } from "./ai-draft-panel";
import { QuizQuestionEditor } from "./quiz-question-editor";
import { createQuiz, updateQuiz, type AdminFormState } from "@/features/admin/learning/actions";
import { generateQuizDraft, generateQuizFromLesson } from "@/features/admin/ai/actions";

interface Question {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface QuizDraft {
  title: string;
  questions: Question[];
}

interface Lesson {
  id: string;
  title: string;
}

interface QuizFormProps {
  mode: "create" | "edit";
  quizId?: string;
  lessons: Lesson[];
  initialTitle?: string;
  initialLessonId?: string | null;
  initialPassingScore?: number;
  initialQuestions?: Question[];
}

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save quiz"}
    </Button>
  );
}

export function QuizForm({
  mode,
  quizId,
  lessons,
  initialTitle = "",
  initialLessonId = "",
  initialPassingScore = 70,
  initialQuestions = [],
}: QuizFormProps) {
  const boundAction = mode === "edit" && quizId ? updateQuiz.bind(null, quizId) : createQuiz;
  const [state, formAction] = useFormState(boundAction, initialState);

  const [title, setTitle] = useState(initialTitle);
  const [lessonId, setLessonId] = useState(initialLessonId ?? "");
  const [questions, setQuestions] = useState(initialQuestions);
  const [draftVersion, setDraftVersion] = useState(0);
  const [fromLessonError, setFromLessonError] = useState<string | null>(null);
  const [isPendingFromLesson, startFromLessonTransition] = useTransition();

  function handleFromLesson() {
    if (!lessonId) {
      setFromLessonError("Select a lesson first.");
      return;
    }
    setFromLessonError(null);
    startFromLessonTransition(async () => {
      const result = await generateQuizFromLesson(lessonId);
      if ("error" in result) {
        setFromLessonError(result.error);
        return;
      }
      setTitle(result.title);
      setQuestions(result.questions);
      setDraftVersion((v) => v + 1);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <AiDraftPanel<QuizDraft>
        label="quiz"
        onGenerate={generateQuizDraft}
        onDraft={(draft) => {
          setTitle(draft.title);
          setQuestions(draft.questions);
          setDraftVersion((v) => v + 1);
        }}
      />

      {lessons.length > 0 && (
        <Card className="border-identity/30 bg-identity/5 p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-identity-light" />
            <p className="font-medium">Or generate from an existing lesson</p>
          </div>
          <p className="mt-1 text-sm text-muted">
            Grounds every question in the lesson&apos;s actual content instead of a fresh topic.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <select
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className={`${fieldClass} flex-1`}
            >
              <option value="">Select a lesson...</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" onClick={handleFromLesson} disabled={isPendingFromLesson}>
              {isPendingFromLesson ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate from lesson
            </Button>
          </div>
          {fromLessonError && <p className="mt-2 text-sm text-danger">{fromLessonError}</p>}
        </Card>
      )}

      <form action={formAction} className="flex flex-col gap-5">
        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm text-muted">
            Quiz title
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="lessonId" className="mb-1.5 block text-sm text-muted">
              Attach to lesson (optional)
            </label>
            <select
              id="lessonId"
              name="lessonId"
              value={lessonId}
              onChange={(e) => setLessonId(e.target.value)}
              className={fieldClass}
            >
              <option value="">Standalone (no lesson)</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="passingScore" className="mb-1.5 block text-sm text-muted">
              Passing score (%)
            </label>
            <input
              id="passingScore"
              name="passingScore"
              type="number"
              min={0}
              max={100}
              defaultValue={initialPassingScore}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm text-muted">Questions</p>
          <QuizQuestionEditor key={draftVersion} initialQuestions={questions} />
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.success && <p className="text-sm text-success">Saved</p>}

        <SaveButton />
      </form>
    </div>
  );
}
