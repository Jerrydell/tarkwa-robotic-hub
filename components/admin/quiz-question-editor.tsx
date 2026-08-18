"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Question {
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

function emptyQuestion(): Question {
  return { question: "", options: ["", "", "", ""], correct_index: 0, explanation: "" };
}

export function QuizQuestionEditor({
  initialQuestions,
  fieldName = "questions",
}: {
  initialQuestions?: Question[];
  fieldName?: string;
}) {
  const [questions, setQuestions] = useState<Question[]>(
    initialQuestions && initialQuestions.length > 0 ? initialQuestions : [emptyQuestion()]
  );

  function updateQuestion(index: number, patch: Partial<Question>) {
    setQuestions((prev) => prev.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateOption(qIndex: number, oIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? value : o)) } : q
      )
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <input type="hidden" name={fieldName} value={JSON.stringify(questions)} />

      {questions.map((q, qi) => (
        <Card key={qi} className="p-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Question {qi + 1}
            </p>
            <button
              type="button"
              onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== qi))}
              className="text-muted hover:text-danger"
              aria-label="Remove question"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <input
            value={q.question}
            onChange={(e) => updateQuestion(qi, { question: e.target.value })}
            placeholder="Question text"
            className={`${fieldClass} mt-3`}
          />

          <div className="mt-3 flex flex-col gap-2">
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correct_index === oi}
                  onChange={() => updateQuestion(qi, { correct_index: oi })}
                  aria-label={`Mark option ${oi + 1} correct`}
                />
                <input
                  value={opt}
                  onChange={(e) => updateOption(qi, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}`}
                  className={fieldClass}
                />
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Select the radio button next to the correct answer.</p>

          <input
            value={q.explanation ?? ""}
            onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
            placeholder="Explanation shown after answering (optional)"
            className={`${fieldClass} mt-3`}
          />
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => setQuestions((prev) => [...prev, emptyQuestion()])}
      >
        <Plus className="h-3.5 w-3.5" />
        Add question
      </Button>
    </div>
  );
}
