import { createClient } from "@/lib/supabase/server";

export const revalidate = 60;

async function getStats() {
  const supabase = await createClient();

  const [
    { count: totalImages },
    { count: totalCaptions },
    { count: totalUsers },
    { count: totalVotes },
    { data: allCaptionVotes },
    { data: recentImages },
  ] = await Promise.all([
    supabase.from("images").select("*", { count: "exact", head: true }),
    supabase.from("captions").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("caption_votes").select("*", { count: "exact", head: true }),
    // Fetch caption votes for all stats computation
    supabase
      .from("caption_votes")
      .select("caption_id, vote_value")
      .limit(5000),
    // 5 most recent images
    supabase
      .from("images")
      .select("id, url, created_at_utc")
      .order("created_at_utc", { ascending: false })
      .limit(5),
  ]);

  // Compute net score per caption from all fetched votes
  const scoreMap: Record<string, number> = {};
  const voteCountMap: Record<string, number> = {};
  for (const v of allCaptionVotes ?? []) {
    scoreMap[v.caption_id] = (scoreMap[v.caption_id] ?? 0) + v.vote_value;
    voteCountMap[v.caption_id] = (voteCountMap[v.caption_id] ?? 0) + 1;
  }

  // Top 5 captions by net score
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

  // Vote sentiment
  const upvotes = (allCaptionVotes ?? []).filter((v) => v.vote_value > 0).length;
  const downvotes = (allCaptionVotes ?? []).filter((v) => v.vote_value < 0).length;
  const upvotePct = upvotes + downvotes > 0 ? Math.round((upvotes / (upvotes + downvotes)) * 100) : 0;

  // Caption rating stats
  const ratedCaptionIds = Object.keys(scoreMap);
  const ratedCaptions = ratedCaptionIds.length;
  const ratedPct = (totalCaptions ?? 0) > 0 ? Math.round((ratedCaptions / (totalCaptions ?? 1)) * 100) : 0;
  const avgVotesPerRated = ratedCaptions > 0 ? (totalVotes ?? 0) / ratedCaptions : 0;

  // Score distribution among rated captions
  const positiveCount = ratedCaptionIds.filter((id) => scoreMap[id] > 0).length;
  const negativeCount = ratedCaptionIds.filter((id) => scoreMap[id] < 0).length;
  const neutralCount = ratedCaptionIds.filter((id) => scoreMap[id] === 0).length;

  // Most voted captions (by total vote count, regardless of direction)
  const mostVotedIds = Object.entries(voteCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  let mostVotedDetails: { id: string; content: string; voteCount: number; netScore: number }[] = [];
  if (mostVotedIds.length > 0) {
    const { data: mvTexts } = await supabase
      .from("captions")
      .select("id, content")
      .in("id", mostVotedIds.map(([id]) => id));
    mostVotedDetails = mostVotedIds.map(([id, voteCount]) => ({
      id,
      content: mvTexts?.find((c) => c.id === id)?.content ?? "—",
      voteCount,
      netScore: scoreMap[id] ?? 0,
    }));
  }

  return {
    totalImages: totalImages ?? 0,
    totalCaptions: totalCaptions ?? 0,
    totalUsers: totalUsers ?? 0,
    totalVotes: totalVotes ?? 0,
    topCaptionDetails,
    recentImages: recentImages ?? [],
    upvotes,
    downvotes,
    upvotePct,
    ratedCaptions,
    ratedPct,
    avgVotesPerRated,
    positiveCount,
    negativeCount,
    neutralCount,
    mostVotedDetails,
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
            {stats.upvotes.toLocaleString()} upvotes · {stats.downvotes.toLocaleString()} downvotes
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

        {/* Caption Rating Stats */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">📊 Caption Rating Stats</h2>

          {/* Rating coverage */}
          <div className="mb-5">
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-gray-400">Captions Rated</span>
              <span className="text-white font-medium">
                {stats.ratedCaptions.toLocaleString()} / {stats.totalCaptions.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${stats.ratedPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{stats.ratedPct}% of captions have received at least one vote</p>
          </div>

          {/* Avg votes per rated caption */}
          <div className="mb-5 flex justify-between items-center border-t border-gray-800 pt-4">
            <span className="text-gray-400 text-sm">Avg votes per rated caption</span>
            <span className="text-white font-bold text-xl">{stats.avgVotesPerRated.toFixed(1)}</span>
          </div>

          {/* Score distribution */}
          <div className="border-t border-gray-800 pt-4">
            <p className="text-gray-400 text-sm mb-3">Net score distribution</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-green-900/40 border border-green-800 rounded-lg p-3 text-center">
                <div className="text-green-400 font-bold text-xl">{stats.positiveCount}</div>
                <div className="text-gray-400 text-xs mt-0.5">👍 Positive</div>
              </div>
              <div className="flex-1 bg-gray-800/60 border border-gray-700 rounded-lg p-3 text-center">
                <div className="text-gray-300 font-bold text-xl">{stats.neutralCount}</div>
                <div className="text-gray-400 text-xs mt-0.5">😐 Neutral</div>
              </div>
              <div className="flex-1 bg-red-900/40 border border-red-800 rounded-lg p-3 text-center">
                <div className="text-red-400 font-bold text-xl">{stats.negativeCount}</div>
                <div className="text-gray-400 text-xs mt-0.5">👎 Negative</div>
              </div>
            </div>
          </div>

          {/* Most voted captions */}
          {stats.mostVotedDetails.length > 0 && (
            <div className="border-t border-gray-800 pt-4 mt-4">
              <p className="text-gray-400 text-sm mb-3">Most voted captions</p>
              <ol className="space-y-2">
                {stats.mostVotedDetails.map((c, i) => (
                  <li key={c.id} className="flex items-start gap-3">
                    <span className="text-gray-500 text-xs font-mono w-4 pt-0.5">{i + 1}.</span>
                    <p className="flex-1 text-xs text-gray-300 leading-snug line-clamp-2 min-w-0">{c.content}</p>
                    <div className="shrink-0 text-right">
                      <div className="text-xs text-gray-400">{c.voteCount} votes</div>
                      <div className={`text-xs font-medium ${c.netScore >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {c.netScore > 0 ? "+" : ""}{c.netScore}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
