"use client";

import { useState, useTransition } from "react";
import { createModel, updateModel, deleteModel } from "./actions";

type Provider = { id: number; name: string };
type ModelRow = {
  id: number;
  name: string;
  provider_model_id: string;
  llm_provider_id: number;
  is_temperature_supported: boolean;
  created_datetime_utc: string | null;
};

export function CreateModelForm({ providers }: { providers: Provider[] }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createModel(formData);
      if (result?.error) setError(result.error);
      else { setSuccess(true); (e.target as HTMLFormElement).reset(); }
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">➕ Add LLM Model</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Display Name *</label>
          <input name="name" required placeholder="e.g. GPT-4o" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Provider Model ID *</label>
          <input name="provider_model_id" required placeholder="e.g. gpt-4o" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Provider *</label>
          <select name="llm_provider_id" required className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
            <option value="">Select provider…</option>
            {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400 block mb-1">Temperature Supported</label>
          <select name="is_temperature_supported" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        {error && <p className="col-span-2 text-red-400 text-sm">{error}</p>}
        {success && <p className="col-span-2 text-green-400 text-sm">Model added!</p>}
        <div className="col-span-2">
          <button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            {pending ? "Adding…" : "Add Model"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ModelsTable({ models, providers }: { models: ModelRow[]; providers: Provider[] }) {
  const providerMap: Record<number, string> = {};
  providers.forEach((p) => { providerMap[p.id] = p.name; });

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 bg-gray-800/50">
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-12">ID</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium">Name</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium">Model ID</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium">Provider</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-20">Temp</th>
            <th className="text-left px-5 py-3 text-gray-400 font-medium w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m) => <ModelRow key={m.id} model={m} providers={providers} providerMap={providerMap} />)}
          {models.length === 0 && (
            <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500">No models found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function ModelRow({ model, providers, providerMap }: { model: ModelRow; providers: Provider[]; providerMap: Record<number, string> }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(model.id));
    startTransition(async () => {
      const result = await updateModel(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", String(model.id));
    startTransition(async () => { await deleteModel(formData); });
  };

  if (editing) {
    return (
      <tr className="border-b border-gray-800/60 bg-gray-800/20">
        <td className="px-5 py-3 text-gray-500 text-xs">{model.id}</td>
        <td colSpan={5} className="px-5 py-3">
          <form onSubmit={handleUpdate} className="flex flex-wrap gap-2 items-center">
            <input name="name" defaultValue={model.name} required placeholder="Name" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500" />
            <input name="provider_model_id" defaultValue={model.provider_model_id} required placeholder="Model ID" className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500" />
            <select name="llm_provider_id" defaultValue={model.llm_provider_id} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500">
              {providers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select name="is_temperature_supported" defaultValue={String(model.is_temperature_supported)} className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500">
              <option value="true">Temp ✓</option>
              <option value="false">Temp ✗</option>
            </select>
            {error && <span className="text-red-400 text-xs">{error}</span>}
            <button type="submit" disabled={pending} className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-2 py-1 rounded-lg">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg">Cancel</button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-gray-800/60 hover:bg-gray-800/30 transition-colors">
      <td className="px-5 py-3 text-gray-500 text-xs font-mono">{model.id}</td>
      <td className="px-5 py-3 text-gray-200">{model.name}</td>
      <td className="px-5 py-3 text-gray-400 font-mono text-xs">{model.provider_model_id}</td>
      <td className="px-5 py-3 text-gray-400 text-xs">{providerMap[model.llm_provider_id] ?? model.llm_provider_id}</td>
      <td className="px-5 py-3 text-xs">
        <span className={model.is_temperature_supported ? "text-green-400" : "text-gray-600"}>
          {model.is_temperature_supported ? "✓" : "✗"}
        </span>
      </td>
      <td className="px-5 py-3">
        {deleteConfirm ? (
          <div className="flex gap-2">
            <button onClick={handleDelete} disabled={pending} className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-2 py-1 rounded-lg">Confirm</button>
            <button onClick={() => setDeleteConfirm(false)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-lg">✏️</button>
            <button onClick={() => setDeleteConfirm(true)} className="text-xs bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 px-2 py-1 rounded-lg">🗑️</button>
          </div>
        )}
      </td>
    </tr>
  );
}
