"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSetting } from "@/features/admin/settings/actions";

export function SettingSwitch({
  settingKey,
  isOn,
  title,
  description,
}: {
  settingKey: string;
  isOn: boolean;
  title: string;
  description: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between gap-4 p-5">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </div>
      <button
        onClick={() => startTransition(() => updateSetting(settingKey, !isOn))}
        disabled={isPending}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors",
          isOn ? "bg-primary" : "bg-surface-elevated border border-border"
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-background transition-transform",
            isOn ? "translate-x-6" : "translate-x-1"
          )}
        />
        {isPending && (
          <Loader2 className="absolute -right-6 top-1.5 h-4 w-4 animate-spin text-muted" />
        )}
      </button>
    </div>
  );
}
