import Link from "next/link";
import { listOutputs } from "@/lib/outputs";
import { absoluteUrl, siteName } from "@/lib/seo";

const description = "Browse downloadable PDF outputs and research artifacts by Aden Power.";

export const metadata = {
  title: "Outputs",
  description,
  alternates: {
    canonical: "/outputs",
  },
  openGraph: {
    type: "website",
    url: "/outputs",
    title: `Outputs | ${siteName}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `Outputs | ${siteName}`,
    description,
  },
};

export default async function OutputsPage() {
  const outputs = await listOutputs();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Outputs",
    url: absoluteUrl("/outputs"),
    description,
    isPartOf: {
      "@type": "WebSite",
      name: siteName,
      url: absoluteUrl("/"),
    },
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      <p>
        <Link className="explicit-hover-link" href="/">
          home
        </Link>
      </p>

      <h1 className="mt-4 text-2xl font-semibold">Outputs</h1>

      {outputs.length ? (
        <ul className="mt-6 ml-6 list-disc space-y-2">
          {outputs.map((item) => (
            <li key={`${item.filename}-${item.slug}`}>
              <Link className="explicit-hover-link" href={`/outputs/${item.slug}`}>
                {item.title}
              </Link>
              {item.description ? (
                <p className="mt-1 text-sm text-[var(--muted)]">{item.description}</p>
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
