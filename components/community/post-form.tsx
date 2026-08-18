"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPost, type CommunityFormState } from "@/features/community/actions";

const initialState: CommunityFormState = { success: false, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {pending ? "Posting..." : "Post question"}
    </Button>
  );
}

export function PostForm() {
  const [state, formAction] = useFormState(createPost, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-muted">
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          placeholder="What's your question?"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm text-muted">
          Details
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={6}
          placeholder="Add any context that would help someone answer — what you've tried, what you're seeing, etc."
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
