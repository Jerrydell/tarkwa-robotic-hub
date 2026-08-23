"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function ToggleSubmitButton({
  isOn,
  onLabel,
  offLabel,
}: {
  isOn: boolean;
  onLabel: string;
  offLabel: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      <Badge tone={isOn ? "success" : "muted"} className="cursor-pointer">
        {pending && <Loader2 className="h-3 w-3 animate-spin" />}
        {isOn ? onLabel : offLabel}
      </Badge>
    </button>
  );
}

export function ToggleButton({
  action,
  id,
  isOn,
  onLabel,
  offLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  isOn: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="isOn" value={String(isOn)} />
      <ToggleSubmitButton isOn={isOn} onLabel={onLabel} offLabel={offLabel} />
    </form>
  );
}
