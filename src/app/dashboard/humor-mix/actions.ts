"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateHumorMix(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const caption_count = parseInt(formData.get("caption_count") as string, 10);

  if (!id) return { error: "ID is required" };
  if (isNaN(caption_count) || caption_count < 0)
    return { error: "caption_count must be a non-negative integer" };

  const { error } = await supabase
    .from("humor_flavor_mix")
    .update({ caption_count })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/humor-mix");
  return { success: true };
}
