import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeNode - CS & Technology Learning Hub for Students",
  description:
    "CodeNode is a student-built learning platform for computer science and technology. Learn coding, web development, cybersecurity, AI, and collaborate with peers through projects, sessions, and interactive resources.",
  keywords: [
    "CodeNode",
    "CS learning hub",
    "technology learning platform",
    "student coding platform",
    "peer-to-peer learning",
    "online CS education",
    "coding for high school students",
    "web development learning",
    "cybersecurity learning",
    "AI learning platform",
    "computer science projects",
    "student tech hub",
    "interactive learning resources",
    "CS dashboard",
    "project-based learning",
    "gamified learning",
    "learning progress tracking",
    "student collaboration platform",
    "tech education",
    "STEM learning hub",
  ],

  authors: [
    { name: "Paritosh Vaghasiya", url: "https://v-paritosh.github.io/" },
    {
      name: "Ishaan Patel",
      url: "https://ishaanpatel08.github.io/Personal-Website/",
    },
  ],
  creator: "Schaumburg FBLA Web Development Team",
  robots: "index, follow",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/assets/favicon/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/assets/favicon/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    title: "CodeNode",
  },

  openGraph: {
    title: "CodeNode - CS & Technology Learning Hub",
    description:
      "A student-built platform for coding, web development, cybersecurity, AI, and peer collaboration. Track your learning progress and join live sessions.",
    url: "https://codenodefbla.netlify.app/",
    siteName: "CodeNode Learning Hub",
    images: [
      {
        url: "https://codenodefbla.netlify.app/assets/ogBanner.png",
        width: 1200,
        height: 630,
        alt: "CodeNode - Student Computer Science & Technology Learning Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "CodeNode - CS & Technology Learning Hub",
    description:
      "Learn coding, web development, AI, cybersecurity, and collaborate with peers on CodeNode, a student-built tech learning platform.",
    images: ["https://codenodefbla.netlify.app/assets/ogBanner.png"],
  },

  alternates: {
    canonical: "https://codenodefbla.netlify.app/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" enableSystem storageKey="cs-hub-theme">
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
