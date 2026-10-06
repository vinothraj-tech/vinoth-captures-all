import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function requireAdmin(supabase: any, userId: string) {
  const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!isAdmin) throw new Error("Forbidden: admin access required");
}

export const listActiveServices = createServerFn({ method: "GET" }).handler(async (): Promise<Service[]> => {
  const { data, error } = await publicClient()
    .from("services")
    .select("id, service_name, description, price, image")
    .eq("active", true)
    .order("price", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.service_name,
    description: s.description,
    price: Number(s.price),
    imageUrl: s.image,
  }));
});

export const submitContactMessage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        phone: z.string().trim().max(30).optional(),
        email: z.string().trim().email().max(160).optional().or(z.literal("")),
        message: z.string().trim().min(1).max(2000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("contact_messages").insert({
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      message: data.message,
    });
    if (error) throw error;
    return { ok: true };
  });

// ---------- Customer ----------

async function ensureCustomer(supabase: any, userId: string, details?: { fullName?: string | undefined; phone?: string | undefined; email?: string | undefined; address?: string | undefined }) {
  const { data: existing } = await supabase.from("customers").select("id").eq("user_id", userId).maybeSingle();
  if (existing) {
    if (details) {
      await supabase
        .from("customers")
        .update({
          full_name: details.fullName || undefined,
          phone: details.phone || undefined,
          email: details.email || undefined,
          address: details.address || undefined,
        })
        .eq("id", existing.id);
    }
    return existing.id as string;
  }
  const { data, error } = await supabase
    .from("customers")
    .insert({
      user_id: userId,
      full_name: details?.fullName || "Customer",
      phone: details?.phone || null,
      email: details?.email || null,
      address: details?.address || null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export const createBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        service: z.string().trim().min(1).max(160),
        bookingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        bookingTime: z.string().regex(/^\d{2}:\d{2}/),
        notes: z.string().trim().max(2000).optional(),
        referencePhoto: z.string().max(500).optional(),
        fullName: z.string().trim().min(1).max(120),
        phone: z.string().trim().min(5).max(30),
        email: z.string().trim().email().max(160).optional().or(z.literal("")),
        address: z.string().trim().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const customerId = await ensureCustomer(context.supabase, context.userId, {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      address: data.address,
    });
    const { error } = await context.supabase.from("bookings").insert({
      customer_id: customerId,
      service: data.service,
      booking_date: data.bookingDate,
      booking_time: data.bookingTime,
      notes: data.notes || null,
      reference_photo: data.referencePhoto || null,
    });
    if (error) {
      if (error.message.includes("bookings_no_double_booking")) {
        throw new Error("That date and time is already booked. Please choose another slot.");
      }
      throw error;
    }
    return { ok: true };
  });

export const getMyBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: customer } = await context.supabase.from("customers").select("id").eq("user_id", context.userId).maybeSingle();
    if (!customer) return [];
    const { data, error } = await context.supabase
      .from("bookings")
      .select("id, service, booking_date, booking_time, status, notes, created_at")
      .eq("customer_id", customer.id)
      .order("booking_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getMyOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: customer } = await context.supabase.from("customers").select("id").eq("user_id", context.userId).maybeSingle();
    if (!customer) return [];
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, service, amount, payment_status, order_status, created_at")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const cancelMyBooking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: customer } = await context.supabase.from("customers").select("id").eq("user_id", context.userId).maybeSingle();
    if (!customer) throw new Error("No customer record");
    const { error } = await context.supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", data.id)
      .eq("customer_id", customer.id)
      .eq("status", "pending");
    if (error) throw error;
    return { ok: true };
  });

// ---------- Admin ----------

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const [customers, bookings, pending, completed, orders, revenue] = await Promise.all([
      context.supabase.from("customers").select("id", { count: "exact", head: true }),
      context.supabase.from("bookings").select("id", { count: "exact", head: true }),
      context.supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
      context.supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "completed"),
      context.supabase.from("orders").select("id", { count: "exact", head: true }),
      context.supabase.from("orders").select("amount").eq("payment_status", "paid"),
    ]);
    const totalRevenue = (revenue.data ?? []).reduce((sum: number, o: any) => sum + Number(o.amount), 0);
    return {
      customers: customers.count ?? 0,
      bookings: bookings.count ?? 0,
      pendingBookings: pending.count ?? 0,
      completedBookings: completed.count ?? 0,
      orders: orders.count ?? 0,
      revenue: totalRevenue,
    };
  });

export const adminListBookings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ search: z.string().trim().max(120).optional(), status: z.string().optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    let query = context.supabase
      .from("bookings")
      .select("id, service, booking_date, booking_time, status, notes, created_at, customers(full_name, phone, email)")
      .order("booking_date", { ascending: false })
      .limit(200);
    if (data.status) query = query.eq("status", data.status);
    const { data: rows, error } = await query;
    if (error) throw error;
    const search = data.search?.toLowerCase();
    if (!search) return rows ?? [];
    return (rows ?? []).filter((b: any) =>
      [b.service, b.customers?.full_name, b.customers?.email, b.customers?.phone].some((v) => String(v ?? "").toLowerCase().includes(search)),
    );
  });

export const adminUpdateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "confirmed", "rejected", "completed", "cancelled"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("bookings").update({ status: data.status }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminListCustomers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ search: z.string().trim().max(120).optional() }).parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data: rows, error } = await context.supabase
      .from("customers")
      .select("id, full_name, phone, email, address, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const search = data.search?.toLowerCase();
    if (!search) return rows ?? [];
    return (rows ?? []).filter((c: any) =>
      [c.full_name, c.email, c.phone].some((v) => String(v ?? "").toLowerCase().includes(search)),
    );
  });

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase.from("services").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return data ?? [];
  });

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        serviceName: z.string().trim().min(1).max(160),
        description: z.string().trim().max(2000).default(""),
        price: z.number().min(0),
        active: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const payload = { service_name: data.serviceName, description: data.description, price: data.price, active: data.active };
    const { error } = data.id
      ? await context.supabase.from("services").update(payload).eq("id", data.id)
      : await context.supabase.from("services").insert(payload);
    if (error) throw error;
    return { ok: true };
  });

export const adminDeleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { error } = await context.supabase.from("services").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select("id, service, amount, payment_status, order_status, created_at, customers(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });

export const adminUpdateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
        orderStatus: z.enum(["new", "in_progress", "delivered", "cancelled"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.supabase, context.userId);
    const payload: { payment_status?: string; order_status?: string } = {};
    if (data.paymentStatus) payload["payment_status"] = data.paymentStatus;
    if (data.orderStatus) payload["order_status"] = data.orderStatus;
    const { error } = await context.supabase.from("orders").update(payload).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("contact_messages")
      .select("id, name, phone, email, message, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data ?? [];
  });
