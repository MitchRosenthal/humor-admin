"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createTerm(formData: FormData) {
  const supabase = await createClient();
  const term = formData.get("term") as string;
  const definition = formData.get("definition") as string;
  const example = (formData.get("example") as string) || null;
  const priority = parseInt(formData.get("priority") as string, 10) || 0;

  if (!term) return { error: "Term is required" };
  if (!definition) return { error: "Definition is required" };

  const { error } = await supabase
    .from("terms")
    .insert({ term, definition, example, priority });

  if (error) return { error: error.message };
  revalidatePath("/dashboard/terms");
  return { success: true };
}

export async function updateTerm(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const term = formData.get("term") as string;
  const definition = formData.get("definition") as string;
  const example = (formData.get("example") as string) || null;
  const priority = parseInt(formData.get("priority") as string, 10) || 0;

  if (!id) return { error: "ID is required" };
  if (!term) return { error: "Term is required" };
  if (!definition) return { error: "Definition is required" };

  const { error } = await supabase
    .from("terms")
    .update({ term, definition, example, priority })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/terms");
  return { success: true };
}

export async function deleteTerm(formData: FormData) {
  const supabase = await createClient();
  const id = formData.get("id") as string;
  if (!id) return { error: "ID is required" };

  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/dashboard/terms");
  return { success: true };
}
