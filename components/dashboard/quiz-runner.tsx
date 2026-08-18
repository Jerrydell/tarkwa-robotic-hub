"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { submitQuizAttempt, type QuizResult } from "@/features/quizzes/actions";

interface QuizQuestionPublic {
  question: string;
  options: string[];
}

export function QuizRunner({
  quizId,
  questions,
  returnHref,
}: {
  quizId: string;
  questions: QuizQuestionPublic[];
  returnHref: string;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const allAnswered = answers.every((a) => a !== null);

  function handleSubmit() {
    startTransition(async () => {
      const res = await submitQuizAttempt(quizId, answers as number[]);
      if ("error" in res) {
        setError(res.error);
        return;
      }
      setResult(res);
    });
  }

  function handleRetry() {
    setAnswers(Array(questions.length).fill(null));
    setResult(null);
    setError(null);
  }

  if (result) {
    return (
      <div className="flex flex-col gap-6">
        <Card
          className={cn(
            "flex flex-col items-center gap-3 p-10 text-center",
            result.passed ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
          )}
        >
          {result.passed ? (
            <CheckCircle2 className="h-10 w-10 text-success" strokeWidth={1.5} />
          ) : (
            <XCircle className="h-10 w-10 text-danger" strokeWidth={1.5} />
          )}
          <p className="text-2xl font-semibold">{result.score}%</p>
          <p className="text-sm text-muted">
            {result.correctCount} of {result.totalQuestions} correct
            {" · "}
            passing score {result.passingScore}%
          </p>
          <p className="font-medium">
            {result.passed ? "Nice work — you passed!" : "Not quite — give it another go."}
          </p>
        </Card>

        <div className="flex flex-col gap-3">
          {result.review.map((item, i) => {
            const isCorrect = item.selectedIndex === item.correctIndex;
            return (
              <Card key={i} className="p-5">
                <div className="flex items-start gap-2.5">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.question}</p>
                    <p className="mt-1 text-sm text-muted">
                      Your answer: {item.options[item.selectedIndex] ?? "—"}
                    </p>
                    {!isCorrect && (
                      <p className="mt-0.5 text-sm text-success">
                        Correct answer: {item.options[item.correctIndex]}
                      </p>
                    )}
                    {item.explanation && (
                      <p className="mt-2 text-sm text-muted">{item.explanation}</p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" onClick={handleRetry} className="flex-1">
            <RotateCcw className="h-4 w-4" />
            Retake quiz
          </Button>
          <Link href={returnHref} className="flex-1">
            <Button className="w-full">Back to lesson</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {questions.map((q, qIndex) => (
        <Card key={qIndex} className="p-6">
          <p className="font-medium">
            {qIndex + 1}. {q.question}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {q.options.map((option, oIndex) => (
              <button
                key={oIndex}
                type="button"
                onClick={() =>
                  setAnswers((prev) => {
                    const next = [...prev];
                    next[qIndex] = oIndex;
                    return next;
                  })
                }
                className={cn(
                  "rounded-xl border px-4 py-2.5 text-left text-sm transition-colors",
                  answers[qIndex] === oIndex
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-surface hover:border-primary/40"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </Card>
      ))}

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered || isPending}
        size="lg"
        className="self-start"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Scoring..." : "Submit quiz"}
      </Button>
    </div>
  );
}
