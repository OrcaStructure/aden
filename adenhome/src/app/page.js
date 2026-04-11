import Link from "next/link";
import { listOutputs } from "@/lib/outputs";
import {
  absoluteUrl,
  defaultDescription,
  personName,
  sameAsProfiles,
  siteName,
} from "@/lib/seo";

export const metadata = {
  title: "AI Safety Research Portfolio",
  description: defaultDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: `${siteName} | AI Safety Research Portfolio`,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | AI Safety Research Portfolio`,
    description: defaultDescription,
  },
};

export default async function HomePage() {
  const outputs = await listOutputs();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: personName,
    url: absoluteUrl("/"),
    sameAs: sameAsProfiles,
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl("/"),
    description: defaultDescription,
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />

      <h1 className="text-3xl font-semibold">Aden Power</h1>
      <p className="mt-3">
        Hi, I'm currently working on various AI safety agendas.
      </p>

      <p className="mt-4">
        <Link className="explicit-hover-link" href="/manual">
          &gt;&gt; see what I&apos;m good at &lt;&lt;
        </Link>
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Outputs</h2>
        {outputs.length ? (
          <ul className="mt-3 ml-6 list-disc space-y-2">
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
      </section>
    </main>
  );
}
