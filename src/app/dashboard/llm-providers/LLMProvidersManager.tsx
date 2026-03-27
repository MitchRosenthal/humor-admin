"use client";

import { useState, useTransition } from "react";
import { createProvider, updateProvider, deleteProvider } from "./actions";

type ProviderRow = { id: number; name: string; created_datetime_utc: string | null };

export function CreateProviderForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createProvider(formData);
      if (result?.error) setError(result.error);
      else { setSuccess(true); (e.target as HTMLFormElement).reset(); }
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">➕ Add LLM Provider</h2>
      <form onSubmit={handleSubmit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="text-sm text-gray-400 block mb-1">Provider Name *</label>
          <input name="name" required placeholder="e.g. OpenAI" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {pending ? "Adding…" : "Add Provider"}
        </button>
      </form>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {success && <p className="text-green-400 text-sm mt-2">Provider added!</p>}
    </div>
  );
}

export function ProvidersTable({ providers }: { providers: ProviderRow[] }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-800/50">
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-16">ID</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium">Name</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-32">Created</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => <ProviderRow key={p.id} provider={p} />)}
          {providers.length === 0 && (
            <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-500">No providers found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ProviderRow({ provider }: { provider: ProviderRow }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(provider.id));
    startTransition(async () => {
      const result = await updateProvider(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", String(provider.id));
    startTransition(async () => {
      await deleteProvider(formData);
    });
  };

  return (
    <tr className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{provider.id}</td>
      <td className="px-5 py-3">
        {editing ? (
          <form onSubmit={handleUpdate} className="flex gap-2 items-center">
            <input name="name" defaultValue={provider.name} required className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500" />
            {error && <span className="text-red-400 text-xs">{error}</span>}
            <button type="submit" disabled={pending} className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded-lg">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg">Cancel</button>
          </form>
        ) : (
          <span className="text-gray-200">{provider.name}</span>
        )}
      </td>
      <td className="px-5 py-3 text-gray-400 text-xs">
        {provider.created_datetime_utc ? new Date(provider.created_datetime_utc).toLocaleDateString() : "—"}
      </td>
      <td className="px-5 py-3">
        {!editing && (
          deleteConfirm ? (
            <div className="flex gap-2">
              <button onClick={handleDelete} disabled={pending} className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-2 py-1 rounded-lg">Confirm</button>
              <button onClick={() => setDeleteConfirm(false)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg">Cancel</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(true)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg">✏️</button>
              <button onClick={() => setDeleteConfirm(true)} className="text-xs bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 px-2 py-1 rounded-lg">🗑️</button>
            </div>
          )
        )}
      </td>
    </tr>
  );
}
