import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { ProfileForm } from "@/components/dashboard/profile-form";

const ROLE_LABELS = {
  student: "Student",
  club_member: "Club Member",
  super_admin: "Super Admin",
};

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Update how you appear to other members.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge tone="primary">{ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS]}</Badge>
      </div>

      <Card className="p-6">
        <ProfileForm
          fullName={profile.full_name ?? ""}
          bio={profile.bio}
          yearGroup={profile.year_group}
        />
      </Card>
    </div>
  );
}
