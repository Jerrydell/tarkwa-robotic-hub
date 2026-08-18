import { createClient } from "@/lib/supabase/server";

export async function getAllEventsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("id, title, slug, event_type, starts_at, is_internal, registration_required")
    .order("starts_at", { ascending: false });
  return data ?? [];
}

export async function getEventByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").eq("id", id).single();
  return data;
}

export async function getAllResourcesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("resources")
    .select("id, title, resource_type, visibility, file_url, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getResourceByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("resources").select("*").eq("id", id).single();
  return data;
}

export async function getAllAnnouncementsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("announcements")
    .select("id, title, visibility, published_at, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getAnnouncementByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select("*").eq("id", id).single();
  return data;
}

export async function getAllGalleryItemsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_items")
    .select("id, image_url, caption, category, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getContactMessages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contact_messages")
    .select("id, full_name, email, message, is_read, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}
