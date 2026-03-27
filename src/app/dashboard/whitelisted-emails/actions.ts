"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEmail(formData: FormData) {
  const supabase = await createClient();
  const email_address = (formData.get("email_address") as string)?.trim().toLowerCase();
  if (!email_address) return { error: "Email address is required" };
  const { error } = await supabase.from("whitelist_email_addresses").insert({ email_address });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/whitelisted-emails");
  return { success: true };
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const email_address = (formData.get("email_address") as string)?.trim().toLowerCase();
  if (!id) return { error: "ID is required" };
  if (!email_address) return { error: "Email address is required" };
  const { error } = await supabase.from("whitelist_email_addresses").update({ email_address }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/whitelisted-emails");
  return { success: true };
}

export async function deleteEmail(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID is required" };
  const { error } = await supabase.from("whitelist_email_addresses").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/whitelisted-emails");
  return { success: true };
}
