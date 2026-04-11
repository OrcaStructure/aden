import { listOutputs } from "@/lib/outputs";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap() {
  const now = new Date();
  const outputs = await listOutputs();

  const staticEntries = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/outputs"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/manual"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const outputEntries = outputs.map((output) => ({
    url: absoluteUrl(`/outputs/${output.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticEntries, ...outputEntries];
}
