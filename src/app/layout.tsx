import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NameVoid — Find company names nobody is using",
  description:
    "Describe your idea, brainstorm brandable company names, and instantly see which ones are free and which are already taken — with evidence.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
