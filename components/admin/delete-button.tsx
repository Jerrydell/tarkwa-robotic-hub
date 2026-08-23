"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

function SubmitButton({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-danger",
        className
      )}
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}

export function DeleteButton({
  action,
  id,
  label = "Delete",
  confirmMessage = "Are you sure? This can't be undone.",
  className,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label?: string;
  confirmMessage?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <SubmitButton label={label} className={className} />
    </form>
  );
}
