import Link from "next/link";
import { notFound } from "next/navigation";
import { getOutputBySlug, listOutputs } from "@/lib/outputs";
import { absoluteUrl, siteName } from "@/lib/seo";

function buildDescription(output) {
  return (
    output.description ||
    `Read ${output.title}, a PDF output from ${siteName}.`
  );
}

export async function generateStaticParams() {
  const outputs = await listOutputs();
  return outputs.map((output) => ({ slug: output.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const output = await getOutputBySlug(slug);

  if (!output) {
    return {
      title: "Output Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = buildDescription(output);
  const canonicalPath = `/outputs/${output.slug}`;

  return {
    title: output.title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: "article",
      url: canonicalPath,
      title: `${output.title} | ${siteName}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${output.title} | ${siteName}`,
      description,
    },
  };
}

export default async function OutputPage({ params }) {
  const { slug } = await params;
  const output = await getOutputBySlug(slug);

  if (!output) {
    notFound();
  }

  const description = buildDescription(output);
  const outputPageUrl = absoluteUrl(`/outputs/${output.slug}`);
  const pdfUrl = absoluteUrl(output.pdfPath);

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    headline: output.title,
    name: output.title,
    description,
    url: outputPageUrl,
    encodingFormat: "application/pdf",
    author: {
      "@type": "Person",
      name: "Aden Power",
    },
    distribution: {
      "@type": "DataDownload",
      contentUrl: pdfUrl,
      encodingFormat: "application/pdf",
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: "Outputs",
      url: absoluteUrl("/outputs"),
    },
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkJsonLd) }}
      />

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
        <iframe className="h-[80vh] w-full" src={output.pdfPath} title={output.title} />
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
