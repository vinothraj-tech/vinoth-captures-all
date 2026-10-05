import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ImagePlus, LogOut, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getManagedGalleryPhotos, type ManagedGalleryPhoto } from "@/lib/gallery.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Gallery Manager | Vinoth Studio" },
    { name: "description", content: "Manage Vinoth Studio gallery photographs." },
    { property: "og:title", content: "Gallery Manager | Vinoth Studio" },
    { property: "og:description", content: "Manage Vinoth Studio gallery photographs." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<ManagedGalleryPhoto[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  async function refresh() {
    setPhotos(await getManagedGalleryPhotos());
  }

  useEffect(() => {
    async function initialise() {
      const { data: claimed, error } = await supabase.rpc("claim_first_admin");
      if (error || !claimed) {
        setIsAdmin(false);
        setStatus("This account does not have gallery access.");
        return;
      }
      setIsAdmin(true);
      await refresh();
    }
    void initialise();
  }, []);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setStatus("");
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    for (const [index, file] of files.entries()) {
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, { contentType: file.type });
      if (uploadError) { setStatus(uploadError.message); continue; }
      const { error: rowError } = await supabase.from("gallery_photos").insert({ storage_path: path, created_by: user.id, alt_text: file.name.replace(/\.[^.]+$/, "").replaceAll("-", " "), sort_order: photos.length + index });
      if (rowError) setStatus(rowError.message);
    }
    await refresh();
    setBusy(false);
    event.target.value = "";
  }

  async function remove(photo: ManagedGalleryPhoto) {
    setBusy(true);
    const { error } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
    if (!error) await supabase.storage.from("gallery").remove([photo.storagePath]);
    setStatus(error?.message ?? "Photo removed.");
    await refresh();
    setBusy(false);
  }

  async function move(index: number, direction: -1 | 1) {
    const otherIndex = index + direction;
    const current = photos[index];
    const other = photos[otherIndex];
    if (!current || !other) return;
    setBusy(true);
    await Promise.all([
      supabase.from("gallery_photos").update({ sort_order: other.sortOrder }).eq("id", current.id),
      supabase.from("gallery_photos").update({ sort_order: current.sortOrder }).eq("id", other.id),
    ]);
    await refresh();
    setBusy(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  return <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8"><div className="mx-auto max-w-6xl"><header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6"><div><button type="button" onClick={() => navigate({ to: "/" })} className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> View website</button><h1 className="font-display text-4xl font-semibold">Gallery manager</h1></div><Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button></header>{isAdmin === null && <p className="py-12 text-muted-foreground">Checking access…</p>}{isAdmin === false && <p className="py-12 text-destructive">{status}</p>}{isAdmin && <><section className="py-8"><label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gold/50 bg-card text-center transition-colors hover:border-gold"><ImagePlus className="h-7 w-7 text-gold" /><span className="mt-3 font-semibold">Add gallery photos</span><span className="mt-1 text-sm text-muted-foreground">JPG, PNG or WebP · up to 10 MB each</span><Input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload} disabled={busy} /></label>{status && <p role="status" className="mt-3 text-sm text-muted-foreground">{status}</p>}</section><section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo, index) => <article key={photo.id} className="overflow-hidden rounded-lg border border-border bg-card"><img src={photo.url} alt={photo.altText} className="aspect-[4/3] w-full object-cover" /><div className="flex items-center justify-between gap-3 p-3"><p className="truncate text-sm text-muted-foreground">{photo.altText}</p><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Move photo up" disabled={busy || index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button><Button size="icon" variant="ghost" aria-label="Move photo down" disabled={busy || index === photos.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button><Button size="icon" variant="ghost" aria-label="Delete photo" disabled={busy} onClick={() => remove(photo)}><Trash2 /></Button></div></div></article>)}</section></>}</div></main>;
}