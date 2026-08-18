import { requireRole } from "@/lib/auth/helpers";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole("super_admin");

  return <AdminShell fullName={profile.full_name || "Admin"}>{children}</AdminShell>;
}
