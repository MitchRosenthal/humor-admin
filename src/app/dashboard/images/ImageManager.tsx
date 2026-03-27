"use client";

import { useState, useTransition } from "react";
import { createImage, updateImage, deleteImage } from "./actions";
import Image from "next/image";

type ImageRow = {
  id: string;
  url: string;
  created_datetime_utc: string | null;
};

export function CreateImageForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createImage(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">➕ Add New Image</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="text-sm text-gray-400 block mb-1">Image URL *</label>
          <input
            name="url"
            type="url"
            required
            placeholder="https://..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">Image created successfully!</p>}
        <button
          type="submit"
          disabled={pending}
          className="self-start bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {pending ? "Creating…" : "Create Image"}
        </button>
      </form>
    </div>
  );
}

export function ImageCard({ image }: { image: ImageRow }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", image.id);
    startTransition(async () => {
      const result = await updateImage(formData);
      if (result?.error) setError(result.error);
      else setEditing(false);
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    formData.set("id", image.id);
    startTransition(async () => {
      const result = await deleteImage(formData);
      if (result?.error) setError(result.error);
      setDeleteConfirm(false);
    });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="relative h-40 bg-gray-800">
        <Image
          src={image.url}
          alt="Image"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="p-4">
        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-2">
            <input
              name="url"
              defaultValue={image.url}
              placeholder="Image URL"
              type="url"
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="text-xs bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <p className="text-xs text-gray-500 mb-3">
              {image.created_datetime_utc
                ? new Date(image.created_datetime_utc).toLocaleDateString()
                : "—"}
            </p>
            {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
            {deleteConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={pending}
                  className="text-xs bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Confirm delete
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="text-xs bg-red-900/40 hover:bg-red-900/70 border border-red-800 text-red-300 px-3 py-1.5 rounded-lg transition-colors"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
