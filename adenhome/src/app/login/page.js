import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function SiteLoginPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <Suspense
        fallback={
          <div className="w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-950 p-6 text-sm text-gray-400">
            Loading login...
          </div>
        }
      >
        <LoginClient />
      </Suspense>
    </main>
  );
}
