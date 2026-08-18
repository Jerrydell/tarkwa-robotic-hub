import { Card } from "@/components/ui/card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getAllUsers } from "@/features/admin/users/queries";
import { RoleSelector } from "@/components/admin/role-selector";
import { ActiveToggle } from "@/components/admin/active-toggle";
import type { Role } from "@/lib/auth/helpers";

export default async function AdminUsersPage() {
  const admin = await getCurrentProfile();
  const users = await getAllUsers();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Users"
        description={`${users.length} registered ${users.length === 1 ? "user" : "users"}`}
      />

      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-border/60 px-5 py-3 font-mono text-xs uppercase tracking-wider text-muted">
          <span>Name</span>
          <span>Role</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border/60">
          {users.map((user) => (
            <div
              key={user.id}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.full_name || "—"}</p>
                {user.year_group && (
                  <p className="truncate text-xs text-muted">{user.year_group}</p>
                )}
              </div>
              <RoleSelector
                userId={user.id}
                currentRole={user.role as Role}
                isSelf={user.id === admin?.id}
              />
              <ActiveToggle
                userId={user.id}
                isActive={user.is_active}
                isSelf={user.id === admin?.id}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
