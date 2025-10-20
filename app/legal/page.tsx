import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, FileText, Shield, DollarSign } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Legal — SensorySearch",
  description: "Privacy policy, terms of service, and refund & advertising policies for SensorySearch.",
  alternates: {
    canonical: "/legal",
  },
}

export default function LegalPage() {
  const policies = [
    {
      href: "/legal/privacy",
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information",
      icon: Shield,
    },
    {
      href: "/legal/terms",
      title: "Terms of Service",
      description: "Rules and guidelines for using SensorySearch",
      icon: FileText,
    },
    {
      href: "/legal/refund-and-advertising",
      title: "Refund & Advertising Policy",
      description: "Our policies on refunds, listings, and advertising content",
      icon: DollarSign,
    },
  ]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/discover"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Discover
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-3">Legal</h1>
        <p className="text-lg text-muted-foreground">Our policies and terms for using SensorySearch</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {policies.map((policy) => {
          const Icon = policy.icon
          return (
            <Link key={policy.href} href={policy.href}>
              <Card className="h-full transition-colors hover:bg-accent">
                <CardHeader>
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{policy.title}</CardTitle>
                  <CardDescription>{policy.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
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
            ],
          }),
        }}
      />
    </div>
  )
}
