"use server";

import { createClient } from "@/lib/supabase/server";
import { contactMessageSchema } from "@/lib/validation/schemas";

interface ContactFormState {
  success: boolean;
  error?: string;
}

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const parsed = contactMessageSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check your input.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: parsed.data.fullName,
      email: parsed.data.email,
      message: parsed.data.message,
    });

    if (error) throw error;

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Something went wrong sending your message. Please try again.",
    };
  }
}
