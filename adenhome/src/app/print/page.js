"use client";

import { useEffect, useState } from "react";
import ResumeDocument from "../components/resume/ResumeDocument";
import { loadPrintResume } from "@/lib/printResumeStorage";

export default function PrintPage() {
  const [resume] = useState(() => loadPrintResume());

  useEffect(() => {
    if (!resume) {
      return;
    }
    window.print();
  }, [resume]);

  if (!resume) {
    return (
      <main className="min-h-screen px-4 py-8 md:px-8 md:py-12">
        <div className="mx-auto max-w-2xl text-sm leading-7 text-[var(--muted)]">
          No resume draft found for printing. Generate or customize a resume first,
          then use Download PDF.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-0 py-0">
      <div className="mx-auto flex w-full justify-center">
        <ResumeDocument resume={resume} />
      </div>
    </main>
  );
}
