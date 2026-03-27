import { createClient } from "@/lib/supabase/server";
import { CreateExampleForm, ExampleCard } from "./CaptionExamplesManager";

export const revalidate = 0;

export default async function CaptionExamplesPage() {
  const supabase = await createClient();

  const { data: examples, error } = await supabase
    .from("caption_examples")
    .select("id, image_description, caption, explanation, priority, created_datetime_utc")
    .order("priority", { ascending: false })
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Caption Examples</h1>
      <p className="text-gray-400 mb-6">Manage example image/caption pairs used for LLM training</p>

      <CreateExampleForm />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading examples: {error.message}
        </div>
      )}

      <h2 className="text-lg font-semibold text-white mb-4">
        Examples{" "}
        <span className="text-sm font-normal text-gray-500">({examples?.length ?? 0} shown)</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {examples?.map((ex) => (
          <ExampleCard key={ex.id} example={ex} />
        ))}
        {(!examples || examples.length === 0) && (
          <p className="col-span-2 text-gray-500 text-sm py-8 text-center">No examples found.</p>
        )}
      </div>
    </div>
  );
}
