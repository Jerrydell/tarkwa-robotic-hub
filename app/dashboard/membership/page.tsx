import { Clock, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getMembershipApplication } from "@/features/membership/queries";
import { MembershipForm } from "@/components/dashboard/membership-form";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    tone: "warning" as const,
    title: "Application pending",
    description: "The Super Admin will review your application soon. This usually takes a few days.",
  },
  approved: {
    icon: CheckCircle2,
    tone: "success" as const,
    title: "You're a Club Member",
    description: "You can now join project teams, submit projects, and see member-only updates.",
  },
  rejected: {
    icon: XCircle,
    tone: "danger" as const,
    title: "Application not approved this time",
    description: "You're welcome to keep learning and apply again in the future.",
  },
};

export default async function MembershipPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const application = await getMembershipApplication(profile.id);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Club Membership</h1>
        <p className="mt-1 text-sm text-muted">
          Membership unlocks project teams and internal club updates.
        </p>
      </div>

      {application ? (
        <Card className="flex flex-col gap-3 p-6">
          {(() => {
            const config = STATUS_CONFIG[application.status];
            return (
              <>
                <config.icon
                  className={`h-6 w-6 ${
                    config.tone === "success"
                      ? "text-success"
                      : config.tone === "warning"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                  strokeWidth={1.75}
                />
                <Badge tone={config.tone} className="w-fit">
                  {config.title}
                </Badge>
                <p className="text-sm text-muted">{config.description}</p>
              </>
            );
          })()}
          <div className="mt-2 border-t border-border/60 pt-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Your application
            </p>
            <p className="mt-2 text-sm text-foreground/90">
              {application.motivation_text}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <UserPlus className="h-6 w-6 text-primary" strokeWidth={1.75} />
            <p className="font-medium">Apply for club membership</p>
          </div>
          <MembershipForm />
        </Card>
      )}
    </div>
  );
}
