"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitProject, type ProjectFormState } from "@/features/projects/actions";

const initialState: ProjectFormState = { success: false, error: undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      {pending ? "Submitting..." : "Submit for review"}
    </Button>
  );
}

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

export function ProjectSubmitForm() {
  const [state, formAction] = useFormState(submitProject, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-muted">
          Project title
        </label>
        <input id="title" name="title" required className={fieldClass} />
      </div>

      <div>
        <label htmlFor="summary" className="mb-1.5 block text-sm text-muted">
          Summary (one or two sentences)
        </label>
        <textarea id="summary" name="summary" required rows={2} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="problemStatement" className="mb-1.5 block text-sm text-muted">
          What problem does it solve?
        </label>
        <textarea
          id="problemStatement"
          name="problemStatement"
          required
          rows={4}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="materials" className="mb-1.5 block text-sm text-muted">
          Materials used (comma-separated)
        </label>
        <input
          id="materials"
          name="materials"
          placeholder="Arduino Uno, Ultrasonic sensor, Servo motor"
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="coverImageUrl" className="mb-1.5 block text-sm text-muted">
            Cover image URL
          </label>
          <input id="coverImageUrl" name="coverImageUrl" type="url" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="circuitDiagramUrl" className="mb-1.5 block text-sm text-muted">
            Circuit diagram URL
          </label>
          <input id="circuitDiagramUrl" name="circuitDiagramUrl" type="url" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="codeRepoUrl" className="mb-1.5 block text-sm text-muted">
            Code repo URL
          </label>
          <input id="codeRepoUrl" name="codeRepoUrl" type="url" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="demoVideoUrl" className="mb-1.5 block text-sm text-muted">
            Demo video URL
          </label>
          <input id="demoVideoUrl" name="demoVideoUrl" type="url" className={fieldClass} />
        </div>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <p className="text-xs text-muted">
        Your project will be reviewed by a Super Admin before it appears
        publicly. You can add teammates from the project page after submitting.
      </p>

      <SubmitButton />
    </form>
  );
}
