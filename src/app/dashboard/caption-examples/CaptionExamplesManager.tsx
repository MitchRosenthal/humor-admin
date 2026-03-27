"use client";

import { useState, useTransition } from "react";
import { createCaptionExample, updateCaptionExample, deleteCaptionExample } from "./actions";

type ExampleRow = {
  id: number;
  image_description: string;
  caption: string;
  explanation: string | null;
  priority: number | null;
  created_datetime_utc: string | null;
};

export function CreateExampleForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createCaptionExample(formData);
      if (result?.error) setError(result.error);
      else { setSuccess(true); (e.target as HTMLFormElement).reset(); }
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">➕ Add Caption Example</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Image Description *</label>
            <textarea name="image_description" required rows={2} placeholder="Describe the image..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Caption *</label>
            <textarea name="caption" required rows={2} placeholder="The example caption..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-400 block mb-1">Explanation</label>
            <textarea name="explanation" rows={2} placeholder="Why is this funny? (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Priority</label>
            <input name="priority" type="number" defaultValue={0} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">Example created!</p>}
        <button type="submit" disabled={pending} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {pending ? "Creating…" : "Create Example"}
        </button>
      </form>
    </div>
  );
}

export function ExampleCard({ example }: { example: ExampleRow }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(example.id));
    startTransition(async () => {
      const result = await updateCaptionExample(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", String(example.id));
    startTransition(async () => {
      await deleteCaptionExample(formData);
      setDeleteConfirm(false);
    });
  };

  if (editing) {
    return (
      <div className="bg-gray-900 border border-blue-700 rounded-xl p-5">
        <form onSubmit={handleUpdate} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Image Description</label>
            <textarea name="image_description" defaultValue={example.image_description} required rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Caption</label>
            <textarea name="caption" defaultValue={example.caption} required rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Explanation</label>
            <textarea name="explanation" defaultValue={example.explanation ?? ""} rows={2} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Priority</label>
            <input name="priority" type="number" defaultValue={example.priority ?? 0} className="w-32 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" />
          </div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={pending} className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          {example.created_datetime_utc ? new Date(example.created_datetime_utc).toLocaleDateString() : "—"}
          {example.priority != null && example.priority !== 0 && ` · priority ${example.priority}`}
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Image</p>
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{example.image_description}</p>
      <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Caption</p>
      <p className="text-white text-sm font-medium mb-3">"{example.caption}"</p>
      {example.explanation && (
        <>
          <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Explanation</p>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{example.explanation}</p>
        </>
      )}
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      {deleteConfirm ? (
        <div className="flex gap-2">
          <button onClick={handleDelete} disabled={pending} className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg">Confirm delete</button>
          <button onClick={() => setDeleteConfirm(false)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">Cancel</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg">✏️ Edit</button>
          <button onClick={() => setDeleteConfirm(true)} className="text-xs bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg">🗑️ Delete</button>
        </div>
      )}
    </div>
  );
}
