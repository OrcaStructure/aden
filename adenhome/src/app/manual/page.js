import ManualResumeBuilder from "../components/resume/ManualResumeBuilder";
import { loadResumeInventory } from "@/lib/resumeContent";
import { siteName } from "@/lib/seo";

const description =
  "Interactive manual resume builder for selecting and composing tailored resume content.";

export const metadata = {
  title: "Manual Resume Builder",
  description,
  alternates: {
    canonical: "/manual",
  },
  openGraph: {
    type: "website",
    url: "/manual",
    title: `Manual Resume Builder | ${siteName}`,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: `Manual Resume Builder | ${siteName}`,
    description,
  },
};

function parseIds(value) {
  if (typeof value !== "string") {
    return [];
  }
  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export default async function ManualPage({ searchParams }) {
  const inventory = await loadResumeInventory();
  const initialSelection = {
    experience: parseIds(searchParams?.experience),
    projects: parseIds(searchParams?.projects),
    publications: parseIds(searchParams?.publications),
    education: parseIds(searchParams?.education),
    skills: parseIds(searchParams?.skills),
    awards: parseIds(searchParams?.awards),
  };

  return (
    <ManualResumeBuilder
      inventory={inventory}
      initialSelection={initialSelection}
    />
  );
}
