import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Camera, Heart, Baby, Users, Sparkles, Phone, Mail, MessageCircle,
  MapPin, Star, ChevronDown, Aperture,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import logo from "@/assets/vinoth-logo.png";
import wedding from "@/assets/wedding.jpg";
import prewedding from "@/assets/prewedding.jpg";
import candid from "@/assets/candid.jpg";
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
import indianWeddingAsset from "@/assets/indian-wedding-couple.jpg.asset.json";
import maternityAsset from "@/assets/maternity-couple.jpg.asset.json";
import studioWeddingAsset from "@/assets/studio-wedding-couple.jpg.asset.json";
import { getManagedGalleryPhotos, type ManagedGalleryPhoto } from "@/lib/gallery.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vinoth Studio — Wedding & Portrait Photography, Coimbatore" },
      { name: "description", content: "Vinoth Studio captures weddings, pre-weddings and portraits in Coimbatore. Candid, cinematic photography that turns moments into memories." },
      { property: "og:title", content: "Vinoth Studio — Capturing Memories" },
      { property: "og:description", content: "Wedding, pre-wedding and portrait photography in Coimbatore. Candid, cinematic, timeless." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return <div className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))),
      { threshold: 0.12 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const nav = [["Services", "#services"], ["Gallery", "#gallery"], ["Style Matcher", "#matcher"], ["Contact", "#contact"]];

const services = [
  { icon: Heart, img: wedding, name: "Wedding Photography", price: "₹45,000 onwards", desc: "Full-day candid and traditional coverage of your big day — rituals, emotions and everything in between." },
  { icon: Sparkles, img: prewedding, name: "Pre-Wedding Shoots", price: "₹15,000 onwards", desc: "Cinematic couple shoots at locations you love, with creative concepts and styling guidance." },
  { icon: Camera, img: candid, name: "Candid & Portraits", price: "₹8,000 onwards", desc: "Natural, unposed portraits — family, maternity, baby and individual sessions." },
];

const gallery = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10, g11, indianWeddingAsset.url, maternityAsset.url, studioWeddingAsset.url];

const styles = [
  { icon: Heart, name: "Romantic & Candid", desc: "Soft light, real emotions, unscripted moments." },
  { icon: Aperture, name: "Cinematic & Dramatic", desc: "Bold compositions, film-like tones, grand frames." },
  { icon: Users, name: "Traditional & Classic", desc: "Timeless posed frames honouring every ritual." },
  { icon: Baby, name: "Fun & Playful", desc: "Quirky props, laughter and spontaneous energy." },
];

const faqs = [
  ["How far in advance should we book?", "Wedding dates fill 3–6 months ahead, especially in the November–February season. Reach out as early as you can to block your date."],
  ["Do you travel outside Coimbatore?", "Yes — we shoot across Tamil Nadu and beyond. Travel and stay are billed at actuals for outstation weddings."],
  ["When do we get our photos?", "A preview set within 48 hours, and the full edited gallery within 3–4 weeks, delivered in an online album."],
  ["Can we customise a package?", "Absolutely. Tell us your events, hours and deliverables and we'll put together a quote that fits."],
];

function Index() {
  useReveal();
  const [scrolled, setScrolled] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [managedGallery, setManagedGallery] = useState<ManagedGalleryPhoto[]>([]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    getManagedGalleryPhotos().then(setManagedGallery).catch(() => setManagedGallery([]));
  }, []);
  const allGallery = [...gallery, ...managedGallery.map((photo) => photo.url)];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "border-b border-border bg-ink/80 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-3">
            <img src={logo} alt="Vinoth Studio logo" className="h-10 w-10 rounded-full object-cover" />
            <span className="font-display text-xl font-semibold tracking-wide">Vinoth Studio</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="transition-colors hover:text-foreground">{l}</a>)}
          </nav>
          <a href="#contact" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110">Book a Shoot</a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative flex min-h-[92vh] items-end overflow-hidden">
        <img src={hero} alt="Wedding couple photographed by Vinoth Studio" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="relative mx-auto w-full max-w-7xl px-5 pb-20 pt-40 sm:px-8">
          <Reveal>
            <p className="eyebrow">Wedding · Pre-Wedding · Portraits</p>
            <h1 className="font-display mt-5 max-w-3xl text-5xl font-semibold leading-[1.05] text-balance sm:text-7xl">
              Capturing memories that <span className="text-gold italic">last forever</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">Candid, cinematic photography by Vinoth — based in Coimbatore, shooting love stories across Tamil Nadu.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#gallery" className="rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition hover:brightness-110">View the Gallery</a>
              <a href="#contact" className="glass rounded-full px-7 py-3.5 font-semibold transition hover:bg-ink-foreground/15">Check Your Date</a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* About strip */}
      <section className="border-b border-border bg-ink py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 text-center sm:grid-cols-3 sm:px-8">
          {[["500+", "Weddings captured"], ["10 yrs", "Behind the lens"], ["4.9★", "Average client rating"]].map(([v, l], i) => (
            <Reveal key={l} delay={i * 100}>
              <p className="font-display text-4xl font-semibold text-gold">{v}</p>
              <p className="mt-1 text-sm uppercase tracking-widest text-muted-foreground">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Services & Pricing</p>
          <h2 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Every story, beautifully told</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.name} delay={i * 120}>
              <div className="lift h-full overflow-hidden rounded-3xl border border-border bg-card">
                <div className="relative h-56 overflow-hidden">
                  <img src={s.img} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-4 py-1.5 text-xs font-semibold text-gold backdrop-blur">{s.price}</span>
                </div>
                <div className="p-7">
                  <s.icon className="h-7 w-7 text-gold" />
                  <h3 className="font-display mt-4 text-2xl font-semibold">{s.name}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="bg-secondary py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="eyebrow">The Gallery</p>
            <h2 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Moments we've frozen in time</h2>
          </Reveal>
          <div className="mt-14 columns-2 gap-4 sm:columns-3 [&>*]:mb-4">
            {allGallery.map((g, i) => (
              <Reveal key={g} delay={(i % 3) * 80}>
                <img src={g} alt={`Vinoth Studio gallery photo ${i + 1}`} className="w-full rounded-2xl border border-border object-cover transition-transform duration-500 hover:scale-[1.02]" loading="lazy" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Style matcher */}
      <section id="matcher" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">Style Matcher</p>
          <h2 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Which style fits your story?</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">Tap the style that feels like you — we'll plan your shoot around it.</p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {styles.map((s, i) => (
            <Reveal key={s.name} delay={i * 100}>
              <button
                onClick={() => setPicked(i)}
                className={`lift h-full w-full rounded-3xl border p-7 text-left transition ${picked === i ? "border-gold bg-gold/10" : "border-border bg-card"}`}
              >
                <s.icon className={`h-8 w-8 ${picked === i ? "text-gold" : "text-muted-foreground"}`} />
                <h3 className="font-display mt-5 text-xl font-semibold">{s.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </button>
            </Reveal>
          ))}
        </div>
        {picked !== null && (
          <Reveal className="mt-8 text-center">
            <p className="text-lg">Lovely choice — <span className="font-semibold text-gold">{styles[picked]?.name}</span> it is. <a href="#contact" className="ml-1 underline underline-offset-4 hover:text-gold">Tell us your date →</a></p>
          </Reveal>
        )}
      </section>

      {/* Testimonial */}
      <section className="border-y border-border bg-ink py-24">
        <Reveal className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <div className="flex justify-center gap-1 text-gold">{[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-current" />)}</div>
          <blockquote className="font-display mt-6 text-2xl font-medium leading-relaxed sm:text-3xl">
            "Vinoth didn't just take photos — he captured how the day <span className="italic text-gold">felt</span>. We relive our wedding every time we open the album."
          </blockquote>
          <p className="mt-6 text-sm uppercase tracking-widest text-muted-foreground">— Priya & Karthik, Coimbatore</p>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-28 sm:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="font-display mt-4 text-4xl font-semibold sm:text-5xl">Good to know</h2>
        </Reveal>
        <div className="mt-12 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-border bg-card p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                {q}<ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-5 pb-28 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-ink px-8 py-16 text-center sm:px-16">
            <div className="gold-line absolute inset-x-16 top-0" />
            <p className="eyebrow">Get in touch</p>
            <h2 className="font-display mt-4 text-4xl font-semibold text-balance sm:text-5xl">Let's plan your shoot</h2>
            <p className="mx-auto mt-4 flex max-w-lg items-center justify-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-gold" /> Coimbatore, Tamil Nadu — available across South India</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="tel:+919876543210" className="flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition hover:brightness-110"><Phone className="h-4 w-4" /> Call Now</a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="glass flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition hover:bg-ink-foreground/15"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
              <a href="mailto:hello@vinothstudio.in" className="glass flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold transition hover:bg-ink-foreground/15"><Mail className="h-4 w-4" /> Email</a>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-border py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 text-center sm:px-8">
          <img src={logo} alt="Vinoth Studio logo" className="h-12 w-12 rounded-full object-cover" />
          <p className="font-display text-lg font-semibold">Vinoth Studio</p>
          <p className="text-sm text-muted-foreground">Capturing memories, one frame at a time.</p>
          <p className="text-xs text-muted-foreground">© 2026 Vinoth Studio, Coimbatore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
