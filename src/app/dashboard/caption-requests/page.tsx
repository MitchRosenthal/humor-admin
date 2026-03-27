import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function CaptionRequestsPage() {
  const supabase = await createClient();

  const { data: requests, error } = await supabase
    .from("caption_requests")
    .select("id, created_datetime_utc, profile_id, image_id")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Caption Requests</h1>
      <p className="text-gray-400 mb-6">Read-only view of caption generation requests</p>

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading caption requests: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-16">ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Profile ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Image ID</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium w-32">Created</th>
            </tr>
          </thead>
          <tbody>
            {requests?.map((req) => (
              <tr
                key={req.id}
                className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{req.id}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                  {req.profile_id ? req.profile_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">
                  {req.image_id ? req.image_id.slice(0, 8) + "…" : "—"}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {req.created_datetime_utc
                    ? new Date(req.created_datetime_utc).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {(!requests || requests.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  No caption requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-gray-500 text-xs mt-3">Showing up to 100 most recent requests</p>
    </div>
  );
}
