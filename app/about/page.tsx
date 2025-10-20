"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-heading font-bold text-gradient">About Us</h1>
        <p className="text-xl text-muted-foreground">The Story Behind SensorySearch</p>
      </div>

      {/* Logo watermark */}
      <div className="relative mb-8">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <div className="relative h-32 w-32">
            <Image src="/icons/puzzle-pin.png" alt="SensorySearch logo" fill className="object-contain" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <Card className="p-8 mb-8 bg-gradient-to-br from-card via-card to-primary/5">
        <div className="space-y-6 text-lg leading-relaxed">
          <p>SensorySearch was created by a dad for families navigating the world with sensory needs.</p>

          <p>
            It was inspired by the real-life experience of a family raising a four-year-old son with autism, and
            understanding how isolating it can feel when the world isn't always built for inclusion.
          </p>

          <p>
            Our mission is to make it easier for families, individuals, and communities to discover sensory-friendly
            spaces — places that feel welcoming, supportive, and inclusive for everyone.
          </p>

          <p>
            From peaceful restaurants to inclusive events and calm play spaces, SensorySearch helps you find comfort,
            understanding, and belonging, one pin at a time.
          </p>

          <p className="font-semibold text-gradient">Together, we can help make every community more inclusive.</p>
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center space-y-6">
        <p className="text-xl font-semibold text-gradient">Thank you for being part of this journey.</p>

        <Link href="/contact">
          <Button size="lg" className="shadow-lg">
            Contact Us
          </Button>
        </Link>
      </div>
    </div>
  )
}
