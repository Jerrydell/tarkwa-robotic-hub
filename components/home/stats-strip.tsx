import { createClient } from "@/lib/supabase/server";
import { Container } from "@/components/ui/container";

async function getStats() {
  try {
    const supabase = await createClient();

    const [modules, projects, lessons] = await Promise.all([
      supabase.from("modules").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("lessons").select("*", { count: "exact", head: true }).eq("is_published", true),
    ]);

    return {
      modules: modules.count,
      projects: projects.count,
      lessons: lessons.count,
    };
  } catch {
    // Supabase not configured yet, or the network call failed — degrade
    // gracefully rather than breaking the whole homepage.
    return { modules: null, projects: null, lessons: null };
  }
}

function StatValue({ value }: { value: number | null }) {
  return <span>{value === null ? "—" : value}</span>;
}

export async function StatsStrip() {
  const stats = await getStats();

  const items = [
    { label: "Learning modules", value: stats.modules },
    { label: "Published lessons", value: stats.lessons },
    { label: "Approved projects", value: stats.projects },
  ];

  return (
    <section className="border-y border-border/60 bg-surface/40">
      <Container className="grid grid-cols-1 divide-y divide-border/60 py-10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 py-4 text-center sm:py-0">
            <p className="font-display text-3xl font-semibold text-primary">
              <StatValue value={item.value} />
            </p>
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              {item.label}
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
