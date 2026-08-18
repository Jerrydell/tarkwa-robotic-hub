"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Trophy, MessageCircle, UserCheck, FolderCheck, Megaphone, CalendarClock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { markNotificationRead } from "@/features/notifications/actions";
import type { NotificationType } from "@/types/database.types";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

const TYPE_ICONS: Record<NotificationType, typeof Trophy> = {
  membership_status: UserCheck,
  project_status: FolderCheck,
  new_reply: MessageCircle,
  new_message: MessageCircle,
  badge_earned: Trophy,
  announcement: Megaphone,
  event_reminder: CalendarClock,
};

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationItem({
  notification,
  compact = false,
}: {
  notification: Notification;
  compact?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const Icon = TYPE_ICONS[notification.type];

  const content = (
    <div
      className={cn(
        "flex items-start gap-3 py-3",
        !compact && "px-1",
        !notification.is_read && "opacity-100",
        notification.is_read && "opacity-60"
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={1.75} />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{notification.title}</p>
        {notification.body && !compact && (
          <p className="mt-0.5 text-sm text-muted">{notification.body}</p>
        )}
        <p className="mt-1 font-mono text-xs text-muted">
          {timeAgo(notification.created_at)}
        </p>
      </div>
      {!notification.is_read && (
        <button
          onClick={() =>
            startTransition(() => {
              markNotificationRead(notification.id);
            })
          }
          disabled={isPending}
          aria-label="Mark as read"
          className="mt-1.5"
        >
          <Circle className="h-2 w-2 fill-primary text-primary" />
        </button>
      )}
    </div>
  );

  if (notification.link_url) {
    return <Link href={notification.link_url}>{content}</Link>;
  }

  return content;
}
