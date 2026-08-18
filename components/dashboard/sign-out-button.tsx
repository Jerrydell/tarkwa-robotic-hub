"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export function SignOutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut()}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-danger",
        className
      )}
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
