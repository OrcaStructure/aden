"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginClient() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/site-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, nextPath }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.error || "Invalid password.");
      setLoading(false);
      return;
    }

    const data = await response.json().catch(() => ({}));
    window.location.href = data.redirect || "/";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950 p-6 space-y-4"
    >
      <h1 className="text-xl font-semibold">Enter Site Password</h1>
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="w-full rounded-lg border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-gray-500 focus:outline-none"
        placeholder="Password"
        autoFocus
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-gray-200 disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Continue"}
      </button>
    </form>
  );
}
