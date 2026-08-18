import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PostForm } from "@/components/community/post-form";

export default function NewPostPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/dashboard/community"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Community
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Ask a question</h1>
      </div>
      <Card className="p-6">
        <PostForm />
      </Card>
    </div>
  );
}
