import { FolderKanban } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { ProjectCard } from "@/components/projects/project-card";
import { Reveal } from "@/components/shared/reveal";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

async function getFeaturedProjects() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("slug, title, summary, cover_image_url, is_club_project")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(3);

    return data ?? [];
  } catch {
    return [];
  }
}

export async function FeaturedProjects() {
  const projects = await getFeaturedProjects();

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="From the workshop"
            title="Recently approved projects"
            description="Built, submitted, and reviewed — a live look at what the club is making."
          />
          <Link href="/projects">
            <Button variant="outline">View all projects</Button>
          </Link>
        </div>

        <div className="mt-10">
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No approved projects yet"
              description="Once club members start submitting projects and admins approve them, they'll show up here."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.slug} delay={i * 0.08}>
                  <ProjectCard
                    slug={project.slug}
                    title={project.title}
                    summary={project.summary}
                    coverImageUrl={project.cover_image_url}
                    isClubProject={project.is_club_project}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
