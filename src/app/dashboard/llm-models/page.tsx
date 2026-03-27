import { createClient } from "@/lib/supabase/server";
import { CreateModelForm, ModelsTable } from "./LLMModelsManager";

export const revalidate = 0;

export default async function LLMModelsPage() {
  const supabase = await createClient();

  const [{ data: models, error }, { data: providers }] = await Promise.all([
    supabase
      .from("llm_models")
      .select("id, name, provider_model_id, llm_provider_id, is_temperature_supported, created_datetime_utc")
      .order("id"),
    supabase.from("llm_providers").select("id, name").order("id"),
  ]);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">LLM Models</h1>
      <p className="text-gray-400 mb-6">Manage available LLM models</p>

      <CreateModelForm providers={providers ?? []} />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading models: {error.message}
        </div>
      )}

      <ModelsTable models={models ?? []} providers={providers ?? []} />
    </div>
  );
}
