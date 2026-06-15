import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NameVoid — Find company names nobody is using",
    template: "%s · NameVoid",
  },
  description:
    "Describe your idea, brainstorm brandable company names, and instantly see which ones are free and which are already taken — with evidence.",
  applicationName: "NameVoid",
  keywords: [
    "company name generator",
    "business name availability",
    "brand name checker",
    "startup naming",
  ],
  openGraph: {
    type: "website",
    siteName: "NameVoid",
    title: "NameVoid — Find a company name nobody owns",
    description:
      "Brainstorm brandable names and instantly see which are free and which are taken — with evidence URLs.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "NameVoid — Find a company name nobody owns",
    description:
      "Brainstorm brandable names and see which are free vs. taken — with evidence.",
  },
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
