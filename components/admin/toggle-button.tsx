"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ToggleButton({
  isOn,
  onToggle,
  onLabel,
  offLabel,
}: {
  isOn: boolean;
  onToggle: () => Promise<void>;
  onLabel: string;
  offLabel: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button onClick={() => startTransition(() => onToggle())} disabled={isPending}>
      <Badge tone={isOn ? "success" : "muted"} className="cursor-pointer">
        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
        {isOn ? onLabel : offLabel}
      </Badge>
    </button>
  );
}
