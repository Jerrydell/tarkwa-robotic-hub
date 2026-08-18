import Link from "next/link";
import { MessageSquare, ArrowUp, Lock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/shared/page-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { Reveal } from "@/components/shared/reveal";
import { createClient } from "@/lib/supabase/server";

async function getRecentPosts() {
  try {
    const supabase = await createClient();
    const { data: posts } = await supabase
      .from("community_posts")
      .select("id, title, body, upvote_count, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!posts || posts.length === 0) return [];

    const authorIds = [...new Set(posts.map((p) => p.user_id))];
    const { data: authors } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", authorIds);

    const authorNameById = new Map(
      (authors ?? []).map((a) => [a.id, a.full_name])
    );

    return posts.map((post) => ({
      ...post,
      authorName: authorNameById.get(post.user_id) || "Student",
    }));
  } catch {
    return [];
  }
}

export default async function CommunityPage() {
  const posts = await getRecentPosts();

  return (
    <>
      <PageHero
        eyebrow="Community"
        title="Ask questions. Help others."
        description="A running Q&A between students figuring things out together. Sign in to post your own question, reply, or upvote a good answer."
      >
        <Link href="/signup">
          <Button className="mt-8">
            <Lock className="h-4 w-4" />
            Sign in to join the conversation
          </Button>
        </Link>
      </PageHero>

      <section className="py-16 sm:py-20">
        <Container>
          {posts.length === 0 ? (
            <EmptyState
              icon={MessageSquare}
              title="No discussions yet"
              description="Be the first — sign up and ask a question to get the community started."
            />
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 0.05}>
                  <Card className="flex items-start gap-4 p-6">
                    <div className="flex flex-col items-center gap-1 text-muted">
                      <ArrowUp className="h-4 w-4" />
                      <span className="font-mono text-sm">{post.upvote_count}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug">{post.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{post.body}</p>
                      <p className="mt-3 font-mono text-xs uppercase tracking-wider text-muted">
                        {post.authorName}
                      </p>
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
