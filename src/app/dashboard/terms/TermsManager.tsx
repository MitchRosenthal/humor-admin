"use client";

import { useState, useTransition } from "react";
import { createTerm, updateTerm, deleteTerm } from "./actions";

type TermRow = {
  id: number;
  term: string;
  definition: string;
  example: string | null;
  priority: number | null;
  created_datetime_utc: string | null;
};

export function CreateTermForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTerm(formData);
      if (result?.error) setError(result.error);
      else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">➕ Add New Term</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm text-gray-400 block mb-1">Term *</label>
          <input
            name="term"
            type="text"
            required
            placeholder="e.g. Callback"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="col-span-2 md:col-span-1">
          <label className="text-sm text-gray-400 block mb-1">Priority</label>
          <input
            name="priority"
            type="number"
            defaultValue={0}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-400 block mb-1">Definition *</label>
          <textarea
            name="definition"
            required
            rows={2}
            placeholder="Definition of the term..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        <div className="col-span-2">
          <label className="text-sm text-gray-400 block mb-1">Example</label>
          <textarea
            name="example"
            rows={2}
            placeholder="Optional example usage..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>
        {error && <p className="col-span-2 text-red-400 text-sm">{error}</p>}
        {success && <p className="col-span-2 text-green-400 text-sm">Term created!</p>}
        <div className="col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {pending ? "Creating…" : "Create Term"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function TermCard({ term }: { term: TermRow }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", String(term.id));
    startTransition(async () => {
      const result = await updateTerm(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", String(term.id));
    startTransition(async () => {
      await deleteTerm(formData);
      setDeleteConfirm(false);
    });
  };

  if (editing) {
    return (
      <div className="bg-gray-900 border border-blue-700 rounded-xl p-5">
        <form onSubmit={handleUpdate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Term</label>
              <input
                name="term"
                defaultValue={term.term}
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Priority</label>
              <input
                name="priority"
                type="number"
                defaultValue={term.priority ?? 0}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Definition</label>
            <textarea
              name="definition"
              defaultValue={term.definition}
              required
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Example</label>
            <textarea
              name="example"
              defaultValue={term.example ?? ""}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
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
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold">{term.term}</h3>
        <div className="flex items-center gap-2">
          {term.priority != null && term.priority !== 0 && (
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded">
              priority {term.priority}
            </span>
          )}
          <span className="text-xs text-gray-600">
            {term.created_datetime_utc
              ? new Date(term.created_datetime_utc).toLocaleDateString()
              : "—"}
          </span>
        </div>
      </div>
      <p className="text-gray-300 text-sm mb-2">{term.definition}</p>
      {term.example && (
        <p className="text-gray-500 text-sm italic mb-3">"{term.example}"</p>
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
