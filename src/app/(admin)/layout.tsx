import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar } from "@/components/admin/sidebar";
import { MobileNav } from "@/components/admin/mobile-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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
  ],
  authors: [{ name: "KTTC Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "KTTC - Khuzestan Teacher Training Center",
    description:
      "Empowering educators with modern teaching skills and professional development programs",
    type: "website",
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
               <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 md:pl-64 flex flex-col">
                 <header className="md:hidden flex items-center h-16 border-b px-4 shrink-0 bg-background">
                    <MobileNav />
                    <div className="ml-4 font-semibold">KTTC Admin</div>
                 </header>
                 <main className="flex-1 overflow-y-auto">
                    {children}
                 </main>
            </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
