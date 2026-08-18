import Link from "next/link";
import { UserPlus, FolderKanban, Mail, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function getOverviewCounts() {
  const supabase = await createClient();

  const [pendingMembership, pendingProjects, unreadMessages, totalUsers] = await Promise.all([
    supabase
      .from("membership_applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);

  return {
    pendingMembership: pendingMembership.count ?? 0,
    pendingProjects: pendingProjects.count ?? 0,
    unreadMessages: unreadMessages.count ?? 0,
    totalUsers: totalUsers.count ?? 0,
  };
}

export default async function AdminOverviewPage() {
  const counts = await getOverviewCounts();

  const cards = [
    {
      href: "/admin/membership",
      icon: UserPlus,
      label: "Pending membership applications",
      value: counts.pendingMembership,
      highlight: counts.pendingMembership > 0,
    },
    {
      href: "/admin/projects",
      icon: FolderKanban,
      label: "Projects awaiting review",
      value: counts.pendingProjects,
      highlight: counts.pendingProjects > 0,
    },
    {
      href: "/admin/users",
      icon: Users,
      label: "Registered users",
      value: counts.totalUsers,
      highlight: false,
    },
    {
      href: "/admin/contact",
      icon: Mail,
      label: "Unread contact messages",
      value: counts.unreadMessages,
      highlight: counts.unreadMessages > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted">What needs your attention right now.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} href={card.href}>
            <Card
              className={
                card.highlight
                  ? "flex flex-col gap-2 border-primary/40 bg-primary/5 p-6 transition-colors hover:border-primary"
                  : "flex flex-col gap-2 p-6 transition-colors hover:border-primary/50"
              }
            >
              <card.icon
                className={card.highlight ? "h-5 w-5 text-primary" : "h-5 w-5 text-muted"}
                strokeWidth={1.75}
              />
              <p className="font-display text-3xl font-semibold">{card.value}</p>
              <p className="text-sm text-muted">{card.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
