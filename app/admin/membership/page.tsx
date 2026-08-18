import { UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getMembershipApplications } from "@/features/admin/membership/queries";
import { MembershipActionButtons } from "@/components/admin/membership-action-buttons";

export default async function AdminMembershipPage() {
  const [pending, reviewed] = await Promise.all([
    getMembershipApplications("pending"),
    getMembershipApplications(),
  ]);

  const reviewedOnly = reviewed.filter((a) => a.status !== "pending");

  return (
    <div className="flex flex-col gap-8">
      <AdminPageHeader
        title="Membership Applications"
        description="Review and decide on club membership requests."
      />

      <div>
        <h2 className="text-lg font-semibold">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="No pending applications"
            description="New applications will show up here."
            className="mt-4"
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {pending.map((app) => (
              <Card key={app.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{app.applicantName}</p>
                  {app.applicantYearGroup && (
                    <p className="text-xs text-muted">{app.applicantYearGroup}</p>
                  )}
                  <p className="mt-2 max-w-lg text-sm text-foreground/90">
                    {app.motivation_text}
                  </p>
                </div>
                <MembershipActionButtons applicationId={app.id} applicantUserId={app.user_id} />
              </Card>
            ))}
          </div>
        )}
      </div>

      {reviewedOnly.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Reviewed</h2>
          <div className="mt-4 flex flex-col gap-2">
            {reviewedOnly.map((app) => (
              <Card key={app.id} className="flex items-center justify-between p-4">
                <p className="text-sm font-medium">{app.applicantName}</p>
                <Badge tone={app.status === "approved" ? "success" : "danger"}>
                  {app.status}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
