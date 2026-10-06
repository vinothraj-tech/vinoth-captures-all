import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Package } from "lucide-react";
import { cancelMyBooking, getMyBookings, getMyOrders } from "@/lib/studio.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "My Account | Vinoth Studio" },
      { name: "description", content: "Track your Vinoth Studio bookings and orders." },
    ],
  }),
  component: AccountPage,
});

type Booking = { id: string; service: string; booking_date: string; booking_time: string; status: string; created_at: string };
type Order = { id: string; service: string; amount: number; payment_status: string; order_status: string; created_at: string };

const statusColor: Record<string, string> = {
  pending: "text-yellow-300",
  confirmed: "text-emerald-300",
  rejected: "text-red-300",
  completed: "text-emerald-300",
  cancelled: "text-muted-foreground",
  paid: "text-emerald-300",
  failed: "text-red-300",
  refunded: "text-muted-foreground",
  new: "text-yellow-300",
  in_progress: "text-yellow-300",
  delivered: "text-emerald-300",
};

function AccountPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const [b, o] = await Promise.all([getMyBookings(), getMyOrders()]);
      setBookings(b as Booking[]);
      setOrders(o as Order[]);
    } catch {
      setStatus("Could not load your account. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function cancel(id: string) {
    try {
      await cancelMyBooking({ data: { id } });
      setStatus("Booking cancelled.");
      await load();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Could not cancel this booking.");
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to the studio
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">My account</p>
            <h1 className="font-display mt-3 text-4xl font-semibold">Your bookings & orders</h1>
          </div>
          <Link to="/book" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110">New booking</Link>
        </div>
        {status && <p role="status" className="mt-4 text-sm text-gold-soft">{status}</p>}

        <section className="mt-10">
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold"><CalendarDays className="h-5 w-5 text-gold" /> Bookings</h2>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : bookings.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No bookings yet — book your first shoot above.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {bookings.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                  <div>
                    <p className="font-semibold">{b.service}</p>
                    <p className="text-sm text-muted-foreground">{b.booking_date} at {String(b.booking_time).slice(0, 5)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold capitalize ${statusColor[b.status] ?? ""}`}>{b.status}</span>
                    {b.status === "pending" && (
                      <Button variant="outline" size="sm" onClick={() => cancel(b.id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-display flex items-center gap-2 text-2xl font-semibold"><Package className="h-5 w-5 text-gold" /> Orders</h2>
          {loading ? (
            <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
                  <div>
                    <p className="font-semibold">{o.service}</p>
                    <p className="text-sm text-muted-foreground">₹{Number(o.amount).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className={`capitalize ${statusColor[o.payment_status] ?? ""}`}>Payment: {o.payment_status}</p>
                    <p className={`capitalize ${statusColor[o.order_status] ?? ""}`}>Order: {o.order_status.replace("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
