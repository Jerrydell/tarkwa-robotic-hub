import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/admin/event-form";
import { getEventByIdAdmin } from "@/features/admin/content/queries";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventByIdAdmin(id);
  if (!event) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link href="/admin/events" className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Events
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit event</h1>
      </div>
      <Card className="p-6">
        <EventForm
          mode="edit"
          eventId={event.id}
          initialTitle={event.title}
          initialDescription={event.description}
          initialEventType={event.event_type}
          initialStartsAt={event.starts_at}
          initialEndsAt={event.ends_at}
          initialLocation={event.location}
          initialIsInternal={event.is_internal}
          initialRegistrationRequired={event.registration_required}
        />
      </Card>
    </div>
  );
}
