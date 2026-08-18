import { createClient } from "@/lib/supabase/server";

export async function getAllSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key, value, updated_at");
  return data ?? [];
}

export async function getSetting(key: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_site_setting", { setting_key: key });
  return data === true;
}
