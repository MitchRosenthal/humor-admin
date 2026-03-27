"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createImage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const url = formData.get("url") as string;

  if (!url) return { error: "URL is required" };

  const { error } = await supabase.from("images").insert({ url });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/images");
  return { success: true };
}

export async function updateImage(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const url = formData.get("url") as string;

  if (!id) return { error: "ID is required" };
  if (!url) return { error: "URL is required" };

  const { error } = await supabase
    .from("images")
    .update({ url })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/images");
  return { success: true };
}

export async function deleteImage(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;

  if (!id) return { error: "ID is required" };

  const { error } = await supabase.from("images").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/images");
  return { success: true };
}
