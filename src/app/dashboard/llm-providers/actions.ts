"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createProvider(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };
  const { error } = await supabase.from("llm_providers").insert({ name });
  if (error) return { error: error.message };
  revalidatePath("/dashboard/llm-providers");
  return { success: true };
}

export async function updateProvider(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  if (!id) return { error: "ID is required" };
  if (!name) return { error: "Name is required" };
  const { error } = await supabase.from("llm_providers").update({ name }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/llm-providers");
  return { success: true };
}

export async function deleteProvider(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID is required" };
  const { error } = await supabase.from("llm_providers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/llm-providers");
  return { success: true };
}
