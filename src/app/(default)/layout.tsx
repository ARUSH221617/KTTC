import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://kttc.edu.ir'),
  title: "KTTC - Khuzestan Teacher Training Center",
  description:
    "Official online platform for Khuzestan Teacher Training Center. Empowering educators with modern teaching skills and professional development programs.",
  keywords: [
    "KTTC",
    "Teacher Training",
    "Education",
    "Khuzestan",
    "Professional Development",
    "Teaching Skills",
    "Teacher Training in Khuzestan",
    "Education Certificate Iran",
    "Khorramshahr Educational Workshops"
  ],
  alternates: {
    canonical: '/',
  },
  authors: [{ name: "KTTC Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KTTC - Khuzestan Teacher Training Center",
    description:
      "Empowering educators with modern teaching skills and professional development programs",
    type: "website",
    siteName: "KTTC",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "KTTC - Khuzestan Teacher Training Center",
    description:
      "Empowering educators with modern teaching skills and professional development programs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Khuzestan Teacher Training Center (KTTC)",
    "url": "https://kttc.edu.ir",
    "logo": "https://kttc.edu.ir/logo.svg",
    "description": "Official online platform for Khuzestan Teacher Training Center.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Khorramshahr",
      "addressRegion": "Khuzestan",
      "addressCountry": "IR"
    },
    "sameAs": [
      "https://facebook.com/kttc",
      "https://twitter.com/kttc",
      "https://instagram.com/kttc"
    ]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
