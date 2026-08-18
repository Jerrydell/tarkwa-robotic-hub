import { Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getNotifications } from "@/features/notifications/queries";
import { NotificationItem } from "@/components/dashboard/notification-item";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read-button";

export default async function NotificationsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const notifications = await getNotifications(profile.id);
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="mt-1 text-sm text-muted">
            Badges, replies, and updates land here.
          </p>
        </div>
        {hasUnread && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nothing yet"
          description="Notifications about badges, replies, and updates will show up here."
        />
      ) : (
        <Card className="divide-y divide-border/60 p-2">
          {notifications.map((n) => (
            <div key={n.id} className="px-4">
              <NotificationItem notification={n} />
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
