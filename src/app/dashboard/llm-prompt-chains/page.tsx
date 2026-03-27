import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function LLMPromptChainsPage() {
  const supabase = await createClient();

  const { data: chains, error } = await supabase
    .from("llm_prompt_chains")
    .select("id, created_datetime_utc, caption_request_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">LLM Prompt Chains</h1>
      <p className="text-gray-400 mb-6">Read-only view of LLM prompt chain executions</p>

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading prompt chains: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-16">ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Caption Request ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-36">Created</th>
            </tr>
          </thead>
          <tbody>
            {chains?.map((chain) => (
              <tr
                key={chain.id}
                className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{chain.id}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                  {chain.caption_request_id ?? "—"}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {chain.created_datetime_utc
                    ? new Date(chain.created_datetime_utc).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))}
            {(!chains || chains.length === 0) && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                  No prompt chains found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-gray-500 text-xs mt-3">Showing up to 100 most recent chains</p>
    </div>
  );
}
