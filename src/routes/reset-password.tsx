import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [
    { title: "Reset Password | Vinoth Studio" },
    { name: "description", content: "Choose a new Vinoth Studio admin password." },
    { property: "og:title", content: "Reset Password | Vinoth Studio" },
    { property: "og:description", content: "Choose a new Vinoth Studio admin password." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("Checking your reset link…");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const recovery = window.location.hash.includes("type=recovery") || new URLSearchParams(window.location.search).get("type") === "recovery";
    supabase.auth.getSession().then(({ data }) => {
      setReady(recovery || Boolean(data.session));
      setStatus(recovery || data.session ? "" : "This reset link is no longer valid.");
    });
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    setStatus(error ? error.message : "Password updated. You can now sign in.");
  }
  return <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground"><section className="w-full max-w-md rounded-lg border border-border bg-card p-7"><p className="eyebrow">Vinoth Studio</p><h1 className="font-display mt-3 text-4xl font-semibold">Choose a new password</h1>{ready && <form onSubmit={submit} className="mt-7 space-y-4"><Input type="password" aria-label="New password" placeholder="New password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /><Button className="w-full" type="submit">Update password</Button></form>}{status && <p role="status" className="mt-4 text-sm text-muted-foreground">{status}</p>}<Link to="/auth" className="mt-6 inline-block text-sm text-gold hover:underline">Return to sign in</Link></section></main>;
}