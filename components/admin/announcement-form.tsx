"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createAnnouncement,
  updateAnnouncement,
  type AdminFormState,
} from "@/features/admin/content/actions";

interface AnnouncementFormProps {
  mode: "create" | "edit";
  announcementId?: string;
  initialTitle?: string;
  initialBody?: string;
  initialVisibility?: string;
  initialPublished?: boolean;
}

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save announcement"}
    </Button>
  );
}

export function AnnouncementForm({
  mode,
  announcementId,
  initialTitle = "",
  initialBody = "",
  initialVisibility = "public",
  initialPublished = true,
}: AnnouncementFormProps) {
  const boundAction =
    mode === "edit" && announcementId
      ? updateAnnouncement.bind(null, announcementId)
      : createAnnouncement;
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-muted">Title</label>
        <input id="title" name="title" required defaultValue={initialTitle} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="body" className="mb-1.5 block text-sm text-muted">Body</label>
        <textarea id="body" name="body" required rows={5} defaultValue={initialBody} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="visibility" className="mb-1.5 block text-sm text-muted">Visibility</label>
        <select id="visibility" name="visibility" defaultValue={initialVisibility} className={fieldClass}>
          <option value="public">Public</option>
          <option value="student">Signed-in students</option>
          <option value="club_member">Club Members only (Internal Update)</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publishNow" defaultChecked={initialPublished} />
        Publish now (otherwise saved as unpublished)
      </label>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved</p>}

      <SaveButton />
    </form>
  );
}
