import ManualResumeBuilder from "../components/resume/ManualResumeBuilder";
import { loadResumeInventory } from "@/lib/resumeContent";

export const metadata = {
  title: "Aden Power | Manual Resume Builder",
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
