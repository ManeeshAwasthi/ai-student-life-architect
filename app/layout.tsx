import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "PeakMind",
  description: "Your personal coach. Built for students who mean it.",
  keywords: ["study", "productivity", "student planner", "habit tracker", "peak performance"],
  openGraph: {
    title: "PeakMind",
    description: "Your personal coach. Built for students who mean it.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}