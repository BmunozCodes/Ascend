"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../providers";

function MountainMark({
  size = 24,
  color = "currentColor",
}: {
  size?: number;
  color?: string;
}) {
  const scale = size / 52;
  return (
    <svg
      width={size}
      height={size * (32 / 52)}
      viewBox="0 0 52 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 2 30 L 16 8 L 26 22 L 36 4 L 50 30 Z"
        fill={color}
        stroke={color}
        strokeWidth={1 / scale}
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { supabase, user } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmationSent, setConfirmationSent] = useState(false);

  if (user) {
    router.replace("/");
    return null;
  }

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setConfirmationSent(true);
      setLoading(false);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      router.replace("/");
    }
  }

  if (confirmationSent) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 flex items-center justify-center gap-2.5">
            <MountainMark size={28} color="var(--color-accent)" />
            <span
              className="font-serif text-[28px] font-medium leading-none tracking-tight text-[--text]"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Ascend
            </span>
          </div>
          <h2 className="mb-2 text-lg font-medium text-[--text]">
            Check your email
          </h2>
          <p className="text-sm text-[--text-muted]">
            We sent a confirmation link to{" "}
            <span className="font-medium text-[--text]">{email}</span>. Click it
            to activate your account, then come back and sign in.
          </p>
          <button
            onClick={() => {
              setConfirmationSent(false);
              setMode("signin");
              setPassword("");
            }}
            className="mt-6 text-sm font-medium text-[--color-accent] hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex items-center justify-center gap-2.5">
          <MountainMark size={28} color="var(--color-accent)" />
          <span
            className="font-serif text-[28px] font-medium leading-none tracking-tight text-[--text]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Ascend
          </span>
        </div>

        <h2
          className="mb-6 text-center font-serif text-lg font-medium text-[--text]"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h2>

        <div className="mb-3">
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-[--text-muted]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            autoComplete="email"
            className="w-full rounded-lg border border-[--border] bg-[--bg-elevated] px-3 py-2.5 text-[15px] text-[--text] placeholder-[--text-subtle]"
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="mb-1 block text-xs font-medium uppercase tracking-wide text-[--text-muted]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full rounded-lg border border-[--border] bg-[--bg-elevated] px-3 py-2.5 text-[15px] text-[--text] placeholder-[--text-subtle]"
            placeholder={mode === "signup" ? "At least 6 characters" : ""}
          />
        </div>

        {error && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full rounded-lg bg-[--color-accent] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Hold on..."
            : mode === "signin"
              ? "Sign in"
              : "Create account"}
        </button>

        <p className="mt-5 text-center text-sm text-[--text-muted]">
          {mode === "signin" ? (
            <>
              No account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="font-medium text-[--color-accent] hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="font-medium text-[--color-accent] hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}