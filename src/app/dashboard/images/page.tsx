import { createClient } from "@/lib/supabase/server";
import { CreateImageForm, ImageCard } from "./ImageManager";

export const revalidate = 0;

export default async function ImagesPage() {
  const supabase = await createClient();

  const { data: images, error } = await supabase
    .from("images")
    .select("id, url, created_datetime_utc")
    .order("created_datetime_utc", { ascending: false })
    .limit(50);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-2">Images</h1>
      <p className="text-gray-400 mb-6">Create, view, edit, and delete images</p>

      <CreateImageForm />

      {error && (
        <div className="mb-4 bg-red-900/40 border border-red-700 text-red-300 text-sm rounded-lg px-4 py-3">
          Error loading images: {error.message}
        </div>
      )}

      <h2 className="text-lg font-semibold text-white mb-4">
        Recent Images{" "}
        <span className="text-sm font-normal text-gray-500">
          ({images?.length ?? 0} shown)
        </span>
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images?.map((image) => (
          <ImageCard key={image.id} image={image} />
        ))}
        {(!images || images.length === 0) && (
          <p className="col-span-4 text-gray-500 text-sm py-8 text-center">
            No images found.
          </p>
        )}
      </div>
    </div>
  );
}
