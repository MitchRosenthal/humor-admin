import { createClient } from "@/lib/supabase/server";
import { CreateEmailForm, EmailsTable } from "./WhitelistManager";

export const revalidate = 0;

export default async function WhitelistedEmailsPage() {
  const supabase = await createClient();

  const { data: emails, error } = await supabase
    .from("whitelist_email_addresses")
    .select("id, email_address, created_datetime_utc")
    .order("email_address");

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Whitelisted Emails</h1>
      <p className="text-gray-400 mb-6">Manage individual email addresses permitted to sign up</p>

      <CreateEmailForm />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading emails: {error.message}
        </div>
      )}

      <EmailsTable emails={emails ?? []} />
    </div>
  );
}
