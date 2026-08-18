"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyForMembership, type MembershipFormState } from "@/features/membership/actions";

const initialState: MembershipFormState = { success: false, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {pending ? "Submitting..." : "Submit application"}
    </Button>
  );
}

export function MembershipForm() {
  const [state, formAction] = useFormState(applyForMembership, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="motivationText" className="mb-1.5 block text-sm text-muted">
          Why do you want to join the club?
        </label>
        <textarea
          id="motivationText"
          name="motivationText"
          required
          minLength={20}
          rows={6}
          placeholder="Tell us about your interest in robotics, what you'd like to build, or what you're hoping to learn..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}
