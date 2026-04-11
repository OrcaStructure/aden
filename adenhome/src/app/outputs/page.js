import Link from "next/link";
import { listOutputs } from "@/lib/outputs";

export const metadata = {
  title: "Outputs",
};

export default async function OutputsPage() {
  const outputs = await listOutputs();

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <p>
        <Link className="explicit-hover-link" href="/">
          home
        </Link>
      </p>

      <h1 className="mt-4 text-2xl font-semibold">outputs</h1>

      {outputs.length ? (
        <ul className="mt-6 ml-6 list-disc space-y-2">
          {outputs.map((item) => (
            <li key={`${item.filename}-${item.slug}`}>
              <Link
                className="explicit-hover-link"
                href={`/outputs/${item.slug}`}
                target="_blank"
                rel="noreferrer"
              >
                {item.title}
              </Link>
              {item.description ? (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[var(--muted)]">
          Add PDF files to <code>public/outputs/</code> and they will appear here.
        </p>
      )}
    </main>
  );
}
