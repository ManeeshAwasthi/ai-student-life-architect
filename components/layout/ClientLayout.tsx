"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const HIDE_SIDEBAR_ROUTES = ["/onboarding", "/generating", "/"];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = HIDE_SIDEBAR_ROUTES.some(
    (route) => pathname === route || (route !== "/" && pathname.startsWith(route))
  );

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1, marginLeft: 240, minHeight: "100vh", overflow: "visible" }}>
        {children}
      </main>
    </div>
  );
}
