import { createClient } from "@/lib/supabase/server";
import { CreateProviderForm, ProvidersTable } from "./LLMProvidersManager";

export const revalidate = 0;

export default async function LLMProvidersPage() {
  const supabase = await createClient();

  const { data: providers, error } = await supabase
    .from("llm_providers")
    .select("id, name, created_datetime_utc")
    .order("id");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">LLM Providers</h1>
      <p className="text-gray-400 mb-6">Manage LLM API providers (e.g. OpenAI, Anthropic)</p>

      <CreateProviderForm />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading providers: {error.message}
        </div>
      )}

      <ProvidersTable providers={providers ?? []} />
    </div>
  );
}
