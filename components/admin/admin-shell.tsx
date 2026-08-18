"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_LINKS } from "./nav-links";
import { SignOutButton } from "@/components/dashboard/sign-out-button";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {ADMIN_NAV_LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted hover:bg-surface hover:text-foreground"
            )}
          >
            <link.icon className="h-4 w-4" strokeWidth={1.75} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  fullName,
  children,
}: {
  fullName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-surface/40 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5 font-display font-semibold">
          <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2} />
          Admin
        </div>
        <div className="flex flex-1 flex-col py-4">
          <NavList />
        </div>
        <div className="border-t border-border/60 p-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">Super Admin</p>
          </div>
          <SignOutButton className="w-full" />
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
              <span className="flex items-center gap-2 font-display font-semibold">
                <ShieldCheck className="h-5 w-5 text-primary" strokeWidth={2} />
                Admin
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col py-4">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
            <div className="border-t border-border/60 p-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <SignOutButton className="w-full" />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-md">
          <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <span className="hidden font-mono text-xs uppercase tracking-wider text-muted lg:inline">
            Super Admin
          </span>
          <span className="w-5 lg:hidden" />
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
