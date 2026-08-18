import { CalendarDays, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHero } from "@/components/shared/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { createClient } from "@/lib/supabase/server";
import type { EventType } from "@/types/database.types";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  workshop: "Workshop",
  meeting: "Meeting",
  competition: "Competition",
  public: "Public event",
};

async function getUpcomingEvents() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("events")
      .select("id, title, slug, description, event_type, starts_at, location, registration_required")
      .eq("is_internal", false)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true });

    return data ?? [];
  } catch {
    return [];
  }
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Workshops, meetings, and competitions"
        description="Everything happening in the club that's open to the wider school. Internal member-only updates live in the dashboard once you're a verified member."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No upcoming events yet"
              description="Nothing scheduled right now — check back soon, or follow the announcements feed once you're signed in."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {events.map((event, i) => (
                <Reveal key={event.id} delay={i * 0.06}>
                  <Card className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="primary">{EVENT_TYPE_LABELS[event.event_type]}</Badge>
                        {event.registration_required && (
                          <Badge tone="identity">Registration required</Badge>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-semibold">{event.title}</h3>
                      {event.description && (
                        <p className="mt-1 max-w-xl text-sm text-muted">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-1.5 text-sm text-muted sm:items-end">
                      <span className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatEventDate(event.starts_at)}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
