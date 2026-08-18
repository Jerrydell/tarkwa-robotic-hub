import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getProjectForEdit, getEligibleTeammates } from "@/features/projects/queries";
import { EditProjectForm } from "@/components/projects/edit-project-form";
import { TeamMemberManager } from "@/components/projects/team-member-manager";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const data = await getProjectForEdit(id);
  if (!data || data.project.submitted_by !== profile.id) notFound();

  const { project, team } = data;
  const canEditFields = project.status === "draft" || project.status === "pending_review";
  const eligibleTeammates = await getEligibleTeammates(team.map((t) => t.user_id));

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href={`/projects/${project.slug}`}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {project.title}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit project</h1>
      </div>

      <TeamMemberManager
        projectId={project.id}
        team={team}
        eligibleTeammates={eligibleTeammates}
        isOwner
        currentUserId={profile.id}
      />

      {canEditFields ? (
        <Card className="p-6">
          <EditProjectForm
            projectId={project.id}
            projectSlug={project.slug}
            title={project.title}
            summary={project.summary}
            problemStatement={project.problem_statement}
            materials={project.materials ?? []}
            coverImageUrl={project.cover_image_url}
            circuitDiagramUrl={project.circuit_diagram_url}
            codeRepoUrl={project.code_repo_url}
            demoVideoUrl={project.demo_video_url}
          />
        </Card>
      ) : (
        <Card className="p-6">
          <Badge tone={project.status === "approved" ? "success" : "danger"}>
            {project.status === "approved" ? "Approved" : "Not approved"}
          </Badge>
          <p className="mt-3 text-sm text-muted">
            This project has already been reviewed, so its details can no
            longer be edited. You can still manage the team above.
          </p>
        </Card>
      )}
    </div>
  );
}
