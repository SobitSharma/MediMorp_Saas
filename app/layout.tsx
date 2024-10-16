import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "MediaMorp",
  description: "Store And Edit Your Media",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    signInFallbackRedirectUrl={process.env.NEXT_PUBLIC_API_URL}
    signUpFallbackRedirectUrl={process.env.NEXT_PUBLIC_API_URL}
    appearance={
      {
        baseTheme:dark,
        layout:{
          socialButtonsPlacement:'bottom',
          socialButtonsVariant:'iconButton'
        },
      }
    }
    >
    <html lang="en">
      <body data-theme="dark"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
