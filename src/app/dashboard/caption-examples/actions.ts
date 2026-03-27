"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCaptionExample(formData: FormData) {
  const supabase = await createClient();
  const image_description = formData.get("image_description") as string;
  const caption = formData.get("caption") as string;
  const explanation = (formData.get("explanation") as string) || null;
  const priority = parseInt(formData.get("priority") as string, 10) || 0;

  if (!image_description) return { error: "Image description is required" };
  if (!caption) return { error: "Caption is required" };

  const { error } = await supabase
    .from("caption_examples")
    .insert({ image_description, caption, explanation, priority });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/caption-examples");
  return { success: true };
}

export async function updateCaptionExample(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const image_description = formData.get("image_description") as string;
  const caption = formData.get("caption") as string;
  const explanation = (formData.get("explanation") as string) || null;
  const priority = parseInt(formData.get("priority") as string, 10) || 0;

  if (!id) return { error: "ID is required" };
  if (!image_description) return { error: "Image description is required" };
  if (!caption) return { error: "Caption is required" };

  const { error } = await supabase
    .from("caption_examples")
    .update({ image_description, caption, explanation, priority })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/caption-examples");
  return { success: true };
}

export async function deleteCaptionExample(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID is required" };

  const { error } = await supabase.from("caption_examples").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/caption-examples");
  return { success: true };
}
