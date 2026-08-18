"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProfile, type ProfileFormState } from "@/features/profile/actions";

const initialState: ProfileFormState = { success: false, error: undefined };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

interface ProfileFormProps {
  fullName: string;
  bio: string | null;
  yearGroup: string | null;
}

export function ProfileForm({ fullName, bio, yearGroup }: ProfileFormProps) {
  const [state, formAction] = useFormState(updateProfile, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="fullName" className="mb-1.5 block text-sm text-muted">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          defaultValue={fullName}
          required
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="yearGroup" className="mb-1.5 block text-sm text-muted">
          Year group
        </label>
        <input
          id="yearGroup"
          name="yearGroup"
          defaultValue={yearGroup ?? ""}
          placeholder="e.g. SHS 2"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="bio" className="mb-1.5 block text-sm text-muted">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={bio ?? ""}
          rows={4}
          placeholder="A little about you"
          className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && (
        <p className="flex items-center gap-1.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Saved
        </p>
      )}

      <SaveButton />
    </form>
  );
}
