# Roadmap

- [ ] Fix `__root.tsx` errorComponent type error after TanStack package update (build currently failing)
- [ ] Verify admin login link on home page renders and routes to /auth
- [ ] Build full studio backend from uploaded brief:
  - [ ] Tables: customers, bookings, services, gallery, orders (RLS + grants)
  - [ ] Storage buckets: customer-uploads, service-images (gallery exists)
  - [ ] Customer features: register/login, view services/gallery, booking request with date/time, reference photo upload, booking/order status view
  - [ ] Booking workflow: pending → confirmed/rejected/completed/cancelled; prevent double booking same date+time
  - [ ] Admin dashboard: customers, bookings (accept/reject), services CRUD, gallery CRUD, orders, payment/order status, search/filter, stats (customers, bookings, pending, completed, orders, revenue)
