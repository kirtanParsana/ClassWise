import type { Metadata } from "next";
import { PT_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";
import { FirebaseClientProvider } from "@/firebase";
import { AuthProvider } from "@/context/auth-context";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pt-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "ClassWise",
  description:
    "A minimal, intelligent system for class-wise timetable planning and resource allocation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head> */}
      <body
        className={cn(
          ptSans.variable,
          spaceGrotesk.variable,
          "font-body antialiased",
          "min-h-screen bg-background font-sans"
        )}
      >
        <FirebaseClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
