import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Camera, LockKeyhole } from "lucide-react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | Vinoth Studio" },
      { name: "description", content: "Secure gallery administration for Vinoth Studio." },
      { property: "og:title", content: "Admin Sign In | Vinoth Studio" },
      { property: "og:description", content: "Secure gallery administration for Vinoth Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("");
    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setStatus(error ? error.message : "Password reset instructions have been sent.");
      setBusy(false);
      return;
    }
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { display_name: displayName } },
      });
      if (error) setStatus(error.message);
      else if (!data.session) setStatus("Check your email to confirm your account, then sign in.");
      else await navigate({ to: "/admin" });
      setBusy(false);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setStatus(error.message);
    else await navigate({ to: "/admin" });
    setBusy(false);
  }

  async function signInWithGoogle() {
    setBusy(true);
    setStatus("");
    sessionStorage.setItem("vinoth-auth-next", "/admin");
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) setStatus(result.error.message);
    else if (!result.redirected) await navigate({ to: "/admin" });
    setBusy(false);
  }

  return (
    <main className="auth-shell min-h-screen bg-background text-foreground">
      <Link to="/" className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to the studio
      </Link>
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-24">
        <div className="mb-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card"><Camera className="h-5 w-5 text-gold" /></span>
          <p className="eyebrow mt-6">Vinoth Studio</p>
          <h1 className="font-display mt-3 text-4xl font-semibold">{mode === "signup" ? "Create admin account" : mode === "forgot" ? "Reset password" : "Gallery admin"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">The first confirmed account becomes the gallery administrator.</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-2xl">
          {mode === "signup" && <Input aria-label="Display name" placeholder="Display name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} required />}
          <Input aria-label="Email address" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required />
          {mode !== "forgot" && <Input aria-label="Password" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />}
          {status && <p role="status" className="text-sm text-gold-soft">{status}</p>}
          <Button type="submit" className="h-11 w-full" disabled={busy}>
            <LockKeyhole /> {busy ? "Please wait…" : mode === "signup" ? "Create account" : mode === "forgot" ? "Send reset link" : "Sign in"}
          </Button>
          {mode !== "forgot" && (
            <Button type="button" variant="outline" className="h-11 w-full" onClick={signInWithGoogle} disabled={busy}>Continue with Google</Button>
          )}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {mode !== "signin" && <button type="button" className="hover:text-foreground" onClick={() => setMode("signin")}>Sign in</button>}
            {mode !== "signup" && <button type="button" className="hover:text-foreground" onClick={() => setMode("signup")}>Create account</button>}
            {mode !== "forgot" && <button type="button" className="hover:text-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>}
          </div>
        </form>
      </section>
    </main>
  );
}