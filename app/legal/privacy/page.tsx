import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Privacy Policy — SensorySearch",
  description: "Learn how SensorySearch collects, uses, and protects your personal information.",
  alternates: {
    canonical: "/legal/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/legal"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Legal
      </Link>

      <div className="relative mb-8">
        <div className="absolute right-0 top-0 opacity-5">
          <Image src="/icons/puzzle-pin.png" alt="" width={120} height={120} className="object-contain" />
        </div>
        <h1 className="text-4xl font-heading font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8">
        <section id="data">
          <h2 className="text-2xl font-heading font-semibold mb-3">Information We Collect</h2>
          <p className="text-muted-foreground leading-relaxed">
            We collect information you provide directly to us, such as when you create an account, list a venue or
            event, or contact us for support. This may include your name, email address, and any other information you
            choose to provide.
          </p>
        </section>

        <section id="usage">
          <h2 className="text-2xl font-heading font-semibold mb-3">How We Use Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            We use the information we collect to provide, maintain, and improve our services, to communicate with you,
            and to personalize your experience on SensorySearch.
          </p>
        </section>

        <section id="retention">
          <h2 className="text-2xl font-heading font-semibold mb-3">Data Retention</h2>
          <p className="text-muted-foreground leading-relaxed">
            We retain your personal information for as long as necessary to fulfill the purposes outlined in this
            privacy policy, unless a longer retention period is required or permitted by law.
          </p>
        </section>

        <section id="rights">
          <h2 className="text-2xl font-heading font-semibold mb-3">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed">
            You have the right to access, update, or delete your personal information at any time. You may also opt out
            of certain communications or data collection practices.
          </p>
        </section>

        <section id="contact">
          <h2 className="text-2xl font-heading font-semibold mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have any questions about this privacy policy, please contact us at{" "}
            <a href="mailto:contact@sensorysearch.com" className="text-primary hover:underline">
              contact@sensorysearch.com
            </a>
          </p>
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://sensorysearch.app",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Legal",
                item: "https://sensorysearch.app/legal",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Privacy Policy",
                item: "https://sensorysearch.app/legal/privacy",
              },
            ],
          }),
        }}
      />
    </div>
  )
}
