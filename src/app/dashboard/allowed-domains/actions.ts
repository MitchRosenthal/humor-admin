"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createDomain(formData: FormData) {
  const supabase = await createClient();
  const apex_domain = (formData.get("apex_domain") as string)?.trim().toLowerCase();
  if (!apex_domain) return { error: "Domain is required" };
  const { error } = await supabase.from("allowed_signup_domains").insert({ apex_domain });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/allowed-domains");
  return { success: true };
}

export async function updateDomain(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const apex_domain = (formData.get("apex_domain") as string)?.trim().toLowerCase();
  if (!id) return { error: "ID is required" };
  if (!apex_domain) return { error: "Domain is required" };
  const { error } = await supabase.from("allowed_signup_domains").update({ apex_domain }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/allowed-domains");
  return { success: true };
}

export async function deleteDomain(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID is required" };
  const { error } = await supabase.from("allowed_signup_domains").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/allowed-domains");
  return { success: true };
}
