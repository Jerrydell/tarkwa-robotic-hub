import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getUserProjects } from "@/features/projects/queries";
import { ProjectCard } from "@/components/projects/project-card";

export default async function MyProjectsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const projects = await getUserProjects(profile.id);
  const canSubmit = profile.role === "club_member" || profile.role === "super_admin";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Projects</h1>
          <p className="mt-1 text-sm text-muted">
            Projects you&apos;ve submitted or joined as a team member.
          </p>
        </div>
        {canSubmit && (
          <Link href="/dashboard/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              Submit a project
            </Button>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={canSubmit ? "No projects yet" : "No projects yet"}
          description={
            canSubmit
              ? "Submit your first project, or wait to be added to a teammate's team."
              : "Once you're a verified Club Member, you'll be able to submit and join projects."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              title={project.title}
              summary={project.summary}
              coverImageUrl={project.cover_image_url}
              isClubProject={project.is_club_project}
              status={project.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
