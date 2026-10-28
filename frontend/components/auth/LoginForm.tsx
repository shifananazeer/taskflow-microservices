
"use client";

import { useEffect, useState, type FormEvent } from "react";import { loginUser } from "../../services/auth.service";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
const router = useRouter();

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get("registered") === "1") {
    setSuccess("Account created successfully! You can now sign in.");
  }
}, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const data = await loginUser({
        email: email.trim(),
        password,
      });

      if (!data.accessToken) {
        throw new Error("The server did not return an access token.");
      }

      sessionStorage.setItem("taskflow_access_token", data.accessToken);

      if (data.user) {
        sessionStorage.setItem("taskflow_user", JSON.stringify(data.user));
      }

      setSuccess("Login successful!");
      router.push("/dashboard");
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex items-center justify-center px-6 py-10 sm:px-12">
      <div className="w-full max-w-md">
        <div className="mb-9 flex items-center gap-3 md:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-extrabold text-white">
            T
          </div>
          <span className="text-2xl font-bold text-slate-900">
            Taskflow
          </span>
        </div>

        <div className="mb-8">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Welcome back
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Enter your details below to access your workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  setError(
                    "Forgot password will be implemented in a later step."
                  )
                }
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Sign up
          </Link>
        </p>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">
            TASK MANAGEMENT MADE SIMPLE
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <p className="text-center text-xs leading-5 text-slate-400">
          By continuing, you agree to use Taskflow responsibly.
        </p>
      </div>
    </section>
  );
}
