"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createModule, updateModule, type AdminFormState } from "@/features/admin/learning/actions";

interface ModuleFormProps {
  mode: "create" | "edit";
  moduleId?: string;
  initialTitle?: string;
  initialDescription?: string | null;
  initialLevel?: string;
  initialOrderIndex?: number;
}

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save module"}
    </Button>
  );
}

export function ModuleForm({
  mode,
  moduleId,
  initialTitle = "",
  initialDescription = "",
  initialLevel = "beginner",
  initialOrderIndex = 0,
}: ModuleFormProps) {
  const boundAction = mode === "edit" && moduleId ? updateModule.bind(null, moduleId) : createModule;
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-muted">
          Module title
        </label>
        <input id="title" name="title" required defaultValue={initialTitle} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm text-muted">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialDescription ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="level" className="mb-1.5 block text-sm text-muted">
            Level
          </label>
          <select id="level" name="level" defaultValue={initialLevel} className={fieldClass}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label htmlFor="orderIndex" className="mb-1.5 block text-sm text-muted">
            Order
          </label>
          <input
            id="orderIndex"
            name="orderIndex"
            type="number"
            defaultValue={initialOrderIndex}
            className={fieldClass}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved</p>}

      <SaveButton />
    </form>
  );
}
