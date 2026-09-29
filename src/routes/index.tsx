import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Zap, BadgePercent, Clock, ShieldCheck, Wallet, ArrowDownToLine, Send, CheckCircle2,
  ShoppingBag, Globe2, PiggyBank, Landmark, Store, Lock, Fingerprint, EyeOff, Banknote,
  Bitcoin, ArrowUpRight, ArrowDownLeft, ChevronDown, Coins,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Digital Rupee — Official digital money, issued by the central bank" },
      { name: "description", content: "The Digital Rupee is cash in digital form. Pay, send and save instantly — backed by the central bank, free to use, available 24/7." },
      { property: "og:title", content: "Digital Rupee — The future of money is here" },
      { property: "og:description", content: "Instant, secure, central-bank-backed digital money for everyday payments, transfers and savings." },
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
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const nav = [["About", "#about"], ["How it works", "#how"], ["Use cases", "#uses"], ["Security", "#security"], ["FAQ", "#faq"]];

const stats = [
  { icon: Zap, value: "< 2 sec", label: "Payment settlement" },
  { icon: BadgePercent, value: "₹0", label: "Fees for personal payments" },
  { icon: Clock, value: "24/7/365", label: "Always available" },
  { icon: ShieldCheck, value: "100%", label: "Backed by the central bank" },
];

const compare = [
  { icon: Banknote, name: "Cash", points: ["Issued by the central bank", "Physical only", "Can be lost or stolen"] },
  { icon: Coins, name: "Digital Rupee", points: ["Issued by the central bank", "Digital and instant", "Stable value, always ₹1 = ₹1"], featured: true },
  { icon: Bitcoin, name: "Cryptocurrency", points: ["No central issuer", "Digital", "Price swings every day"] },
];

const steps = [
  { icon: Wallet, title: "Get the wallet", desc: "Download the official app or use your bank's app. Sign up in minutes." },
  { icon: ArrowDownToLine, title: "Load funds", desc: "Move money in from your bank account — one to one, no conversion." },
  { icon: Send, title: "Pay or send", desc: "Scan a QR code, tap your phone or send to a contact." },
  { icon: CheckCircle2, title: "Instant settlement", desc: "The money arrives in seconds. Final, safe and recorded." },
];

const uses = [
  { icon: ShoppingBag, title: "Everyday payments", desc: "Groceries, fuel, tea — pay anywhere with a scan or tap, even offline." },
  { icon: Globe2, title: "Cross-border transfers", desc: "Send money to family abroad in seconds, at a fraction of today's cost." },
  { icon: PiggyBank, title: "Savings", desc: "Keep a safe balance that's backed by the central bank itself." },
  { icon: Landmark, title: "Public benefits", desc: "Pensions, subsidies and relief reach you directly, the same day." },
  { icon: Store, title: "Merchants", desc: "Accept payments with zero fees and get paid instantly, not days later." },
];

const security = [
  { icon: Lock, title: "Bank-grade encryption", desc: "Every transaction is protected end to end." },
  { icon: Fingerprint, title: "Biometric sign-in", desc: "Only you can open your wallet." },
  { icon: EyeOff, title: "Privacy by design", desc: "Small payments stay private, just like cash." },
];

const faqs = [
  ["Is the Digital Rupee the same as cryptocurrency?", "No. It's issued and guaranteed by the central bank, so its value never changes — one Digital Rupee is always worth one rupee."],
  ["Do I need a bank account?", "No. You can open a basic wallet with your phone number and ID. Linking a bank account makes loading funds easier."],
  ["Does it cost anything?", "Personal payments and transfers are free. Merchants pay no fees to accept payments."],
  ["What if I lose my phone?", "Your money isn't stored on the phone. Sign in on a new device and your balance is restored."],
  ["Can I pay without internet?", "Yes. Small offline payments work phone to phone and sync once you're back online."],
];

function Index() {
  useReveal();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "border-b border-ink-foreground/10 bg-ink/70 backdrop-blur-xl" : "bg-transparent"}`}>
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a href="#top" className="flex items-center gap-2 text-ink-foreground">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-glow font-display font-bold">₹</span>
            <span className="font-display text-lg font-semibold">Digital Rupee</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm text-ink-muted lg:flex">
            {nav.map(([l, h]) => <a key={h} href={h} className="transition-colors hover:text-ink-foreground">{l}</a>)}
          </nav>
          <a href="#get" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:brightness-110">Get the wallet</a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden bg-ink text-ink-foreground">
        <div className="pointer-events-none absolute -left-32 top-10 h-[480px] w-[480px] rounded-full bg-glow/40 blur-[120px] animate-glow" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-accent/35 blur-[120px] animate-glow" style={{ animationDelay: "-6s" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-5 pb-24 pt-36 sm:px-8 lg:grid-cols-2 lg:pt-44">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-ink-muted">
              <span className="h-2 w-2 rounded-full bg-success" /> Issued by the central bank
            </span>
            <h1 className="font-display mt-6 text-5xl font-bold leading-[1.05] text-balance sm:text-6xl xl:text-7xl">
              Money, made <span className="bg-gradient-to-r from-accent to-glow bg-clip-text text-transparent">instant</span> and official.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink-muted">The Digital Rupee is cash in digital form — safe, free to use and accepted everywhere.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#get" className="rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition hover:brightness-110">Get the wallet</a>
              <a href="#how" className="glass rounded-full px-7 py-3.5 font-semibold transition hover:bg-ink-foreground/15">See how it works</a>
            </div>
          </Reveal>
          <Reveal delay={200} className="relative mx-auto h-[560px] w-full max-w-md">
            <Phone className="absolute left-1/2 top-0 -translate-x-1/2" />
            <div className="glass absolute left-0 top-24 rounded-2xl p-4 animate-float">
              <p className="text-xs text-ink-muted">Received</p>
              <p className="font-display text-lg font-semibold text-success">+ ₹2,500</p>
            </div>
            <div className="glass absolute bottom-24 right-0 flex items-center gap-3 rounded-2xl p-4 animate-float" style={{ animationDelay: "-3s" }}>
              <Zap className="h-5 w-5 text-accent" />
              <div><p className="text-sm font-semibold">Settled</p><p className="text-xs text-ink-muted">in 1.4 seconds</p></div>
            </div>
            <div className="absolute -right-2 top-6 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-accent to-glow font-display text-2xl font-bold shadow-2xl animate-float" style={{ animationDelay: "-1.5s" }}>₹</div>
          </Reveal>
        </div>
        {/* Stats */}
        <div className="relative mx-auto max-w-7xl px-5 pb-20 sm:px-8">
          <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-8 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 100} className="flex items-center gap-4">
                <s.icon className="h-8 w-8 shrink-0 text-accent" />
                <div><p className="font-display text-2xl font-bold">{s.value}</p><p className="text-sm text-ink-muted">{s.label}</p></div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* What is */}
      <section id="about" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">What is a CBDC?</p>
          <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">The safety of cash. The speed of digital.</h2>
          <p className="mt-5 text-lg text-muted-foreground">A Central Bank Digital Currency is official money issued directly by the central bank — just like the notes in your wallet, only digital.</p>
        </Reveal>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {compare.map((c, i) => (
            <Reveal key={c.name} delay={i * 120}>
              <div className={`lift h-full rounded-3xl border p-8 ${c.featured ? "border-primary bg-ink text-ink-foreground" : "bg-card"}`}>
                <c.icon className={`h-9 w-9 ${c.featured ? "text-accent" : "text-muted-foreground"}`} />
                <h3 className="font-display mt-5 text-2xl font-semibold">{c.name}</h3>
                <ul className="mt-5 space-y-3 text-sm">
                  {c.points.map((p) => (
                    <li key={p} className="flex gap-2"><CheckCircle2 className={`h-4 w-4 shrink-0 ${c.featured ? "text-success" : "text-muted-foreground"}`} /><span className={c.featured ? "" : "text-muted-foreground"}>{p}</span></li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* How */}
      <section id="how" className="bg-secondary py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="eyebrow">How it works</p>
            <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Up and running in four steps</h2>
          </Reveal>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="lift h-full rounded-3xl bg-card p-7 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10"><s.icon className="h-6 w-6 text-primary" /></div>
                    <span className="font-display text-4xl font-bold text-border">0{i + 1}</span>
                  </div>
                  <h3 className="font-display mt-6 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Uses */}
      <section id="uses" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Use cases</p>
          <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Built for every part of daily life</h2>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {uses.map((u, i) => (
            <Reveal key={u.title} delay={i * 100} className={i === 0 ? "lg:row-span-2" : ""}>
              <div className={`lift h-full rounded-3xl border p-8 ${i === 0 ? "bg-gradient-to-br from-primary to-glow text-primary-foreground" : "bg-card"}`}>
                <u.icon className={`h-9 w-9 ${i === 0 ? "" : "text-primary"}`} />
                <h3 className={`font-display mt-6 font-semibold ${i === 0 ? "text-3xl" : "text-xl"}`}>{u.title}</h3>
                <p className={`mt-3 ${i === 0 ? "text-lg opacity-90" : "text-muted-foreground"}`}>{u.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Security */}
      <section id="security" className="relative overflow-hidden bg-ink py-28 text-ink-foreground">
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-glow/30 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow !text-accent">Security & privacy</p>
            <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Protected like a national reserve.</h2>
            <p className="mt-5 text-lg text-ink-muted">Your Digital Rupee is guaranteed by the central bank and protected by the same standards that secure the country's financial system.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {["ISO 27001", "PCI DSS", "Data Protection Act", "RBI regulated"].map((b) => (
                <span key={b} className="glass rounded-full px-4 py-2 text-xs font-semibold">{b}</span>
              ))}
            </div>
          </Reveal>
          <div className="grid gap-5">
            {security.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="glass lift flex gap-5 rounded-3xl p-6">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent/20"><s.icon className="h-6 w-6 text-accent" /></div>
                  <div><h3 className="font-display text-lg font-semibold">{s.title}</h3><p className="text-ink-muted">{s.desc}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* App preview */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">The wallet</p>
          <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Everything you need, nothing you don't</h2>
        </Reveal>
        <div className="mt-16 flex flex-wrap justify-center gap-8">
          <Reveal><Phone screen="balance" /></Reveal>
          <Reveal delay={120}><Phone screen="send" /></Reveal>
          <Reveal delay={240}><Phone screen="history" /></Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-secondary py-28">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal className="text-center">
            <p className="eyebrow">FAQ</p>
            <h2 className="font-display mt-4 text-4xl font-bold sm:text-5xl">Questions, answered</h2>
          </Reveal>
          <div className="mt-12 space-y-3">
            {faqs.map(([q, a]) => (
              <details key={q} className="group rounded-2xl bg-card p-6 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                  {q}<ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="get" className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink px-8 py-16 text-center text-ink-foreground sm:px-16">
            <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-[600px] -translate-x-1/2 rounded-full bg-glow/40 blur-[100px] animate-glow" />
            <h2 className="font-display relative text-4xl font-bold text-balance sm:text-5xl">Your money, ready for tomorrow.</h2>
            <p className="relative mx-auto mt-4 max-w-lg text-lg text-ink-muted">Download the official wallet and make your first payment in under five minutes.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a href="#" className="rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground hover:brightness-110">Download for iOS</a>
              <a href="#" className="glass rounded-full px-7 py-3.5 font-semibold hover:bg-ink-foreground/15">Download for Android</a>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-semibold">Digital Rupee</p>
            <p className="mt-2 text-sm text-muted-foreground">Official digital currency issued by the central bank.</p>
          </div>
          {[["Product", ["Wallet", "Merchants", "Developers"]], ["Learn", ["How it works", "Security", "FAQ"]], ["Legal", ["Terms of use", "Privacy policy", "Accessibility"]]].map(([h, ls]) => (
            <div key={h as string}>
              <p className="text-sm font-semibold">{h}</p>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{(ls as string[]).map((l) => <li key={l}><a href="#" className="hover:text-foreground">{l}</a></li>)}</ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-7xl px-5 text-xs text-muted-foreground sm:px-8">© 2026 Digital Rupee. Issued under the authority of the central bank. Illustrative website.</p>
      </footer>
    </div>
  );
}

function Phone({ className = "", screen = "balance" }: { className?: string; screen?: "balance" | "send" | "history" }) {
  const tx = [["Chai Point", "- ₹40", false], ["Salary", "+ ₹42,000", true], ["Electricity bill", "- ₹1,280", false], ["From Priya", "+ ₹500", true]] as const;
  return (
    <div className={`w-[270px] rounded-[2.5rem] border-[10px] border-ink bg-ink shadow-2xl ${className}`}>
      <div className="h-[520px] overflow-hidden rounded-[1.8rem] bg-gradient-to-b from-ink to-primary/60 p-5 text-ink-foreground">
        <div className="mx-auto h-5 w-24 rounded-full bg-ink" />
        {screen === "balance" && (
          <>
            <p className="mt-6 text-xs text-ink-muted">Total balance</p>
            <p className="font-display text-3xl font-bold">₹48,230.50</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="glass flex flex-col items-center rounded-2xl py-3 text-xs"><ArrowUpRight className="mb-1 h-5 w-5 text-accent" />Send</div>
              <div className="glass flex flex-col items-center rounded-2xl py-3 text-xs"><ArrowDownLeft className="mb-1 h-5 w-5 text-success" />Receive</div>
            </div>
            <div className="mt-5 rounded-2xl bg-gradient-to-br from-accent to-glow p-4">
              <p className="text-xs opacity-80">Digital Rupee card</p>
              <p className="mt-6 font-display tracking-widest">•••• 4821</p>
            </div>
            <TxList tx={tx.slice(0, 2)} />
          </>
        )}
        {screen === "send" && (
          <>
            <p className="mt-6 text-sm font-semibold">Send to Priya</p>
            <p className="font-display mt-10 text-center text-5xl font-bold">₹500</p>
            <p className="mt-2 text-center text-xs text-ink-muted">Free · arrives instantly</p>
            <div className="mt-10 grid grid-cols-3 gap-3 text-center font-display text-lg">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => <div key={n} className="glass rounded-xl py-2">{n}</div>)}
            </div>
            <div className="mt-5 rounded-full bg-primary py-3 text-center text-sm font-semibold text-primary-foreground">Send now</div>
          </>
        )}
        {screen === "history" && (
          <>
            <p className="mt-6 text-sm font-semibold">Activity</p>
            <TxList tx={tx} />
            <TxList tx={tx.slice(0, 3)} />
          </>
        )}
      </div>
    </div>
  );
}

function TxList({ tx }: { tx: readonly (readonly [string, string, boolean])[] }) {
  return (
    <div className="mt-4 space-y-2">
      {tx.map(([n, a, pos]) => (
        <div key={n} className="glass flex items-center justify-between rounded-xl px-3 py-2.5 text-xs">
          <span>{n}</span><span className={pos ? "font-semibold text-success" : "font-semibold"}>{a}</span>
        </div>
      ))}
    </div>
  );
}
