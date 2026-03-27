import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function LLMResponsesPage() {
  const supabase = await createClient();

  const { data: responses, error } = await supabase
    .from("llm_model_responses")
    .select(
      "id, created_datetime_utc, llm_model_id, humor_flavor_id, processing_time_seconds, llm_temperature, llm_model_response"
    )
    .order("created_datetime_utc", { ascending: false })
    .limit(50);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">LLM Responses</h1>
      <p className="text-gray-400 mb-6">Read-only view of LLM model responses</p>

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading responses: {error.message}
        </div>
      )}

      <div className="space-y-3">
        {responses?.map((resp) => (
          <div
            key={resp.id}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5"
          >
            <div className="flex items-center gap-4 mb-3">
              <span className="text-xs font-mono text-gray-500">
                {resp.id ? String(resp.id).slice(0, 8) + "…" : "—"}
              </span>
              <span className="text-xs bg-blue-900/40 text-blue-300 px-2 py-0.5 rounded">
                Model {resp.llm_model_id}
              </span>
              <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded">
                Flavor {resp.humor_flavor_id}
              </span>
              {resp.processing_time_seconds != null && (
                <span className="text-xs text-gray-500">
                  {Number(resp.processing_time_seconds).toFixed(2)}s
                </span>
              )}
              {resp.llm_temperature != null && (
                <span className="text-xs text-gray-500">
                  temp={resp.llm_temperature}
                </span>
              )}
              <span className="ml-auto text-xs text-gray-600">
                {resp.created_datetime_utc
                  ? new Date(resp.created_datetime_utc).toLocaleString()
                  : "—"}
              </span>
            </div>
            <p className="text-sm text-gray-300 line-clamp-3 bg-gray-800/50 rounded-lg px-4 py-3 font-mono">
              {resp.llm_model_response ?? (
                <span className="italic text-gray-600">No response content</span>
              )}
            </p>
          </div>
        ))}
        {(!responses || responses.length === 0) && (
          <p className="text-gray-500 text-sm py-8 text-center">No LLM responses found.</p>
        )}
      </div>
      <p className="text-gray-500 text-xs mt-4">Showing up to 50 most recent responses</p>
    </div>
  );
}
