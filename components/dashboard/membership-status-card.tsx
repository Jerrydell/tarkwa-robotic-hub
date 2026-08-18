import Link from "next/link";
import { UserPlus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ApplicationStatus = "pending" | "approved" | "rejected" | null;

const STATUS_CONFIG: Record<
  NonNullable<ApplicationStatus>,
  { label: string; tone: "warning" | "success" | "danger"; icon: typeof Clock }
> = {
  pending: { label: "Application pending", tone: "warning", icon: Clock },
  approved: { label: "You're a Club Member", tone: "success", icon: CheckCircle2 },
  rejected: { label: "Application not approved", tone: "danger", icon: XCircle },
};

export function MembershipStatusCard({ status }: { status: ApplicationStatus }) {
  if (!status) {
    return (
      <Card className="flex flex-col gap-3 p-6">
        <UserPlus className="h-6 w-6 text-primary" strokeWidth={1.75} />
        <div>
          <p className="font-semibold">Not a club member yet</p>
          <p className="mt-1 text-sm text-muted">
            Apply to unlock project teams and member-only updates.
          </p>
        </div>
        <Link
          href="/dashboard/membership"
          className="text-sm text-primary hover:underline"
        >
          Apply now →
        </Link>
      </Card>
    );
  }

  const config = STATUS_CONFIG[status];

  return (
    <Card className="flex flex-col gap-3 p-6">
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
      <div>
        <Badge tone={config.tone}>{config.label}</Badge>
      </div>
      <Link
        href="/dashboard/membership"
        className="text-sm text-primary hover:underline"
      >
        View details →
      </Link>
    </Card>
  );
}
