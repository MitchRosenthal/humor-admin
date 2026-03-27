import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function HumorFlavorsPage() {
  const supabase = await createClient();

  const [{ data: flavors, error: fError }, { data: steps, error: sError }] =
    await Promise.all([
      supabase
        .from("humor_flavors")
        .select("id, slug, description, created_datetime_utc")
        .order("id"),
      supabase
        .from("humor_flavor_steps")
        .select(
          "id, humor_flavor_id, order_by, description, llm_model_id, llm_temperature, llm_system_prompt, llm_user_prompt"
        )
        .order("humor_flavor_id")
        .order("order_by"),
    ]);

  const stepsByFlavor: Record<number, typeof steps> = {};
  steps?.forEach((s) => {
    if (!stepsByFlavor[s.humor_flavor_id])
      stepsByFlavor[s.humor_flavor_id] = [];
    stepsByFlavor[s.humor_flavor_id]!.push(s);
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Humor Flavors</h1>
      <p className="text-gray-400 mb-6">
        Read-only view of humor flavors and their processing steps
      </p>

      {(fError || sError) && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error: {fError?.message || sError?.message}
        </div>
      )}

      <div className="space-y-4">
        {flavors?.map((flavor) => (
          <div
            key={flavor.id}
            className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <span className="text-white font-semibold">{flavor.slug}</span>
                <span className="ml-3 text-gray-400 text-sm">
                  {flavor.description}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-md">
                  ID {flavor.id}
                </span>
                <span className="text-xs text-gray-500">
                  {stepsByFlavor[flavor.id]?.length ?? 0} steps
                </span>
              </div>
            </div>

            {stepsByFlavor[flavor.id] && stepsByFlavor[flavor.id]!.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/40">
                    <th className="text-left px-5 py-2 text-gray-500 font-medium text-xs w-12">
                      #
                    </th>
                    <th className="text-left px-5 py-2 text-gray-500 font-medium text-xs">
                      Description
                    </th>
                    <th className="text-left px-5 py-2 text-gray-500 font-medium text-xs w-24">
                      Model ID
                    </th>
                    <th className="text-left px-5 py-2 text-gray-500 font-medium text-xs w-24">
                      Temp
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stepsByFlavor[flavor.id]!.map((step) => (
                    <tr
                      key={step.id}
                      className="border-t border-gray-800/60 hover:bg-gray-800/20"
                    >
                      <td className="px-5 py-2 text-gray-500 text-xs">
                        {step.order_by}
                      </td>
                      <td className="px-5 py-2 text-gray-300 text-xs">
                        {step.description ?? (
                          <span className="italic text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-2 text-gray-400 text-xs font-mono">
                        {step.llm_model_id}
                      </td>
                      <td className="px-5 py-2 text-gray-400 text-xs">
                        {step.llm_temperature ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-3 text-gray-600 text-sm italic">
                No steps defined
              </p>
            )}
          </div>
        ))}
        {(!flavors || flavors.length === 0) && (
          <p className="text-gray-500 text-sm py-8 text-center">
            No humor flavors found.
          </p>
        )}
      </div>
    </div>
  );
}
