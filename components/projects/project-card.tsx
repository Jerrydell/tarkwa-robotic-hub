import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { CardHoverable } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  slug: string;
  title: string;
  summary: string | null;
  coverImageUrl: string | null;
  isClubProject?: boolean;
  status?: "draft" | "pending_review" | "approved" | "rejected";
}

const STATUS_LABELS = {
  draft: "Draft",
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Not approved",
};

export function ProjectCard({
  slug,
  title,
  summary,
  coverImageUrl,
  isClubProject,
  status,
}: ProjectCardProps) {
  return (
    <Link href={`/projects/${slug}`}>
      <CardHoverable className="group h-full overflow-hidden">
        <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-xs text-muted">
              NO IMAGE
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug">{title}</h3>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-primary" />
          </div>
          {summary && (
            <p className="mt-2 line-clamp-2 text-sm text-muted">{summary}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {isClubProject && <Badge tone="identity">Club project</Badge>}
            {status && status !== "approved" && (
              <Badge tone={status === "rejected" ? "danger" : "warning"}>
                {STATUS_LABELS[status]}
              </Badge>
            )}
          </div>
        </div>
      </CardHoverable>
    </Link>
  );
}
