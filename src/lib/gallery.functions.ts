import { createServerFn } from "@tanstack/react-start";

export type ManagedGalleryPhoto = {
  id: string;
  altText: string;
  sortOrder: number;
  storagePath: string;
  url: string;
};

export const getManagedGalleryPhotos = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("gallery_photos")
    .select("id, alt_text, sort_order, storage_path")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data?.length) return [] as ManagedGalleryPhoto[];

  const paths = data.map((photo) => photo.storage_path);
  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from("gallery")
    .createSignedUrls(paths, 60 * 60);

  if (signedError) throw signedError;
  return data.flatMap((photo, index) => {
    const url = signed?.[index]?.signedUrl;
    return url
      ? [{ id: photo.id, altText: photo.alt_text, sortOrder: photo.sort_order, storagePath: photo.storage_path, url }]
      : [];
  });
});