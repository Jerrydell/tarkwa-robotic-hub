import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();

function readRepoFile(relativePath: string) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

const pageContracts = [
  {
    page: "app/admin/events/page.tsx",
    action: "deleteEvent",
    idExpression: "event.id",
  },
  {
    page: "app/admin/resources/page.tsx",
    action: "deleteResource",
    idExpression: "r.id",
  },
  {
    page: "app/admin/announcements/page.tsx",
    action: "deleteAnnouncement",
    idExpression: "a.id",
  },
  {
    page: "app/admin/gallery/page.tsx",
    action: "deleteGalleryItem",
    idExpression: "item.id",
  },
  {
    page: "app/admin/learning/modules/page.tsx",
    action: "deleteModule",
    idExpression: "mod.id",
    toggleAction: "toggleModulePublish",
    toggleIdExpression: "mod.id",
  },
  {
    page: "app/admin/learning/lessons/page.tsx",
    action: "deleteLesson",
    idExpression: "lesson.id",
    toggleAction: "toggleLessonPublish",
    toggleIdExpression: "lesson.id",
  },
  {
    page: "app/admin/learning/quizzes/page.tsx",
    action: "deleteQuiz",
    idExpression: "quiz.id",
  },
] as const;

describe("admin Server Action callback boundary", () => {
  it("uses form action references on every affected list page", () => {
    for (const contract of pageContracts) {
      const source = readRepoFile(contract.page);

      expect(source, contract.page).not.toMatch(/onDelete\s*=/);
      expect(source, contract.page).not.toMatch(/onToggle\s*=/);
      expect(source, contract.page).toContain(`action={${contract.action}}`);
      expect(source, contract.page).toContain(`id={${contract.idExpression}}`);

      if ("toggleAction" in contract) {
        expect(source, contract.page).toContain(`action={${contract.toggleAction}}`);
        expect(source, contract.page).toContain(`id={${contract.toggleIdExpression}}`);
      }
    }
  });

  it("keeps the client controls on the supported form-action boundary", () => {
    const deleteButton = readRepoFile("components/admin/delete-button.tsx");
    const toggleButton = readRepoFile("components/admin/toggle-button.tsx");

    expect(deleteButton).toContain("action={action}");
    expect(deleteButton).toContain("useFormStatus");
    expect(deleteButton).not.toContain("onDelete");
    expect(toggleButton).toContain("action={action}");
    expect(toggleButton).toContain("useFormStatus");
    expect(toggleButton).not.toContain("onToggle");
  });

  it("accepts FormData and keeps authorization in each affected Server Action", () => {
    const contentActions = readRepoFile("features/admin/content/actions.ts");
    const learningActions = readRepoFile("features/admin/learning/actions.ts");

    for (const actionName of [
      "deleteEvent",
      "deleteResource",
      "deleteAnnouncement",
      "deleteGalleryItem",
    ]) {
      expect(contentActions).toMatch(new RegExp(`export async function ${actionName}\\(formData: FormData\\)`));
    }

    for (const actionName of [
      "toggleModulePublish",
      "deleteModule",
      "toggleLessonPublish",
      "deleteLesson",
      "deleteQuiz",
    ]) {
      expect(learningActions).toMatch(new RegExp(`export async function ${actionName}\\(formData: FormData\\)`));
    }

    expect(contentActions.match(/await requireRole\("super_admin"\)/g)?.length).toBeGreaterThanOrEqual(4);
    expect(learningActions.match(/await requireRole\("super_admin"\)/g)?.length).toBeGreaterThanOrEqual(5);
  });
});
