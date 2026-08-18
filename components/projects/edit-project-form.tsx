"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateProject, type ProjectFormState } from "@/features/projects/actions";

const initialState: ProjectFormState = { success: false, error: undefined };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="h-4 w-4" />
      {pending ? "Saving..." : "Save changes"}
    </Button>
  );
}

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

interface EditProjectFormProps {
  projectId: string;
  projectSlug: string;
  title: string;
  summary: string | null;
  problemStatement: string | null;
  materials: string[];
  coverImageUrl: string | null;
  circuitDiagramUrl: string | null;
  codeRepoUrl: string | null;
  demoVideoUrl: string | null;
}

export function EditProjectForm(props: EditProjectFormProps) {
  const boundAction = updateProject.bind(null, props.projectId, props.projectSlug);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label htmlFor="title" className="mb-1.5 block text-sm text-muted">
          Project title
        </label>
        <input id="title" name="title" required defaultValue={props.title} className={fieldClass} />
      </div>

      <div>
        <label htmlFor="summary" className="mb-1.5 block text-sm text-muted">
          Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          required
          rows={2}
          defaultValue={props.summary ?? ""}
          className={fieldClass}
        />
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
          defaultValue={props.problemStatement ?? ""}
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
          defaultValue={props.materials?.join(", ") ?? ""}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="coverImageUrl" className="mb-1.5 block text-sm text-muted">
            Cover image URL
          </label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            type="url"
            defaultValue={props.coverImageUrl ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="circuitDiagramUrl" className="mb-1.5 block text-sm text-muted">
            Circuit diagram URL
          </label>
          <input
            id="circuitDiagramUrl"
            name="circuitDiagramUrl"
            type="url"
            defaultValue={props.circuitDiagramUrl ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="codeRepoUrl" className="mb-1.5 block text-sm text-muted">
            Code repo URL
          </label>
          <input
            id="codeRepoUrl"
            name="codeRepoUrl"
            type="url"
            defaultValue={props.codeRepoUrl ?? ""}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="demoVideoUrl" className="mb-1.5 block text-sm text-muted">
            Demo video URL
          </label>
          <input
            id="demoVideoUrl"
            name="demoVideoUrl"
            type="url"
            defaultValue={props.demoVideoUrl ?? ""}
            className={fieldClass}
          />
        </div>
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
