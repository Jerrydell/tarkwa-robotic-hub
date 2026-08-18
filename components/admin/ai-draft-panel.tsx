"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AiDraftPanelProps<T> {
  onGenerate: (topic: string, level: string) => Promise<T | { error: string }>;
  onDraft: (draft: T) => void;
  label?: string;
}

const fieldClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-colors focus:border-primary";

export function AiDraftPanel<T>({ onGenerate, onDraft, label = "lesson" }: AiDraftPanelProps<T>) {
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    if (!topic.trim()) {
      setError("Enter a topic first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await onGenerate(topic, level);
      if (result && typeof result === "object" && "error" in result) {
        setError((result as { error: string }).error);
        return;
      }
      onDraft(result as T);
    });
  }

  return (
    <Card className="border-primary/30 bg-primary/5 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="font-medium">AI-assisted draft</p>
      </div>
      <p className="mt-1 text-sm text-muted">
        Give a topic and level, get a draft {label} to review and edit below.
        Nothing is saved until you hit Save.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Reading an ultrasonic distance sensor"
          className={`${fieldClass} flex-1`}
        />
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={fieldClass}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <Button type="button" onClick={handleGenerate} disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}
