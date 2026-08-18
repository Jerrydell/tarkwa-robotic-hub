"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createReply, type CommunityFormState } from "@/features/community/actions";

const initialState: CommunityFormState = { success: false, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="sm">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      {pending ? "Posting..." : "Reply"}
    </Button>
  );
}

export function ReplyForm({ postId }: { postId: string }) {
  const createReplyForPost = createReply.bind(null, postId);
  const [state, formAction] = useFormState(createReplyForPost, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Write a reply..."
        className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
