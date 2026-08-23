import Link from "next/link";
import { Plus, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { DeleteButton } from "@/components/admin/delete-button";
import { getAllEventsAdmin } from "@/features/admin/content/queries";
import { deleteEvent } from "@/features/admin/content/actions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminEventsPage() {
  const events = await getAllEventsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader
        title="Events"
        action={
          <Link href="/admin/events/new">
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              New event
            </Button>
          </Link>
        }
      />

      {events.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No events yet" description="Create your first event." />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <Card key={event.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0 flex-1">
                <Link href={`/admin/events/${event.id}/edit`} className="font-medium hover:text-primary">
                  {event.title}
                </Link>
                <p className="text-xs text-muted">{formatDate(event.starts_at)}</p>
              </div>
              <Badge tone="muted">{event.event_type}</Badge>
              {event.is_internal && <Badge tone="identity">Internal</Badge>}
              <DeleteButton action={deleteEvent} id={event.id} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
