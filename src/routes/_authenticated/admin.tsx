import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  ArrowDown, ArrowLeft, ArrowUp, ImagePlus, LogOut, Trash2,
  LayoutDashboard, CalendarDays, Users, Camera, Package, Mail, Pencil,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getManagedGalleryPhotos, type ManagedGalleryPhoto } from "@/lib/gallery.functions";
import {
  getAdminStats, adminListBookings, adminUpdateBookingStatus, adminListCustomers,
  adminListServices, adminUpsertService, adminDeleteService, adminListOrders,
  adminUpdateOrder, adminListMessages,
} from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [
    { title: "Admin Dashboard | Vinoth Studio" },
    { name: "description", content: "Manage Vinoth Studio bookings, customers, services, gallery and orders." },
    { property: "og:title", content: "Admin Dashboard | Vinoth Studio" },
    { property: "og:description", content: "Manage Vinoth Studio bookings, customers, services, gallery and orders." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

type Tab = "overview" | "bookings" | "customers" | "services" | "gallery" | "orders" | "messages";

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "customers", label: "Customers", icon: Users },
  { id: "services", label: "Services", icon: Camera },
  { id: "gallery", label: "Gallery", icon: ImagePlus },
  { id: "orders", label: "Orders", icon: Package },
  { id: "messages", label: "Messages", icon: Mail },
];

const bookingStatuses = ["pending", "confirmed", "rejected", "completed", "cancelled"] as const;
const paymentStatuses = ["pending", "paid", "failed", "refunded"] as const;
const orderStatuses = ["new", "in_progress", "delivered", "cancelled"] as const;

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");

  const [stats, setStats] = useState<{ customers: number; bookings: number; pendingBookings: number; completedBookings: number; orders: number; revenue: number } | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any | null>(null);
  const [photos, setPhotos] = useState<ManagedGalleryPhoto[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    async function initialise() {
      const { data: claimed, error } = await supabase.rpc("claim_first_admin");
      if (error || !claimed) {
        setIsAdmin(false);
        setStatus("This account does not have admin access.");
        return;
      }
      setIsAdmin(true);
    }
    void initialise();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    void loadTab(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, tab]);

  async function loadTab(t: Tab) {
    setStatus("");
    try {
      if (t === "overview") setStats(await getAdminStats());
      if (t === "bookings") setBookings(await adminListBookings({ data: { search: bookingSearch || undefined, status: bookingStatusFilter || undefined } }));
      if (t === "customers") setCustomers(await adminListCustomers({ data: { search: customerSearch || undefined } }));
      if (t === "services") setServices(await adminListServices());
      if (t === "gallery") setPhotos(await getManagedGalleryPhotos());
      if (t === "orders") setOrders(await adminListOrders());
      if (t === "messages") setMessages(await adminListMessages());
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not load this section.");
    }
  }

  async function setBookingStatus(id: string, next: string) {
    setBusy(true);
    try {
      await adminUpdateBookingStatus({ data: { id, status: next as (typeof bookingStatuses)[number] } });
      setStatus("Booking updated.");
      await loadTab("bookings");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      await adminUpsertService({
        data: {
          id: editingService?.id,
          serviceName: String(form.get("serviceName") ?? ""),
          description: String(form.get("description") ?? ""),
          price: Number(form.get("price") ?? 0),
          active: form.get("active") === "on",
        },
      });
      setEditingService(null);
      setStatus("Service saved.");
      await loadTab("services");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteService(id: string) {
    setBusy(true);
    try {
      await adminDeleteService({ data: { id } });
      setStatus("Service deleted.");
      await loadTab("services");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setStatus("");
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;
    for (const [index, file] of files.entries()) {
      if (file.size > 10 * 1024 * 1024) { setStatus(`${file.name} is over 10 MB.`); continue; }
      const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
      const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("gallery").upload(path, file, { contentType: file.type });
      if (uploadError) { setStatus(uploadError.message); continue; }
      const { error: rowError } = await supabase.from("gallery_photos").insert({ storage_path: path, created_by: user.id, alt_text: file.name.replace(/\.[^.]+$/, "").replaceAll("-", " "), sort_order: photos.length + index });
      if (rowError) setStatus(rowError.message);
    }
    await loadTab("gallery");
    setBusy(false);
    event.target.value = "";
  }

  async function removePhoto(photo: ManagedGalleryPhoto) {
    setBusy(true);
    const { error } = await supabase.from("gallery_photos").delete().eq("id", photo.id);
    if (!error) await supabase.storage.from("gallery").remove([photo.storagePath]);
    setStatus(error?.message ?? "Photo removed.");
    await loadTab("gallery");
    setBusy(false);
  }

  async function movePhoto(index: number, direction: -1 | 1) {
    const current = photos[index];
    const other = photos[index + direction];
    if (!current || !other) return;
    setBusy(true);
    await Promise.all([
      supabase.from("gallery_photos").update({ sort_order: other.sortOrder }).eq("id", current.id),
      supabase.from("gallery_photos").update({ sort_order: current.sortOrder }).eq("id", other.id),
    ]);
    await loadTab("gallery");
    setBusy(false);
  }

  async function setOrder(id: string, field: "paymentStatus" | "orderStatus", value: string) {
    setBusy(true);
    try {
      await adminUpdateOrder({ data: { id, [field]: value } as any });
      setStatus("Order updated.");
      await loadTab("orders");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  const selectClass = "border-input bg-background h-9 rounded-md border px-2 text-sm outline-none focus-visible:border-ring";

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <button type="button" onClick={() => navigate({ to: "/" })} className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> View website
            </button>
            <h1 className="font-display text-4xl font-semibold">Studio dashboard</h1>
          </div>
          <Button variant="outline" onClick={signOut}><LogOut /> Sign out</Button>
        </header>

        {isAdmin === null && <p className="py-12 text-muted-foreground">Checking access…</p>}
        {isAdmin === false && <p className="py-12 text-destructive">{status}</p>}

        {isAdmin && (
          <>
            <nav className="mt-6 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <button key={t.id} type="button" onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${tab === t.id ? "border-gold bg-gold/10 text-gold" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                  <t.icon className="h-4 w-4" /> {t.label}
                </button>
              ))}
            </nav>
            {status && <p role="status" className="mt-4 text-sm text-gold-soft">{status}</p>}

            {tab === "overview" && (
              <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats === null ? (
                  <p className="text-sm text-muted-foreground">Loading statistics…</p>
                ) : (
                  [
                    ["Total customers", stats.customers],
                    ["Total bookings", stats.bookings],
                    ["Pending bookings", stats.pendingBookings],
                    ["Completed bookings", stats.completedBookings],
                    ["Total orders", stats.orders],
                    ["Revenue (paid)", `₹${stats.revenue.toLocaleString("en-IN")}`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-border bg-card p-6">
                      <p className="font-display text-3xl font-semibold text-gold">{value}</p>
                      <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">{label}</p>
                    </div>
                  ))
                )}
              </section>
            )}

            {tab === "bookings" && (
              <section className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <Input placeholder="Search name, email, phone, service…" value={bookingSearch} onChange={(e) => setBookingSearch(e.target.value)} className="max-w-xs" />
                  <select value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)} className={selectClass}>
                    <option value="">All statuses</option>
                    {bookingStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button variant="outline" onClick={() => loadTab("bookings")}>Search</Button>
                </div>
                <div className="mt-5 space-y-3">
                  {bookings.length === 0 && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No bookings found.</p>}
                  {bookings.map((b) => (
                    <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                      <div>
                        <p className="font-semibold">{b.customers?.full_name ?? "Customer"} — {b.service}</p>
                        <p className="text-sm text-muted-foreground">{b.booking_date} at {String(b.booking_time).slice(0, 5)} · {b.customers?.phone ?? b.customers?.email ?? ""}</p>
                        {b.notes && <p className="mt-1 text-sm text-muted-foreground">“{b.notes}”</p>}
                      </div>
                      <select value={b.status} disabled={busy} onChange={(e) => setBookingStatus(b.id, e.target.value)} className={selectClass}>
                        {bookingStatuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "customers" && (
              <section className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <Input placeholder="Search name, email, phone…" value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="max-w-xs" />
                  <Button variant="outline" onClick={() => loadTab("customers")}>Search</Button>
                </div>
                <div className="mt-5 space-y-3">
                  {customers.length === 0 && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No customers yet.</p>}
                  {customers.map((c) => (
                    <div key={c.id} className="rounded-2xl border border-border bg-card p-5">
                      <p className="font-semibold">{c.full_name}</p>
                      <p className="text-sm text-muted-foreground">{[c.phone, c.email, c.address].filter(Boolean).join(" · ")}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "services" && (
              <section className="mt-8">
                <form onSubmit={saveService} className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
                  <Input name="serviceName" placeholder="Service name" defaultValue={editingService?.service_name ?? ""} required />
                  <Input name="price" type="number" min="0" step="0.01" placeholder="Price (₹)" defaultValue={editingService?.price ?? ""} required />
                  <textarea name="description" placeholder="Description" rows={2} defaultValue={editingService?.description ?? ""}
                    className="border-input bg-background rounded-md border px-3 py-2 text-sm outline-none focus-visible:border-ring sm:col-span-2" />
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="active" defaultChecked={editingService ? editingService.active : true} /> Active (visible on the website)
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={busy}>{editingService ? "Save changes" : "Add service"}</Button>
                    {editingService && <Button type="button" variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>}
                  </div>
                </form>
                <div className="mt-5 space-y-3">
                  {services.map((s) => (
                    <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                      <div>
                        <p className="font-semibold">{s.service_name} — ₹{Number(s.price).toLocaleString("en-IN")} {!s.active && <span className="text-sm text-muted-foreground">(hidden)</span>}</p>
                        <p className="text-sm text-muted-foreground">{s.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" aria-label="Edit service" onClick={() => setEditingService(s)}><Pencil /></Button>
                        <Button size="icon" variant="ghost" aria-label="Delete service" disabled={busy} onClick={() => deleteService(s.id)}><Trash2 /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {tab === "gallery" && (
              <>
                <section className="mt-8">
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gold/50 bg-card text-center transition-colors hover:border-gold">
                    <ImagePlus className="h-7 w-7 text-gold" />
                    <span className="mt-3 font-semibold">Add gallery photos</span>
                    <span className="mt-1 text-sm text-muted-foreground">JPG, PNG or WebP · up to 10 MB each</span>
                    <Input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhotos} disabled={busy} />
                  </label>
                </section>
                <section className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {photos.map((photo, index) => (
                    <article key={photo.id} className="overflow-hidden rounded-lg border border-border bg-card">
                      <img src={photo.url} alt={photo.altText} className="aspect-[4/3] w-full object-cover" />
                      <div className="flex items-center justify-between gap-3 p-3">
                        <p className="truncate text-sm text-muted-foreground">{photo.altText}</p>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" aria-label="Move photo up" disabled={busy || index === 0} onClick={() => movePhoto(index, -1)}><ArrowUp /></Button>
                          <Button size="icon" variant="ghost" aria-label="Move photo down" disabled={busy || index === photos.length - 1} onClick={() => movePhoto(index, 1)}><ArrowDown /></Button>
                          <Button size="icon" variant="ghost" aria-label="Delete photo" disabled={busy} onClick={() => removePhoto(photo)}><Trash2 /></Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </section>
              </>
            )}

            {tab === "orders" && (
              <section className="mt-8 space-y-3">
                {orders.length === 0 && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No orders yet.</p>}
                {orders.map((o) => (
                  <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                    <div>
                      <p className="font-semibold">{o.customers?.full_name ?? "Customer"} — {o.service}</p>
                      <p className="text-sm text-muted-foreground">₹{Number(o.amount).toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex gap-2">
                      <select value={o.payment_status} disabled={busy} onChange={(e) => setOrder(o.id, "paymentStatus", e.target.value)} className={selectClass}>
                        {paymentStatuses.map((s) => <option key={s} value={s}>Payment: {s}</option>)}
                      </select>
                      <select value={o.order_status} disabled={busy} onChange={(e) => setOrder(o.id, "orderStatus", e.target.value)} className={selectClass}>
                        {orderStatuses.map((s) => <option key={s} value={s}>Order: {s.replace("_", " ")}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </section>
            )}

            {tab === "messages" && (
              <section className="mt-8 space-y-3">
                {messages.length === 0 && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No messages yet.</p>}
                {messages.map((m) => (
                  <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-sm text-muted-foreground">{[m.phone, m.email].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 text-sm">{m.message}</p>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
