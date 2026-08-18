import { FolderKanban } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/shared/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { createClient } from "@/lib/supabase/server";

async function getApprovedProjects() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select("id, slug, title, summary, cover_image_url, is_club_project")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getApprovedProjects();

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="What the club has built"
        description="Every project here started as a submission from a club member team, reviewed and approved by an admin. Real builds, real problems solved."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderKanban}
              title="No approved projects yet"
              description="Once club members start submitting projects and admins approve them, they'll show up here."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={(i % 3) * 0.08}>
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
        </Container>
      </section>
    </>
  );
}
