"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/helpers";
import { slugify } from "@/lib/utils";
import type { EventType, ResourceType, VisibilityLevel } from "@/types/database.types";

export interface AdminFormState {
  success: boolean;
  error?: string;
}

function getFormId(formData: FormData): string {
  const value = formData.get("id");
  if (typeof value !== "string" || !value) {
    throw new Error("A record ID is required.");
  }
  return value;
}

// ---------- Events ----------

export async function createEvent(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const startsAt = formData.get("startsAt") as string;
  if (!title?.trim() || !startsAt) {
    return { success: false, error: "Title and start time are required." };
  }

  const { error } = await supabase.from("events").insert({
    title,
    slug: slugify(title),
    description: (formData.get("description") as string) || null,
    event_type: formData.get("eventType") as EventType,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: formData.get("endsAt") ? new Date(formData.get("endsAt") as string).toISOString() : null,
    location: (formData.get("location") as string) || null,
    is_internal: formData.get("isInternal") === "on",
    registration_required: formData.get("registrationRequired") === "on",
  });

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEvent(
  eventId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const startsAt = formData.get("startsAt") as string;
  const { error } = await supabase
    .from("events")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      event_type: formData.get("eventType") as EventType,
      starts_at: new Date(startsAt).toISOString(),
      ends_at: formData.get("endsAt") ? new Date(formData.get("endsAt") as string).toISOString() : null,
      location: (formData.get("location") as string) || null,
      is_internal: formData.get("isInternal") === "on",
      registration_required: formData.get("registrationRequired") === "on",
    })
    .eq("id", eventId);

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${eventId}/edit`);
  revalidatePath("/events");
  return { success: true };
}

export async function deleteEvent(formData: FormData) {
  await requireRole("super_admin");
  const eventId = getFormId(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", eventId);
  if (error) throw new Error("Could not delete event.");
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

// ---------- Resources ----------

export async function createResource(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const profile = await requireRole("super_admin");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const fileUrl = formData.get("fileUrl") as string;
  if (!title?.trim() || !fileUrl?.trim()) {
    return { success: false, error: "Title and file URL are required." };
  }

  const { error } = await supabase.from("resources").insert({
    title,
    description: (formData.get("description") as string) || null,
    file_url: fileUrl,
    resource_type: formData.get("resourceType") as ResourceType,
    visibility: formData.get("visibility") as VisibilityLevel,
    uploaded_by: profile.id,
  });

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/resources");
  redirect("/admin/resources");
}

export async function updateResource(
  resourceId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("resources")
    .update({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || null,
      file_url: formData.get("fileUrl") as string,
      resource_type: formData.get("resourceType") as ResourceType,
      visibility: formData.get("visibility") as VisibilityLevel,
    })
    .eq("id", resourceId);

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/resources");
  revalidatePath(`/admin/resources/${resourceId}/edit`);
  revalidatePath("/resources");
  return { success: true };
}

export async function deleteResource(formData: FormData) {
  await requireRole("super_admin");
  const resourceId = getFormId(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("resources").delete().eq("id", resourceId);
  if (error) throw new Error("Could not delete resource.");
  revalidatePath("/admin/resources");
  revalidatePath("/resources");
}

// ---------- Announcements ----------

export async function createAnnouncement(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const profile = await requireRole("super_admin");
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  if (!title?.trim() || !body?.trim()) {
    return { success: false, error: "Title and body are required." };
  }

  const { error } = await supabase.from("announcements").insert({
    title,
    body,
    visibility: formData.get("visibility") as VisibilityLevel,
    published_at: formData.get("publishNow") === "on" ? new Date().toISOString() : null,
    created_by: profile.id,
  });

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/announcements");
  redirect("/admin/announcements");
}

export async function updateAnnouncement(
  announcementId: string,
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { error } = await supabase
    .from("announcements")
    .update({
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      visibility: formData.get("visibility") as VisibilityLevel,
      published_at: formData.get("publishNow") === "on" ? new Date().toISOString() : null,
    })
    .eq("id", announcementId);

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/announcements");
  revalidatePath(`/admin/announcements/${announcementId}/edit`);
  revalidatePath("/events");
  revalidatePath("/dashboard/updates");
  return { success: true };
}

export async function deleteAnnouncement(formData: FormData) {
  await requireRole("super_admin");
  const announcementId = getFormId(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("announcements").delete().eq("id", announcementId);
  if (error) throw new Error("Could not delete announcement.");
  revalidatePath("/admin/announcements");
}

// ---------- Gallery ----------

export async function createGalleryItem(
  _prevState: AdminFormState,
  formData: FormData
): Promise<AdminFormState> {
  const profile = await requireRole("super_admin");
  const supabase = await createClient();

  const imageUrl = formData.get("imageUrl") as string;
  if (!imageUrl?.trim()) {
    return { success: false, error: "Image URL is required." };
  }

  const { error } = await supabase.from("gallery_items").insert({
    image_url: imageUrl,
    caption: (formData.get("caption") as string) || null,
    category: (formData.get("category") as string) || null,
    uploaded_by: profile.id,
  });

  if (error) return { success: false, error: "Something went wrong." };

  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  redirect("/admin/gallery");
}

export async function deleteGalleryItem(formData: FormData) {
  await requireRole("super_admin");
  const itemId = getFormId(formData);
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").delete().eq("id", itemId);
  if (error) throw new Error("Could not delete gallery item.");
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

// ---------- Contact messages ----------

export async function markContactMessageRead(messageId: string) {
  await requireRole("super_admin");
  const supabase = await createClient();
  await supabase.from("contact_messages").update({ is_read: true }).eq("id", messageId);
  revalidatePath("/admin/contact");
}
