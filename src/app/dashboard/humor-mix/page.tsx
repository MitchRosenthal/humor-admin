import { createClient } from "@/lib/supabase/server";
import { MixTable } from "./HumorMixManager";

export const revalidate = 0;

export default async function HumorMixPage() {
  const supabase = await createClient();

  const [{ data: mix, error: mError }, { data: flavors }] = await Promise.all([
    supabase
      .from("humor_flavor_mix")
      .select("id, humor_flavor_id, caption_count, created_datetime_utc")
      .order("humor_flavor_id"),
    supabase.from("humor_flavors").select("id, slug, description"),
  ]);

  const flavorMap: Record<number, { slug: string; description: string }> = {};
  flavors?.forEach((f) => {
    flavorMap[f.id] = { slug: f.slug, description: f.description };
  });

  const rows = (mix ?? []).map((row) => ({
    ...row,
    flavor_slug: flavorMap[row.humor_flavor_id]?.slug,
    flavor_description: flavorMap[row.humor_flavor_id]?.description,
  }));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Humor Mix</h1>
      <p className="text-gray-400 mb-6">
        Configure the caption count weighting for each humor flavor
      </p>

      {mError && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading humor mix: {mError.message}
        </div>
      )}

      <MixTable rows={rows} />
    </div>
  );
}
