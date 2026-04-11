import Link from "next/link";
import { notFound } from "next/navigation";
import { getOutputBySlug } from "@/lib/outputs";

export default async function OutputPage({ params }) {
  const { slug } = await params;
  const output = await getOutputBySlug(slug);

  if (!output) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <p>
        <Link
          className="underline text-[var(--link)] transition-colors hover:text-[var(--link-hover)]"
          href="/"
        >
          home
        </Link>
      </p>

      <h1 className="mt-4 text-2xl font-semibold">{output.title}</h1>
      {output.description ? (
        <p className="mt-2 text-[var(--muted)]">{output.description}</p>
      ) : null}

      <div className="mt-6 overflow-hidden rounded-lg border border-[var(--line)] bg-white shadow-sm">
        <iframe
          className="h-[80vh] w-full"
          src={output.pdfPath}
          title={output.title}
        />
      </div>

      <p className="mt-4">
        <a
          className="underline text-[var(--link)] transition-colors hover:text-[var(--link-hover)]"
          href={output.pdfPath}
          target="_blank"
          rel="noreferrer"
        >
          Open PDF in new tab
        </a>
      </p>
    </main>
  );
}
