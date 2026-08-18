"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEvent, updateEvent, type AdminFormState } from "@/features/admin/content/actions";

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialTitle?: string;
  initialDescription?: string | null;
  initialEventType?: string;
  initialStartsAt?: string;
  initialEndsAt?: string | null;
  initialLocation?: string | null;
  initialIsInternal?: boolean;
  initialRegistrationRequired?: boolean;
}

const initialState: AdminFormState = { success: false, error: undefined };
const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";

function toLocalInputValue(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {pending ? "Saving..." : "Save event"}
    </Button>
  );
}

export function EventForm({
  mode,
  eventId,
  initialTitle = "",
  initialDescription = "",
  initialEventType = "public",
  initialStartsAt,
  initialEndsAt,
  initialLocation = "",
  initialIsInternal = false,
  initialRegistrationRequired = false,
}: EventFormProps) {
  const boundAction = mode === "edit" && eventId ? updateEvent.bind(null, eventId) : createEvent;
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="eventType" className="mb-1.5 block text-sm text-muted">Type</label>
          <select id="eventType" name="eventType" defaultValue={initialEventType} className={fieldClass}>
            <option value="public">Public</option>
            <option value="workshop">Workshop</option>
            <option value="meeting">Meeting</option>
            <option value="competition">Competition</option>
          </select>
        </div>
        <div>
          <label htmlFor="location" className="mb-1.5 block text-sm text-muted">Location</label>
          <input id="location" name="location" defaultValue={initialLocation ?? ""} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="startsAt" className="mb-1.5 block text-sm text-muted">Starts at</label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            defaultValue={toLocalInputValue(initialStartsAt)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="endsAt" className="mb-1.5 block text-sm text-muted">Ends at</label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            defaultValue={toLocalInputValue(initialEndsAt)}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isInternal" defaultChecked={initialIsInternal} />
          Internal (Club Member+ only)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="registrationRequired" defaultChecked={initialRegistrationRequired} />
          Requires registration
        </label>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && <p className="text-sm text-success">Saved</p>}

      <SaveButton />
    </form>
  );
}
