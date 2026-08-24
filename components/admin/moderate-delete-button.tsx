"use client";

import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-muted transition-colors hover:text-danger"
      aria-label="Remove"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}

export function ModerateDeleteButton({
  action,
  id,
  postId,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  postId?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const reason = window.prompt("Reason for removing this content:");
        if (reason === null) {
          event.preventDefault();
          return;
        }

        const reasonField = event.currentTarget.elements.namedItem("reason");
        if (!(reasonField instanceof HTMLInputElement)) {
          event.preventDefault();
          return;
        }

        reasonField.value = reason;
      }}
    >
      <input type="hidden" name="id" value={id} />
      {postId && <input type="hidden" name="postId" value={postId} />}
      <input type="hidden" name="reason" defaultValue="" />
      <SubmitButton />
    </form>
  );
}
