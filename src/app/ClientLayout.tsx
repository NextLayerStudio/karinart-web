'use client';

import { usePathname } from "next/navigation";
import Header from "./components/header";
import Footer from "./components/footer";
import SiteAnalyticsTracker from "./components/SiteAnalyticsTracker";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") || false;

  return (
    <>
      {!isAdminRoute && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <SiteAnalyticsTracker />}
    </>
  );
} 