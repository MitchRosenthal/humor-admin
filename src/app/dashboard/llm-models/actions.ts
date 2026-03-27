"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createModel(formData: FormData) {
  const supabase = await createClient();
  const name = formData.get("name") as string;
  const provider_model_id = formData.get("provider_model_id") as string;
  const llm_provider_id = parseInt(formData.get("llm_provider_id") as string, 10);
  const is_temperature_supported = formData.get("is_temperature_supported") === "true";

  if (!name) return { error: "Name is required" };
  if (!provider_model_id) return { error: "Provider model ID is required" };
  if (isNaN(llm_provider_id)) return { error: "Provider is required" };

  const { error } = await supabase
    .from("llm_models")
    .insert({ name, provider_model_id, llm_provider_id, is_temperature_supported });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/llm-models");
  return { success: true };
}

export async function updateModel(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const provider_model_id = formData.get("provider_model_id") as string;
  const llm_provider_id = parseInt(formData.get("llm_provider_id") as string, 10);
  const is_temperature_supported = formData.get("is_temperature_supported") === "true";

  if (!id) return { error: "ID is required" };
  if (!name) return { error: "Name is required" };

  const { error } = await supabase
    .from("llm_models")
    .update({ name, provider_model_id, llm_provider_id, is_temperature_supported })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/llm-models");
  return { success: true };
}

export async function deleteModel(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID is required" };
  const { error } = await supabase.from("llm_models").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/llm-models");
  return { success: true };
}
