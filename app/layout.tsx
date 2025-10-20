import type React from "react"
import type { Metadata } from "next"
import { Nunito, Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { SeedInitializer } from "@/components/seed-initializer"
import { PageViewTracker } from "@/components/page-view-tracker"
import { Footer } from "@/components/footer"
import { BottomTabBar } from "@/components/bottom-tab-bar"
import { IntroModal } from "@/components/intro-modal"

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "SensorySearch - Find Sensory-Friendly Outings",
  description:
    "Discover calm, accessible venues and events with detailed sensory information. Find sensory-friendly activities perfect for families with sensory sensitivities.",
  generator: "v0.app",
  openGraph: {
    title: "SensorySearch - Find Sensory-Friendly Outings",
    description: "Discover calm, accessible venues and events with detailed sensory information",
    type: "website",
    siteName: "SensorySearch",
  },
  twitter: {
    card: "summary_large_image",
    title: "SensorySearch - Find Sensory-Friendly Outings",
    description: "Discover calm, accessible venues and events with detailed sensory information",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon-v2.jpg" />
        <meta name="theme-color" content="#0FA3B1" />
      </head>
      <body className={`font-sans ${nunito.variable} ${inter.variable} antialiased`}>
        <SeedInitializer />
        <PageViewTracker />
        <IntroModal />
        <Navigation />
        <main className="min-h-screen bg-background pb-20 md:pb-0">{children}</main>
        <Footer />
        <BottomTabBar />
      </body>
    </html>
  )
}
