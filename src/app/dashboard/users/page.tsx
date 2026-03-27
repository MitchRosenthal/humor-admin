import { createClient } from "@/lib/supabase/server";

export const revalidate = 30;

export default async function UsersPage() {
  const supabase = await createClient();

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, is_superadmin, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Users / Profiles</h1>
      <p className="text-gray-400 mb-6">Read-only view of all registered profiles</p>

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading profiles: {error.message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-800/50">
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Name</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Email</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Superadmin</th>
              <th className="text-left px-5 py-3 text-gray-400 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {profiles?.map((profile) => (
              <tr
                key={profile.id}
                className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors"
              >
                <td className="px-5 py-3 text-white font-medium">
                  {profile.first_name || profile.last_name
                    ? `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()
                    : <span className="text-gray-500 italic">No name</span>}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {profile.email ?? "—"}
                </td>
                <td className="px-5 py-3">
                  {profile.is_superadmin ? (
                    <span className="inline-flex items-center gap-1 bg-yellow-900/40 border border-yellow-700 text-yellow-300 text-xs px-2 py-0.5 rounded-full">
                      ⭐ Superadmin
                    </span>
                  ) : (
                    <span className="text-gray-500 text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-400">
                  {profile.created_datetime_utc
                    ? new Date(profile.created_datetime_utc).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {(!profiles || profiles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  No profiles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-gray-500 text-xs mt-3">Showing up to 100 most recent profiles</p>
    </div>
  );
}
