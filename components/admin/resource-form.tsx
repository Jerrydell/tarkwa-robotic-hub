"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createResource, updateResource, type AdminFormState } from "@/features/admin/content/actions";

interface ResourceFormProps {
  mode: "create" | "edit";
  resourceId?: string;
  initialTitle?: string;
  initialDescription?: string | null;
  initialFileUrl?: string;
  initialResourceType?: string;
  initialVisibility?: string;
}

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save resource"}
    </Button>
  );
}

export function ResourceForm({
  mode,
  resourceId,
  initialTitle = "",
  initialDescription = "",
  initialFileUrl = "",
  initialResourceType = "pdf",
  initialVisibility = "student",
}: ResourceFormProps) {
  const boundAction =
    mode === "edit" && resourceId ? updateResource.bind(null, resourceId) : createResource;
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-muted">Title</label>
        <input id="title" name="title" required defaultValue={initialTitle} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm text-muted">Description</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialDescription ?? ""}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="fileUrl" className="mb-1.5 block text-sm text-muted">File / link URL</label>
        <input id="fileUrl" name="fileUrl" required defaultValue={initialFileUrl} className={fieldClass} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="resourceType" className="mb-1.5 block text-sm text-muted">Type</label>
          <select id="resourceType" name="resourceType" defaultValue={initialResourceType} className={fieldClass}>
            <option value="pdf">PDF</option>
            <option value="code">Code</option>
            <option value="diagram">Diagram</option>
            <option value="image">Image</option>
            <option value="ebook">Ebook</option>
            <option value="link">External link</option>
          </select>
        </div>
        <div>
          <label htmlFor="visibility" className="mb-1.5 block text-sm text-muted">Visibility</label>
          <select id="visibility" name="visibility" defaultValue={initialVisibility} className={fieldClass}>
            <option value="public">Public</option>
            <option value="student">Signed-in students</option>
            <option value="club_member">Club Members only</option>
          </select>
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved</p>}

      <SaveButton />
    </form>
  );
}
