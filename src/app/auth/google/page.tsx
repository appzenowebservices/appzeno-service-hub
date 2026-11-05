"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import BrandedLoader from "~/app/components/common/BrandedLoader";

/** Landing point after Google OAuth: route to the dashboard for the mapped role. */
export default function GoogleAfterLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated") {
      router.replace("/auth/login");
      return;
    }
    const role = (((session?.user as { role?: string } | undefined)?.role) ?? "").toUpperCase();
    const map: Record<string, string> = {
      CUSTOMER: "/customer/dashboard",
      VENDOR: "/vendor",
      AGENT: "/agent",
      ADMIN: "/admin",
    };
    router.replace(map[role] ?? "/");
  }, [status, router, session]);

  return <BrandedLoader label="Signing you in with Google…" />;
}
