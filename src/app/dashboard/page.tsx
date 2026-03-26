import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

async function getStats() {
  const supabase = await createClient();

  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { count: totalVotes },
    { data: topCaptions },
    { data: mostActiveUsers },
    { data: recentImages },
    { data: voteBreakdown },
  ] = await Promise.all([
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    // Top 5 captions by net upvotes
    supabase
      .from("caption_votes")
      .select("caption_id, vote_value")
      .order("vote_value", { ascending: false })
      .limit(200),
    // Most active users by caption count
    supabase
      .from("captions")
      .select("author_id")
      .limit(500),
    // 5 most recent images
    supabase
      .from("images")
      .select("id, url, created_at_utc")
      .order("created_at_utc", { ascending: false })
      .limit(5),
    // Upvotes vs downvotes
    supabase
      .from("caption_votes")
      .select("vote_value")
      .limit(2000),
  ]);

  // Compute net score per caption
  const scoreMap: Record<string, number> = {};
  for (const v of topCaptions ?? []) {
    scoreMap[v.caption_id] = (scoreMap[v.caption_id] ?? 0) + v.vote_value;
  }
  const topCaptionIds = Object.entries(scoreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Get caption text for top captions
  let topCaptionDetails: { id: string; content: string; score: number }[] = [];
  if (topCaptionIds.length > 0) {
    const { data: captionTexts } = await supabase
      .from("captions")
      .select("id, content")
      .in(
        "id",
        topCaptionIds.map(([id]) => id)
      );
    topCaptionDetails = topCaptionIds.map(([id, score]) => ({
      id,
      content: captionTexts?.find((c) => c.id === id)?.content ?? "—",
      score,
    }));
  }

  // Author activity
  const authorCount: Record<string, number> = {};
  for (const c of mostActiveUsers ?? []) {
    if (c.author_id) authorCount[c.author_id] = (authorCount[c.author_id] ?? 0) + 1;
  }
  const topAuthorIds = Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  let topAuthorDetails: { id: string; username: string; count: number }[] = [];
  if (topAuthorIds.length > 0) {
    const { data: authorProfiles } = await supabase
      .from("profiles")
      .select("id, username")
      .in(
        "id",
        topAuthorIds.map(([id]) => id)
      );
    topAuthorDetails = topAuthorIds.map(([id, count]) => ({
      id,
      username: authorProfiles?.find((p) => p.id === id)?.username ?? "unknown",
      count,
    }));
  }

  // Vote breakdown
  const upvotes = voteBreakdown?.filter((v) => v.vote_value > 0).length ?? 0;
  const downvotes = voteBreakdown?.filter((v) => v.vote_value < 0).length ?? 0;
  const upvotePct = upvotes + downvotes > 0 ? Math.round((upvotes / (upvotes + downvotes)) * 100) : 0;

  return {
    totalImages: totalImages ?? 0,
    totalCaptions: totalCaptions ?? 0,
    totalUsers: totalUsers ?? 0,
    totalVotes: totalVotes ?? 0,
    topCaptionDetails,
    topAuthorDetails,
    recentImages: recentImages ?? [],
    upvotes,
    downvotes,
    upvotePct,
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statCards = [
    { label: "Total Images", value: stats.totalImages.toLocaleString(), icon: "🖼️", color: "bg-blue-900/40 border-blue-700" },
    { label: "Total Captions", value: stats.totalCaptions.toLocaleString(), icon: "💬", color: "bg-purple-900/40 border-purple-700" },
    { label: "Registered Users", value: stats.totalUsers.toLocaleString(), icon: "👥", color: "bg-green-900/40 border-green-700" },
    { label: "Total Votes Cast", value: stats.totalVotes.toLocaleString(), icon: "🗳️", color: "bg-yellow-900/40 border-yellow-700" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-400 mb-8">Live stats from the Humor Project staging database</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-5 ${card.color}`}
          >
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold text-white">{card.value}</div>
            <div className="text-sm text-gray-400 mt-1">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Vote Sentiment Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Vote Sentiment</h2>
          <p className="text-gray-400 text-sm mb-4">
            {stats.upvotes.toLocaleString()} upvotes · {stats.downvotes.toLocaleString()} downvotes (sample of 2k)
          </p>
          <div className="w-full bg-gray-800 rounded-full h-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
              style={{ width: `${stats.upvotePct}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-green-400 font-medium">👍 {stats.upvotePct}% positive</span>
            <span className="text-red-400 font-medium">👎 {100 - stats.upvotePct}% negative</span>
          </div>
        </div>

        {/* Captions per Image ratio */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-1">Caption Density</h2>
          <p className="text-gray-400 text-sm mb-4">Average captions generated per image</p>
          <div className="flex items-end gap-1 h-16">
            {[...Array(10)].map((_, i) => {
              const ratio = stats.totalImages > 0 ? stats.totalCaptions / stats.totalImages : 0;
              const height = Math.min(100, (i / 10) * 100);
              const isActive = i < Math.floor(ratio);
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t ${isActive ? "bg-purple-500" : "bg-gray-700"}`}
                  style={{ height: `${20 + height * 0.8}%` }}
                />
              );
            })}
          </div>
          <p className="text-2xl font-bold text-white mt-3">
            {stats.totalImages > 0
              ? (stats.totalCaptions / stats.totalImages).toFixed(1)
              : "—"}{" "}
            <span className="text-base font-normal text-gray-400">captions / image</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Captions */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">🏆 Top Rated Captions</h2>
          {stats.topCaptionDetails.length === 0 ? (
            <p className="text-gray-500 text-sm">No vote data yet.</p>
          ) : (
            <ol className="space-y-3">
              {stats.topCaptionDetails.map((c, i) => (
                <li key={c.id} className="flex items-start gap-3">
                  <span className="text-gray-500 text-sm font-mono w-4 pt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 leading-snug line-clamp-2">{c.content}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${c.score >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {c.score > 0 ? "+" : ""}{c.score}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Most Active Caption Authors */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">✍️ Top Caption Authors</h2>
          {stats.topAuthorDetails.length === 0 ? (
            <p className="text-gray-500 text-sm">No author data yet.</p>
          ) : (
            <ol className="space-y-3">
              {stats.topAuthorDetails.map((a, i) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span className="text-gray-500 text-sm font-mono w-4">{i + 1}.</span>
                  <span className="flex-1 text-sm text-gray-200 truncate">{a.username}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.max(20, (a.count / stats.topAuthorDetails[0].count) * 80)}px`,
                      }}
                    />
                    <span className="text-sm text-blue-300 font-medium w-10 text-right">
                      {a.count}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
