import { createClient } from "@/lib/supabase/server";
import { CreateTermForm, TermCard } from "./TermsManager";

export const revalidate = 0;

export default async function TermsPage() {
  const supabase = await createClient();

  const { data: terms, error } = await supabase
    .from("terms")
    .select("id, term, definition, example, priority, created_datetime_utc")
    .order("priority", { ascending: false })
    .order("term")
    .limit(200);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Terms</h1>
      <p className="text-gray-400 mb-6">Create, view, edit, and delete humor terms</p>

      <CreateTermForm />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading terms: {error.message}
        </div>
      )}

      <h2 className="text-lg font-semibold text-white mb-4">
        All Terms{" "}
        <span className="text-sm font-normal text-gray-500">
          ({terms?.length ?? 0} shown)
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {terms?.map((term) => (
          <TermCard key={term.id} term={term} />
        ))}
        {(!terms || terms.length === 0) && (
          <p className="col-span-2 text-gray-500 text-sm py-8 text-center">
            No terms found.
          </p>
        )}
      </div>
    </div>
  );
}
