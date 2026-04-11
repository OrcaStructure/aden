const FALLBACK_SITE_URL = "https://adenpower.com.au";

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.OPENROUTER_SITE_URL ||
    FALLBACK_SITE_URL;

  const normalized = String(raw || "").trim();
  if (!normalized) {
    return FALLBACK_SITE_URL;
  }

  try {
    const url = new URL(normalized.startsWith("http") ? normalized : `https://${normalized}`);
    return trimTrailingSlash(url.toString());
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function absoluteUrl(pathname = "/") {
  const base = getSiteUrl();
  return new URL(pathname, `${base}/`).toString();
}

export const siteName = "Aden Power";
export const personName = "Aden Power";
export const sameAsProfiles = [
  "https://www.linkedin.com/in/aden-power-693a201b9/",
  "https://www.lesswrong.com/users/aden",
];

export const defaultDescription =
  "AI safety researcher portfolio featuring resume materials and downloadable research outputs.";
