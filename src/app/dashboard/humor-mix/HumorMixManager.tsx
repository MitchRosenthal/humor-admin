"use client";

import { useState, useTransition } from "react";
import { updateHumorMix } from "./actions";

type MixRow = {
  id: number;
  humor_flavor_id: number;
  caption_count: number;
  created_datetime_utc: string | null;
  flavor_slug?: string;
  flavor_description?: string;
};

export function MixTable({ rows }: { rows: MixRow[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-800/50">
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-16">ID</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium">Flavor</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-48">Caption Count</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-28">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <MixRow key={row.id} row={row} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                No humor mix entries found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function MixRow({ row }: { row: MixRow }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(row.id));
    startTransition(async () => {
      const result = await updateHumorMix(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  };

  return (
    <tr className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{row.id}</td>
      <td className="px-5 py-3 text-gray-200">
        <span className="font-medium">{row.flavor_slug ?? `Flavor #${row.humor_flavor_id}`}</span>
        {row.flavor_description && (
          <span className="ml-2 text-gray-500 text-xs">{row.flavor_description}</span>
        )}
      </td>
      <td className="px-5 py-3">
        {editing ? (
          <form onSubmit={handleUpdate} className="flex items-center gap-2">
            <input
              name="caption_count"
              type="number"
              min="0"
              defaultValue={row.caption_count}
              className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            {error && <span className="text-red-400 text-xs">{error}</span>}
            <button
              type="submit"
              disabled={pending}
              className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded-lg"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-white font-mono">{row.caption_count}</span>
            <button
              onClick={() => setEditing(true)}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg"
            >
              ✏️ Edit
            </button>
          </div>
        )}
      </td>
      <td className="px-5 py-3 text-gray-400 text-xs">
        {row.created_datetime_utc
          ? new Date(row.created_datetime_utc).toLocaleDateString()
          : "—"}
      </td>
    </tr>
  );
}
