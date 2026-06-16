"use client";

import { useAuthStore } from "../../../store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VendorDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "VENDOR") router.push("/auth/login");
  }, [user, router]);

  if (!user || user.role !== "VENDOR") return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Vendor Dashboard</h1>
        <button onClick={logout} className="text-red-500">Logout</button>
      </header>
      <main className="p-6">
        <p>Welcome, {user.fullName}</p>
        <p>Mobile: {user.mobile}</p>
      </main>
    </div>
  );
}