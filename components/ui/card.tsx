import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-surface",
        "transition-colors duration-200",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

export const CardHoverable = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border border-border bg-surface",
        "transition-all duration-300 hover:border-primary/50 hover:shadow-glow hover:-translate-y-1",
        className
      )}
      {...props}
    />
  )
);
CardHoverable.displayName = "CardHoverable";
