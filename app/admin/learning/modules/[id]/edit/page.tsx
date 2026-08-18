import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ModuleForm } from "@/components/admin/module-form";
import { getModuleByIdAdmin } from "@/features/admin/learning/queries";

export default async function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mod = await getModuleByIdAdmin(id);
  if (!mod) notFound();

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <Link
          href="/admin/learning/modules"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Modules
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">Edit module</h1>
      </div>
      <Card className="p-6">
        <ModuleForm
          mode="edit"
          moduleId={mod.id}
          initialTitle={mod.title}
          initialDescription={mod.description}
          initialLevel={mod.level}
          initialOrderIndex={mod.order_index}
        />
      </Card>
    </div>
  );
}
