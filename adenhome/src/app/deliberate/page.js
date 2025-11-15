// app/deliberate/page.jsx
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import DeliberateApp from "./DeliberateApp";

export const dynamic = "force-dynamic";

export default async function DeliberatePage() {
  const user = await getCurrentUser();

  // keep if you want it private
  if (!user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Deliberate</h1>
          <p className="mt-2 text-sm text-gray-400">
            You are logged in as {user.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <DeliberateApp />
    </main>
  );
}
