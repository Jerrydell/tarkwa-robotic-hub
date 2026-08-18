import Link from "next/link";
import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Notification } from "@/components/dashboard/notification-item";
import { NotificationItem } from "@/components/dashboard/notification-item";

export function NotificationsPreview({ notifications }: { notifications: Notification[] }) {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-muted">
          Recent notifications
        </p>
        <Link href="/dashboard/notifications" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="mt-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="Nothing yet"
            description="Notifications about badges, replies, and updates will show up here."
            className="border-none px-0 py-8"
          />
        ) : (
          <div className="flex flex-col divide-y divide-border/60">
            {notifications.map((n) => (
              <NotificationItem key={n.id} notification={n} compact />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
