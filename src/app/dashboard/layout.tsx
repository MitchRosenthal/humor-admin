import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Use service role client to bypass RLS for the superadmin check
  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: profile } = await adminClient
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_superadmin) redirect("/login?error=not_superadmin");

  const navGroups = [
    {
      label: "Overview",
      items: [
        { href: "/dashboard", label: "Stats", icon: "📊" },
        { href: "/dashboard/users", label: "Users", icon: "👥" },
      ],
    },
    {
      label: "Content",
      items: [
        { href: "/dashboard/images", label: "Images", icon: "🖼️" },
        { href: "/dashboard/captions", label: "Captions", icon: "💬" },
        { href: "/dashboard/caption-requests", label: "Caption Requests", icon: "📥" },
        { href: "/dashboard/caption-examples", label: "Caption Examples", icon: "📋" },
        { href: "/dashboard/terms", label: "Terms", icon: "📖" },
      ],
    },
    {
      label: "Humor Engine",
      items: [
        { href: "/dashboard/humor-flavors", label: "Humor Flavors", icon: "🎭" },
        { href: "/dashboard/humor-mix", label: "Humor Mix", icon: "🎚️" },
      ],
    },
    {
      label: "LLM",
      items: [
        { href: "/dashboard/llm-providers", label: "Providers", icon: "🏢" },
        { href: "/dashboard/llm-models", label: "Models", icon: "🤖" },
        { href: "/dashboard/llm-prompt-chains", label: "Prompt Chains", icon: "⛓️" },
        { href: "/dashboard/llm-responses", label: "Responses", icon: "📨" },
      ],
    },
    {
      label: "Access Control",
      items: [
        { href: "/dashboard/allowed-domains", label: "Allowed Domains", icon: "🌐" },
        { href: "/dashboard/whitelisted-emails", label: "Whitelisted Emails", icon: "✉️" },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
        <div className="p-5 border-b border-gray-800 flex-shrink-0">
          <div className="text-xl font-bold text-white flex items-center gap-2">
            <span>😂</span>
            <span>Humor Admin</span>
          </div>
          <div className="text-xs text-gray-500 mt-1 truncate">
            {user.email}
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors text-sm"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800 flex-shrink-0">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
