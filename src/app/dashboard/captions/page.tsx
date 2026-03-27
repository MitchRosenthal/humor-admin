import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function CaptionsPage() {
  const supabase = await createClient();

  const { data: captions, error } = await supabase
    .from("captions")
    .select("id, content, image_id, profile_id, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Captions</h1>
      <p className="text-gray-400 mb-6">Read-only view of AI-generated captions</p>

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading captions: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Caption</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-32">Image ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-32">Author ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-28">Created</th>
            </tr>
          </thead>
          <tbody>
            {captions?.map((caption) => (
              <tr
                key={caption.id}
                className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-5 py-3 text-gray-200 max-w-xs">
                  <span className="line-clamp-2">{caption.content}</span>
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                  {caption.image_id ? caption.image_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                  {caption.profile_id ? caption.profile_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {caption.created_datetime_utc
                    ? new Date(caption.created_datetime_utc).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {(!captions || captions.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  No captions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-gray-500 text-xs mt-3">Showing up to 100 most recent captions</p>
    </div>
  );
}
