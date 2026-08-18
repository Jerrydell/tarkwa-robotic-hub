import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Github, PlayCircle, CircuitBoard, Pencil, MessageSquare } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/helpers";
import { getProjectDetail, getEligibleTeammates } from "@/features/projects/queries";
import { TeamMemberManager } from "@/components/projects/team-member-manager";
import { ProjectCommentForm } from "@/components/projects/project-comment-form";

const STATUS_LABELS = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Not approved",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  const profile = await getCurrentProfile();
  const data = await getProjectDetail(projectSlug, profile?.id ?? "");
  if (!data) notFound();

  const { project, team, images, comments, isOwner, isTeamMember } = data;

  const eligibleTeammates =
    isOwner && profile
      ? await getEligibleTeammates([...team.map((t) => t.user_id)])
      : [];

  return (
    <div className="py-12 sm:py-16">
      <Container className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            {project.status !== "approved" && (
              <Badge tone={project.status === "rejected" ? "danger" : "warning"} className="mb-3">
                {STATUS_LABELS[project.status]}
              </Badge>
            )}
            {project.is_club_project && (
              <Badge tone="identity" className="mb-3 ml-2">
                Club project
              </Badge>
            )}
            <h1 className="text-3xl font-semibold sm:text-4xl">{project.title}</h1>
            {project.summary && (
              <p className="mt-3 max-w-xl text-muted">{project.summary}</p>
            )}
          </div>
          {isOwner && (
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            </Link>
          )}
        </div>

        {project.cover_image_url && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-2xl border border-border">
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {project.code_repo_url && (
            <a href={project.code_repo_url} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <Github className="h-3.5 w-3.5" />
                Code
              </Button>
            </a>
          )}
          {project.demo_video_url && (
            <a href={project.demo_video_url} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <PlayCircle className="h-3.5 w-3.5" />
                Demo
              </Button>
            </a>
          )}
          {project.circuit_diagram_url && (
            <a href={project.circuit_diagram_url} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                <CircuitBoard className="h-3.5 w-3.5" />
                Circuit diagram
              </Button>
            </a>
          )}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            {project.problem_statement && (
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  Problem it solves
                </p>
                <p className="mt-2 leading-relaxed text-foreground/90">
                  {project.problem_statement}
                </p>
              </div>
            )}

            {project.materials?.length > 0 && (
              <div className="mt-6">
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  Materials
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {project.materials.map((m: string) => (
                    <Badge key={m} tone="muted">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="relative aspect-square overflow-hidden rounded-xl border border-border"
                  >
                    <Image src={img.image_url} alt={img.caption ?? ""} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {(isOwner || isTeamMember || team.length > 0) && (
            <TeamMemberManager
              projectId={project.id}
              team={team}
              eligibleTeammates={eligibleTeammates}
              isOwner={isOwner}
              currentUserId={profile?.id ?? ""}
            />
          )}
        </div>

        <div className="mt-12 border-t border-border/60 pt-8">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-5 w-5" />
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </h2>

          <div className="mt-5 flex flex-col gap-3">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-4">
                <p className="text-sm text-foreground/90">{comment.body}</p>
                <p className="mt-2 font-mono text-xs text-muted">{comment.authorName}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            {profile ? (
              <ProjectCommentForm projectId={project.id} projectSlug={project.slug} />
            ) : (
              <p className="text-sm text-muted">
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to leave a comment.
              </p>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
