import Link from "next/link";
import { Library, Download, Lock, FileText, Code, CircuitBoard, Image as ImageIcon, BookOpen, Link as LinkIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { createClient } from "@/lib/supabase/server";
import type { ResourceType } from "@/types/database.types";

const RESOURCE_ICONS: Record<ResourceType, typeof FileText> = {
  pdf: FileText,
  code: Code,
  diagram: CircuitBoard,
  image: ImageIcon,
  ebook: BookOpen,
  link: LinkIcon,
};

async function getResources() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("resources")
      .select("id, title, description, resource_type, visibility, file_url")
      .order("created_at", { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Notes, diagrams, and reference material"
        description="Everything the club uses to learn and build — PDFs, code samples, circuit diagrams, and more. Some resources are open to everyone; others unlock once you're signed in or a verified club member."
      />

      <section className="py-16 sm:py-20">
        <Container>
          {resources.length === 0 ? (
            <EmptyState
              icon={Library}
              title="No resources published yet"
              description="The resource library is being stocked — check back soon."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource, i) => {
                const Icon = RESOURCE_ICONS[resource.resource_type];
                const isPublic = resource.visibility === "public";

                return (
                  <Reveal key={resource.id} delay={(i % 3) * 0.06}>
                    <Card className="flex h-full flex-col p-6">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                      <h3 className="mt-4 font-semibold leading-snug">
                        {resource.title}
                      </h3>
                      {resource.description && (
                        <p className="mt-2 flex-1 text-sm text-muted">
                          {resource.description}
                        </p>
                      )}
                      <div className="mt-5 flex items-center justify-between gap-2">
                        <Badge tone="muted">
                          {resource.visibility === "club_member"
                            ? "Members only"
                            : resource.visibility === "student"
                              ? "Students"
                              : "Public"}
                        </Badge>
                        {isPublic ? (
                          <a href={resource.file_url} target="_blank" rel="noreferrer">
                            <Button size="sm" variant="outline">
                              <Download className="h-3.5 w-3.5" />
                              Get
                            </Button>
                          </a>
                        ) : (
                          <Link href="/login">
                            <Button size="sm" variant="ghost">
                              <Lock className="h-3.5 w-3.5" />
                              Sign in
                            </Button>
                          </Link>
                        )}
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
