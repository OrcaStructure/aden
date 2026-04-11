"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ResumeDocument from "./ResumeDocument";
import { savePrintResume } from "@/lib/printResumeStorage";

const EXAMPLES = [
  "AI research engineer",
  "technical educator",
  "startup founder",
];

export default function ResumeHome({ initialResume }) {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [resume, setResume] = useState(initialResume);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const promptLabel = useMemo(() => {
    return resume?.prompt || "general overview";
  }, [resume]);
  const manualHref = useMemo(() => {
    const params = new URLSearchParams({
      experience: (resume?.experience ?? []).map((item) => item.id).join(","),
      projects: (resume?.projects ?? []).map((item) => item.id).join(","),
      publications: (resume?.publications ?? [])
        .map((item) => item.id)
        .join(","),
      education: (resume?.education ?? []).map((item) => item.id).join(","),
      skills: (resume?.skills ?? []).map((item) => item.id).join(","),
      awards: (resume?.awards ?? []).map((item) => item.id).join(","),
    });

    return `/manual?${params.toString()}`;
  }, [resume]);

  async function handleSubmit(event) {
    event.preventDefault();
    const nextPrompt = prompt.trim();

    if (!nextPrompt) {
      setError("Describe the role or context.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: nextPrompt }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Request failed");
      }

      setResume(data.resume);
    } catch (submitError) {
      setError(submitError.message || "Unable to generate a resume right now.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadPdf() {
    savePrintResume(resume);
    router.push("/print");
  }

  return (
    <main className="resume-builder min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-8 xl:flex-row xl:items-start xl:justify-center">
        <header className="no-print w-full max-w-xl space-y-8 xl:sticky xl:top-8">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
              Aden Power
            </p>
            <h1 className="max-w-2xl text-3xl leading-tight text-[var(--foreground)] md:text-5xl">
              What do you want Aden for?
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[var(--muted)] md:text-base">
              Type the role or context. The site selects the most relevant resume
              items from a markdown file and builds the page from that.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={3}
              placeholder="Example: I need Aden for applied AI research."
              className="w-full rounded-none border border-[var(--line)] bg-transparent px-4 py-4 text-base text-[var(--foreground)] outline-none transition focus:border-[var(--foreground)]"
            />
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setPrompt(example)}
                    className="border border-[var(--line)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="border border-[var(--foreground)] px-4 py-3 text-xs uppercase tracking-[0.18em] text-[var(--foreground)] transition hover:bg-[var(--foreground)] hover:text-[var(--sheet)] disabled:opacity-60"
                >
                  {isLoading ? "Generating" : "Generate"}
                </button>
                <Link
                  href={manualHref}
                  className="border border-[var(--line)] px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                >
                  Customize manually
                </Link>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="border border-[var(--line)] px-4 py-3 text-center text-xs uppercase tracking-[0.18em] text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
                >
                  Download PDF
                </button>
              </div>
            </div>
            {error ? <p className="text-sm text-[var(--foreground)]">{error}</p> : null}
          </form>
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Current draft: {promptLabel}
          </p>
        </header>

        <ResumeDocument resume={resume} />
      </div>
    </main>
  );
}
