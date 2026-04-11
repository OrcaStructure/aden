const PRINT_RESUME_STORAGE_KEY = "adenhome.printResumeDraft";

export function savePrintResume(resume) {
  if (typeof window === "undefined" || !resume) {
    return false;
  }

  try {
    window.sessionStorage.setItem(
      PRINT_RESUME_STORAGE_KEY,
      JSON.stringify(resume)
    );
    return true;
  } catch {
    return false;
  }
}

export function loadPrintResume() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(PRINT_RESUME_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
