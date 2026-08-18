import { Lock, BookOpen } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { createClient } from "@/lib/supabase/server";
import type { ModuleLevel } from "@/types/database.types";

const LEVEL_ORDER: ModuleLevel[] = ["beginner", "intermediate", "advanced"];
const LEVEL_LABELS: Record<ModuleLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

async function getModules() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("modules")
      .select("id, title, slug, description, level, cover_image_url")
      .eq("is_published", true)
      .order("order_index", { ascending: true });

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function LearnPage() {
  const modules = await getModules();

  return (
    <>
      <PageHero
        eyebrow="Learn robotics"
        title="From your first circuit to your first competition"
        description="Structured modules take you from the fundamentals through to advanced, competition-ready robotics. Sign in to track progress, take quizzes, and build your streak."
      >
        <Link href="/signup">
          <Button className="mt-8">Sign up to start learning</Button>
        </Link>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container className="flex flex-col gap-16">
          {modules.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Modules are being prepared"
              description="Learning content is on its way — check back soon, or sign up now so you're ready the moment it's live."
            />
          ) : (
            LEVEL_ORDER.map((level) => {
              const levelModules = modules.filter((m) => m.level === level);
              if (levelModules.length === 0) return null;

              return (
                <div key={level}>
                  <h2 className="text-2xl font-semibold">{LEVEL_LABELS[level]}</h2>
                  <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {levelModules.map((mod, i) => (
                      <Reveal key={mod.id} delay={i * 0.06}>
                        <Card className="flex h-full flex-col p-6">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold leading-snug">{mod.title}</h3>
                            <Lock className="h-4 w-4 shrink-0 text-muted" />
                          </div>
                          {mod.description && (
                            <p className="mt-2 flex-1 text-sm text-muted">
                              {mod.description}
                            </p>
                          )}
                          <Badge tone="muted" className="mt-4 w-fit">
                            {LEVEL_LABELS[level]}
                          </Badge>
                        </Card>
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </Container>
      </section>
    </>
  );
}
