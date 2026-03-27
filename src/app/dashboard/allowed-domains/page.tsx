import { createClient } from "@/lib/supabase/server";
import { CreateDomainForm, DomainsTable } from "./AllowedDomainsManager";

export const revalidate = 0;

export default async function AllowedDomainsPage() {
  const supabase = await createClient();

  const { data: domains, error } = await supabase
    .from("allowed_signup_domains")
    .select("id, apex_domain, created_datetime_utc")
    .order("apex_domain");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Allowed Signup Domains</h1>
      <p className="text-gray-400 mb-6">Manage which email domains are permitted to sign up</p>

      <CreateDomainForm />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading domains: {error.message}
        </div>
      )}

      <DomainsTable domains={domains ?? []} />
    </div>
  );
}
