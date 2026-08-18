import { Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { MarkContactReadButton } from "@/components/admin/mark-contact-read-button";
import { getContactMessages } from "@/features/admin/content/queries";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminContactPage() {
  const messages = await getContactMessages();

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Contact Messages" description="Submissions from the public Contact form." />

      {messages.length === 0 ? (
        <EmptyState icon={Mail} title="No messages yet" description="Contact form submissions will appear here." />
      ) : (
        <div className="flex flex-col gap-3">
          {messages.map((m) => (
            <Card key={m.id} className={m.is_read ? "p-5 opacity-60" : "p-5"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{m.full_name}</p>
                  <p className="text-xs text-muted">
                    {m.email} · {formatDate(m.created_at)}
                  </p>
                </div>
                {!m.is_read ? (
                  <MarkContactReadButton messageId={m.id} />
                ) : (
                  <Badge tone="muted">Read</Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-foreground/90">{m.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
