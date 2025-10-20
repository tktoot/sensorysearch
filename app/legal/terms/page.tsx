import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Terms of Service — SensorySearch",
  description: "Terms and conditions for using SensorySearch services.",
  alternates: {
    canonical: "/legal/terms",
  },
}

export default function TermsPage() {
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
        <h1 className="text-4xl font-heading font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8">
        <section id="use">
          <h2 className="text-2xl font-heading font-semibold mb-3">Use of Service</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using SensorySearch, you agree to comply with these terms of service and all applicable
            laws and regulations.
          </p>
        </section>

        <section id="accounts">
          <h2 className="text-2xl font-heading font-semibold mb-3">Accounts</h2>
          <p className="text-muted-foreground leading-relaxed">
            You are responsible for maintaining the confidentiality of your account credentials and for all activities
            that occur under your account.
          </p>
        </section>

        <section id="content">
          <h2 className="text-2xl font-heading font-semibold mb-3">Listings & Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            You retain ownership of any content you submit to SensorySearch, but grant us a license to use, display, and
            distribute that content as necessary to provide our services.
          </p>
        </section>

        <section id="disclaimers">
          <h2 className="text-2xl font-heading font-semibold mb-3">Disclaimers</h2>
          <p className="text-muted-foreground leading-relaxed">
            SensorySearch is provided "as is" without warranties of any kind. We do not guarantee the accuracy or
            completeness of venue and event information.
          </p>
        </section>

        <section id="liability">
          <h2 className="text-2xl font-heading font-semibold mb-3">Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            SensorySearch shall not be liable for any indirect, incidental, special, or consequential damages arising
            from your use of our services.
          </p>
        </section>

        <section id="changes">
          <h2 className="text-2xl font-heading font-semibold mb-3">Changes</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. Continued use of SensorySearch after changes
            constitutes acceptance of the new terms.
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
                name: "Terms of Service",
                item: "https://sensorysearch.app/legal/terms",
              },
            ],
          }),
        }}
      />
    </div>
  )
}
