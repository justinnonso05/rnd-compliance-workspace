import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/components/shell/Shell";

export const metadata: Metadata = {
  title: "R&D Compliance Workspace",
  description: "Prototype. Synthetic data. Rule checks run live.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
