import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Admin Console — ADDies",
  description: "Restricted superadmin access.",
  robots: { index: false, follow: false },
};

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
