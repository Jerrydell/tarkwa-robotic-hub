"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Cpu, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_LINKS } from "./nav-links";
import { SignOutButton } from "./sign-out-button";
import { Badge } from "@/components/ui/badge";

interface DashboardShellProps {
  fullName: string;
  role: "student" | "club_member" | "super_admin";
  unreadNotifications: number;
  children: React.ReactNode;
}

const ROLE_LABELS: Record<DashboardShellProps["role"], string> = {
  student: "Student",
  club_member: "Club Member",
  super_admin: "Super Admin",
};

function NavList({
  onNavigate,
  role,
}: {
  onNavigate?: () => void;
  role: DashboardShellProps["role"];
}) {
  const pathname = usePathname();
  const ROLE_RANK = { student: 0, club_member: 1, super_admin: 2 };

  const visibleLinks = DASHBOARD_NAV_LINKS.filter(
    (link) => !link.minRole || ROLE_RANK[role] >= ROLE_RANK[link.minRole]
  );

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {visibleLinks.map((link) => {
        const active =
          link.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(link.href);

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

export function DashboardShell({
  fullName,
  role,
  unreadNotifications,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-surface/40 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border/60 px-5 font-display font-semibold">
          <Cpu className="h-5 w-5 text-primary" strokeWidth={2} />
          Robotic Hub
        </div>
        <div className="flex flex-1 flex-col py-4">
          <NavList role={role} />
        </div>
        <div className="border-t border-border/60 p-3">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{fullName}</p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              {ROLE_LABELS[role]}
            </p>
          </div>
          <SignOutButton className="w-full" />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
            <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
              <span className="font-display font-semibold">Robotic Hub</span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-1 flex-col py-4">
              <NavList onNavigate={() => setOpen(false)} role={role} />
            </div>
            <div className="border-t border-border/60 p-3">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">{fullName}</p>
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  {ROLE_LABELS[role]}
                </p>
              </div>
              <SignOutButton className="w-full" />
            </div>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-6 backdrop-blur-md">
          <button
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <span className="hidden font-mono text-xs uppercase tracking-wider text-muted lg:inline">
            Student Dashboard
          </span>

          <Link href="/dashboard/notifications" className="relative">
            <Bell className="h-5 w-5 text-muted transition-colors hover:text-foreground" />
            {unreadNotifications > 0 && (
              <Badge
                tone="primary"
                className="absolute -right-2 -top-2 h-4 min-w-4 justify-center rounded-full px-1 py-0 text-[10px]"
              >
                {unreadNotifications > 9 ? "9+" : unreadNotifications}
              </Badge>
            )}
          </Link>
        </header>

        <main className="flex-1 px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
