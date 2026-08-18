import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeTone = "primary" | "identity" | "muted" | "success" | "warning" | "danger";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneStyles: Record<BadgeTone, string> = {
  primary: "bg-primary/10 text-primary border-primary/30",
  identity: "bg-identity/15 text-identity-light border-identity/40",
  muted: "bg-surface-elevated text-muted border-border",
  success: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  danger: "bg-danger/10 text-danger border-danger/30",
};

export function Badge({ className, tone = "muted", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[11px] uppercase tracking-wider",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
