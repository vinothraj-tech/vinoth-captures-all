import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Camera, Film, Heart, Baby, Sparkles, Users, Phone, Mail, MapPin } from "lucide-react";

import hero from "@/assets/hero.jpg";
import wedding from "@/assets/wedding.jpg";
import prewedding from "@/assets/prewedding.jpg";
import candid from "@/assets/candid.jpg";
import logo from "@/assets/vinoth-logo.png";
import g1 from "@/assets/g1.jpg";
import g2 from "@/assets/g2.jpg";
import g3 from "@/assets/g3.jpg";
import g4 from "@/assets/g4.jpg";
import g5 from "@/assets/g5.jpg";
import g6 from "@/assets/g6.jpg";
import g7 from "@/assets/g7.jpg";
import g8 from "@/assets/g8.jpg";
import g9 from "@/assets/g9.jpg";
import g10 from "@/assets/g10.jpg";
import g11 from "@/assets/g11.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vinoth Studio — Wedding & Portrait Photography, Coimbatore" },
      {
        name: "description",
        content:
          "Vinothraj photographs weddings, pre-wedding portraits and films in Coimbatore and across Tamil Nadu. Quiet candids, careful edits, delivered on time.",
      },
      { property: "og:title", content: "Vinoth Studio — Wedding & Portrait Photography, Coimbatore" },
      {
        property: "og:description",
        content:
          "Weddings, portraits and cinematic films shot quietly and edited carefully. Based in Karamadai, Coimbatore.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const services = [
  { icon: Heart, title: "Wedding Stories", desc: "Full-day coverage of muhurtham, rituals and reception.", price: "From Rs. 85,000" },
  { icon: Camera, title: "Pre-Wedding Portraits", desc: "Location shoots styled around the two of you.", price: "From Rs. 28,000" },
  { icon: Users, title: "Candid & Rituals", desc: "Unposed documentary frames of family and tradition.", price: "From Rs. 35,000" },
  { icon: Sparkles, title: "Fashion & Editorial", desc: "Studio lighting for brands, models and lookbooks.", price: "From Rs. 22,000" },
  { icon: Baby, title: "Maternity & Baby", desc: "Soft natural-light sessions in studio or at home.", price: "From Rs. 18,000" },
  { icon: Film, title: "Cinematic Films", desc: "Teaser, highlight film and full-length edits in 4K.", price: "From Rs. 60,000" },
];

const gallery = [
  { src: g1, cat: "Wedding Stories", title: "Aarthi & Karthik", sub: "Perur Temple, Coimbatore", tags: ["wedding", "traditional"] },
  { src: g2, cat: "Pre-Wedding Portraits", title: "Meera & Surya", sub: "Karamadai, Coimbatore", tags: ["prewedding", "outdoor"] },
  { src: g3, cat: "Candid & Rituals", title: "The Haldi Morning", sub: "Family home, Mettupalayam", tags: ["candid", "traditional"] },
  { src: g4, cat: "Wedding Stories", title: "Garlands & Vows", sub: "Temple mandapam", tags: ["wedding", "traditional"] },
  { src: g5, cat: "Wedding Stories", title: "The Thali Moment", sub: "Coimbatore", tags: ["wedding", "traditional"] },
  { src: g6, cat: "Candid & Rituals", title: "Blessings on the Tray", sub: "Muhurtham rituals", tags: ["candid", "traditional"] },
  { src: g7, cat: "Bridal Portraits", title: "Before the Ceremony", sub: "Getting ready, Coimbatore", tags: ["bridal", "portrait"] },
  { src: g8, cat: "Bridal Portraits", title: "Monsoon Bride", sub: "Rainy morning, Tamil Nadu", tags: ["bridal", "outdoor"] },
  { src: g9, cat: "Bridal Portraits", title: "Dusk in Red & Gold", sub: "Evening portrait", tags: ["bridal", "portrait"] },
  { src: g10, cat: "Candid & Rituals", title: "The Mirror Smile", sub: "Getting ready", tags: ["candid", "portrait"] },
  { src: g11, cat: "Receptions", title: "Forehead to Forehead", sub: "Reception evening", tags: ["wedding", "portrait"] },
  { src: prewedding, cat: "Love Shoots", title: "Under the Old Tree", sub: "Couple portraits, Tamil Nadu", tags: ["prewedding", "outdoor"] },
  { src: wedding, cat: "Love Shoots", title: "Save the Date — Nihal & Sana", sub: "16th Jan 2025", tags: ["prewedding", "portrait"] },
  { src: candid, cat: "Love Shoots", title: "We Said Yes — Nihal & Sana", sub: "Engagement, 15th Jan 2025", tags: ["candid", "portrait"] },
];

const styleOptions = [
  { value: "", label: "Any style" },
  { value: "wedding", label: "Traditional wedding" },
  { value: "prewedding", label: "Pre-wedding / couple" },
  { value: "candid", label: "Candid & documentary" },
  { value: "bridal", label: "Bridal portraits" },
  { value: "outdoor", label: "Outdoor & natural light" },
  { value: "portrait", label: "Classic portraits" },
];

function Index() {
  const [eventType, setEventType] = useState("");
  const [style, setStyle] = useState("");
  const [searched, setSearched] = useState(false);

  const matches = useMemo(() => {
    if (!style) return gallery.slice(0, 4);
    return gallery.filter((g) => g.tags.includes(style)).slice(0, 4);
  }, [style]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <img src={logo} alt="Vinoth Studio" className="h-10 w-auto" />
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground sm:flex">
            <a href="#work" className="transition-colors hover:text-foreground">Work</a>
            <a href="#services" className="transition-colors hover:text-foreground">Services</a>
            <a href="#contact" className="transition-colors hover:text-foreground">Contact</a>
          </nav>
          <a
            href="#contact"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Book a shoot
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-screen items-end justify-center overflow-hidden">
        <img src={hero} alt="Bride at a temple in Coimbatore" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/30" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-40 text-center animate-fade-up">
          <p className="eyebrow">Coimbatore · Since 2014</p>
          <h1 className="font-display mt-6 text-5xl leading-tight text-balance sm:text-6xl">
            Photographs that still feel like the day itself.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground">
            Weddings, portraits and films shot quietly, edited carefully and delivered on time — by Vinothraj.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#work"
              className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              View the gallery
            </a>
            <a
              href="#contact"
              className="rounded-md border border-border bg-background/40 px-6 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:bg-secondary"
            >
              Check a date
            </a>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <p className="eyebrow">What we shoot</p>
        <h2 className="font-display mt-4 text-4xl sm:text-5xl">Services</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.title}
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="font-display mt-4 text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              <p className="mt-4 text-sm font-semibold text-primary">{s.price}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="work" className="border-t border-border bg-card/40 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="eyebrow">Recent work</p>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl">Selected weddings & stories</h2>
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
            {gallery.map((g) => (
              <figure key={g.title} className="group relative overflow-hidden rounded-xl break-inside-avoid">
                <img
                  src={g.src}
                  alt={g.title}
                  loading="lazy"
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-4 pt-12">
                  <p className="eyebrow !text-[0.6rem]">{g.cat}</p>
                  <p className="font-display mt-1 text-xl">{g.title}</p>
                  <p className="text-xs text-muted-foreground">{g.sub}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Style matcher */}
      <section className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
        <p className="eyebrow text-center">Find your style</p>
        <h2 className="font-display mt-4 text-center text-4xl sm:text-5xl">Tell me about your event</h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Describe your occasion and the look you love — I'll show you work from my portfolio that fits.
        </p>
        <form
          className="mt-10 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearched(true);
          }}
        >
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground"
          >
            <option value="">Your event</option>
            <option>Wedding</option>
            <option>Engagement</option>
            <option>Pre-wedding shoot</option>
            <option>Maternity / baby</option>
            <option>Fashion / editorial</option>
            <option>Other</option>
          </select>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="rounded-md border border-input bg-card px-4 py-3 text-sm text-foreground"
          >
            {styleOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2"
          >
            Show me matching work
          </button>
        </form>
        {searched && (
          <div className="mt-10 grid grid-cols-2 gap-4 animate-fade-up">
            {matches.map((g) => (
              <figure key={g.title} className="overflow-hidden rounded-xl">
                <img src={g.src} alt={g.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                <figcaption className="bg-card p-3">
                  <p className="font-display text-lg">{g.title}</p>
                  <p className="text-xs text-muted-foreground">{g.sub}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-border bg-card/40 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <p className="eyebrow">Book a shoot</p>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl">Let's talk about your day</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Call, message or email — I usually reply the same day. Dates for the wedding season fill up early, so
            check early.
          </p>
          <div className="mt-12 grid gap-6 text-left sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="eyebrow !text-[0.6rem]">Photographer</p>
              <p className="font-display mt-1 text-2xl">Vinothraj</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> 93448 85815
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> vv1791180@gmail.com
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  Karamadai, Kannarapalaiyam, Coimbatore — 606102
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <a
                href="tel:+919344885815"
                className="rounded-md bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Call 93448 85815
              </a>
              <a
                href="https://wa.me/919344885815"
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-border bg-card px-6 py-3 text-center text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Message on WhatsApp
              </a>
              <a
                href="mailto:vv1791180@gmail.com"
                className="rounded-md border border-border bg-card px-6 py-3 text-center text-sm font-semibold transition-colors hover:bg-secondary"
              >
                Email vv1791180@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <img src={logo} alt="Vinoth Studio" className="h-10 w-auto" />
          <p className="text-sm text-muted-foreground">
            Wedding, portrait and film work made in Coimbatore, shot across South India.
          </p>
          <p className="text-xs text-muted-foreground">© 2026 Vinothraj. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
