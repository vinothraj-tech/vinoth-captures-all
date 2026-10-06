import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, CalendarCheck, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createBooking, listActiveServices } from "@/lib/studio.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/book")({
  head: () => ({
    meta: [
      { title: "Book a Shoot | Vinoth Studio" },
      { name: "description", content: "Request a photography booking with Vinoth Studio." },
    ],
  }),
  component: BookPage,
});

function BookPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<{ id: string; name: string; price: number }[]>([]);
  const [service, setService] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listActiveServices().then((rows) => {
      setServices(rows);
      if (rows[0]) setService(rows[0].name);
    }).catch(() => setStatus("Could not load services. Please refresh."));
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      let referencePhoto: string | undefined;
      if (photo) {
        if (photo.size > 10 * 1024 * 1024) throw new Error("Reference photo must be under 10 MB.");
        if (!photo.type.startsWith("image/")) throw new Error("Reference photo must be an image file.");
        const { data: userData } = await supabase.auth.getUser();
        const path = `${userData.user!.id}/${crypto.randomUUID()}-${photo.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error: upError } = await supabase.storage.from("customer-uploads").upload(path, photo);
        if (upError) throw upError;
        referencePhoto = path;
      }
      await createBooking({
        data: { service, bookingDate: date, bookingTime: time, notes: notes || undefined, referencePhoto, fullName, phone, email: email || undefined, address: address || undefined },
      });
      setStatus("Booking request sent! We'll review it and confirm shortly. Track it under My Account.");
      setTimeout(() => navigate({ to: "/account" }), 1500);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to the studio
        </Link>
        <div className="mt-8">
          <p className="eyebrow">Book a shoot</p>
          <h1 className="font-display mt-3 text-4xl font-semibold">Request your date</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pick a service, date and time — we'll confirm within 24 hours.</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Service</span>
            <select value={service} onChange={(e) => setService(e.target.value)} required
              className="border-input bg-background h-11 w-full rounded-md border px-3 text-sm outline-none focus-visible:border-ring">
              {services.map((s) => <option key={s.id} value={s.name}>{s.name} — ₹{s.price.toLocaleString("en-IN")}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Date</span>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().slice(0, 10)} required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Time</span>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Full name</span>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted-foreground">Phone</span>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Email (optional)</span>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Address (optional)</span>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Notes (optional)</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:border-ring" />
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition hover:border-gold">
            <Upload className="h-4 w-4 text-gold" />
            {photo ? photo.name : "Upload a reference photo (optional, max 10 MB)"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
          </label>
          {status && <p role="status" className="text-sm text-gold-soft">{status}</p>}
          <Button type="submit" className="h-11 w-full" disabled={busy || !services.length}>
            <CalendarCheck /> {busy ? "Sending…" : "Submit booking request"}
          </Button>
        </form>
      </div>
    </main>
  );
}
