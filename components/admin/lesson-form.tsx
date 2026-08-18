"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiDraftPanel } from "./ai-draft-panel";
import { LessonContentEditor } from "./lesson-content-editor";
import {
  createLesson,
  updateLesson,
  type AdminFormState,
} from "@/features/admin/learning/actions";
import { generateLessonDraft } from "@/features/admin/ai/actions";

interface LessonDraft {
  title: string;
  objectives: string[];
  materials: string[];
  contentBody: Array<{ type: string; content?: string; items?: string[] }>;
  estimatedMinutes: number;
}

interface Module {
  id: string;
  title: string;
}

interface LessonFormProps {
  mode: "create" | "edit";
  lessonId?: string;
  modules: Module[];
  initialTitle?: string;
  initialModuleId?: string;
  initialOrderIndex?: number;
  initialObjectives?: string[];
  initialMaterials?: string[];
  initialContentBody?: Array<{ type: string; content?: string; items?: string[] }>;
  initialEstimatedMinutes?: number | null;
}

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save lesson"}
    </Button>
  );
}

export function LessonForm({
  mode,
  lessonId,
  modules,
  initialTitle = "",
  initialModuleId = "",
  initialOrderIndex = 0,
  initialObjectives = [],
  initialMaterials = [],
  initialContentBody = [],
  initialEstimatedMinutes,
}: LessonFormProps) {
  const boundAction = mode === "edit" && lessonId ? updateLesson.bind(null, lessonId) : createLesson;
  const [state, formAction] = useFormState(boundAction, initialState);

  const [title, setTitle] = useState(initialTitle);
  const [objectives, setObjectives] = useState(initialObjectives.join("\n"));
  const [materials, setMaterials] = useState(initialMaterials.join("\n"));
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    initialEstimatedMinutes ? String(initialEstimatedMinutes) : ""
  );
  const [contentBody, setContentBody] = useState(initialContentBody);
  const [draftVersion, setDraftVersion] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <AiDraftPanel<LessonDraft>
        label="lesson"
        onGenerate={generateLessonDraft}
        onDraft={(draft) => {
          setTitle(draft.title);
          setObjectives(draft.objectives.join("\n"));
          setMaterials(draft.materials.join("\n"));
          setEstimatedMinutes(String(draft.estimatedMinutes ?? ""));
          setContentBody(draft.contentBody);
          setDraftVersion((v) => v + 1);
        }}
      />

      <form action={formAction} className="flex flex-col gap-5">
        {mode === "create" && (
          <div>
            <label htmlFor="moduleId" className="mb-1.5 block text-sm text-muted">
              Module
            </label>
            <select id="moduleId" name="moduleId" required defaultValue={initialModuleId} className={fieldClass}>
              <option value="" disabled>
                Select a module
              </option>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="title" className="mb-1.5 block text-sm text-muted">
            Lesson title
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
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
          <div>
            <label htmlFor="estimatedMinutes" className="mb-1.5 block text-sm text-muted">
              Estimated minutes
            </label>
            <input
              id="estimatedMinutes"
              name="estimatedMinutes"
              type="number"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(e.target.value)}
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="objectives" className="mb-1.5 block text-sm text-muted">
            Objectives (one per line)
          </label>
          <textarea
            id="objectives"
            name="objectives"
            rows={3}
            value={objectives}
            onChange={(e) => setObjectives(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="materials" className="mb-1.5 block text-sm text-muted">
            Materials needed (one per line)
          </label>
          <textarea
            id="materials"
            name="materials"
            rows={3}
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm text-muted">Content</p>
          <LessonContentEditor key={draftVersion} initialBlocks={contentBody} />
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.success && <p className="text-sm text-success">Saved</p>}

        <SaveButton />
      </form>
    </div>
  );
}
