"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createGalleryItem, type AdminFormState } from "@/features/admin/content/actions";

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Add to gallery"}
    </Button>
  );
}

export function GalleryForm() {
  const [state, formAction] = useFormState(createGalleryItem, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="imageUrl" className="mb-1.5 block text-sm text-muted">Image URL</label>
        <input id="imageUrl" name="imageUrl" required className={fieldClass} />
      </div>
      <div>
        <label htmlFor="caption" className="mb-1.5 block text-sm text-muted">Caption</label>
        <input id="caption" name="caption" className={fieldClass} />
      </div>
      <div>
        <label htmlFor="category" className="mb-1.5 block text-sm text-muted">Category</label>
        <input id="category" name="category" placeholder="e.g. workshops, competitions" className={fieldClass} />
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <SaveButton />
    </form>
  );
}
