import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Refund & Advertising Policy — SensorySearch",
  description: "Our policies on refunds, listings, and advertising content on SensorySearch.",
  alternates: {
    canonical: "/legal/refund-and-advertising",
  },
}

export default function RefundAndAdvertisingPage() {
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
        <h1 className="text-4xl font-heading font-bold mb-2">Refund & Advertising Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: January 2025</p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8">
        <section id="beta">
          <h2 className="text-2xl font-heading font-semibold mb-3">Free Beta Period</h2>
          <p className="text-muted-foreground leading-relaxed">
            During our beta period, all event and venue listings are free for the first 3 months. After the beta period
            ends, standard pricing will apply.
          </p>
        </section>

        <section id="listings">
          <h2 className="text-2xl font-heading font-semibold mb-3">Listings & Review</h2>
          <p className="text-muted-foreground leading-relaxed">
            All listings are subject to review and approval by our team. We reserve the right to reject or remove any
            listing that does not meet our quality standards or violates our policies.
          </p>
        </section>

        <section id="prohibited">
          <h2 className="text-2xl font-heading font-semibold mb-3">Prohibited Content</h2>
          <p className="text-muted-foreground leading-relaxed">
            Listings must not contain false, misleading, or discriminatory information. We prohibit content that
            promotes illegal activities or violates the rights of others.
          </p>
        </section>

        <section id="refunds">
          <h2 className="text-2xl font-heading font-semibold mb-3">Refunds</h2>
          <p className="text-muted-foreground leading-relaxed">
            Refunds for paid listings may be requested within 7 days of purchase if the listing has not been published.
            Once published, listings are non-refundable.
          </p>
        </section>

        <section id="disputes">
          <h2 className="text-2xl font-heading font-semibold mb-3">Disputes</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have a dispute regarding a listing or payment, please contact us at{" "}
            <a href="mailto:support@sensorysearch.app" className="text-primary hover:underline">
              support@sensorysearch.app
            </a>{" "}
            within 30 days.
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
                name: "Refund & Advertising Policy",
                item: "https://sensorysearch.app/legal/refund-and-advertising",
              },
            ],
          }),
        }}
      />
    </div>
  )
}
