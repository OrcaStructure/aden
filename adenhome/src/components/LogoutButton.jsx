"use client";

import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebaseClient";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 hover:bg-gray-700"
    >
      Log out
    </button>
  );
}
