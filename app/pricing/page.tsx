"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Building2, Calendar, ArrowRight, Star, Zap } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <Badge className="mb-4" variant="secondary">
            Pricing
          </Badge>
          <h1 className="mb-4 text-5xl font-bold tracking-tight text-foreground text-balance">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground text-pretty">
            Different pricing for venues and events. Try your first listing free.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {/* Venue Pricing */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Venue Listing</CardTitle>
              <CardDescription className="text-lg">Recurring monthly subscription</CardDescription>
              <div className="mt-4">
                <span className="text-5xl font-bold text-primary">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">+ $2.99/month per additional location</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">What's included:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Displayed 24/7 in the Venues section</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Perfect for restaurants, museums, parks, libraries</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Age-matched recommendations to families</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Analytics dashboard with views and favorites</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>Cancel anytime, no long-term commitment</span>
                  </li>
                </ul>
              </div>

              <Button asChild size="lg" className="w-full gap-2">
                <Link href="/advertise">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Event Pricing */}
          <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Calendar className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-3xl">Event Listing</CardTitle>
              <CardDescription className="text-lg">One-time purchase per event</CardDescription>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-5xl font-bold text-accent">$9.99</span>
                  <span className="text-muted-foreground"> per event</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-700">Featured: $19.99</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">What's included:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span>Displayed until event end date</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span>Perfect for workshops, classes, special hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span>Automatically expires after event date</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span>Analytics dashboard with performance metrics</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <span>Duplicate past events to resubmit easily</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-amber-500/10 p-4 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-amber-700">Featured Event Upgrade</span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Zap className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Top placement in Events feed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Included in weekly featured email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
                    <span>Highlighted styling and badge</span>
                  </li>
                </ul>
              </div>

              <Button asChild size="lg" className="w-full gap-2">
                <Link href="/advertise">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Venue vs Event Comparison</CardTitle>
            <CardDescription className="text-center">Choose the right option for your needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Feature</th>
                    <th className="text-center py-3 px-4 font-semibold">Venue</th>
                    <th className="text-center py-3 px-4 font-semibold">Event (Basic)</th>
                    <th className="text-center py-3 px-4 font-semibold">Event (Featured)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-3 px-4">Pricing Model</td>
                    <td className="text-center py-3 px-4">Recurring monthly</td>
                    <td className="text-center py-3 px-4">One-time per event</td>
                    <td className="text-center py-3 px-4">One-time per event</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Cost</td>
                    <td className="text-center py-3 px-4">$9.99/mo + $2.99/location</td>
                    <td className="text-center py-3 px-4">$9.99</td>
                    <td className="text-center py-3 px-4">$19.99</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Display Duration</td>
                    <td className="text-center py-3 px-4">24/7 until cancelled</td>
                    <td className="text-center py-3 px-4">Until event end date</td>
                    <td className="text-center py-3 px-4">Until event end date</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Featured Placement</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">—</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Weekly Email Feature</td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">—</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-muted-foreground">—</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Analytics Dashboard</td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle2 className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle2 className="h-5 w-5 text-accent mx-auto" />
                    </td>
                    <td className="text-center py-3 px-4">
                      <CheckCircle2 className="h-5 w-5 text-amber-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="mb-6 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's the difference between venues and events?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Venues are ongoing locations (like restaurants or museums) that are displayed continuously with a
                  recurring monthly subscription. Events are specific date/time activities (like workshops or special
                  hours) that are one-time purchases and automatically expire after the event date.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I advertise both venues and events?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can manage both venues and events from your Organizer Account dashboard. Venues follow the
                  recurring subscription model, while events are one-time purchases.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What are Featured Events?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Featured Events cost $19.99 (vs $9.99 for basic events) and receive premium placement at the top of
                  the Events feed, highlighted styling with a special badge, and inclusion in our weekly featured events
                  email sent to local families. This gives your event maximum visibility.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens after my free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  After your first free listing, regular pricing applies. For venues, that's $9.99/month + $2.99/month
                  per additional location. For events, it's $9.99 per event or $19.99 for Featured Events. You can
                  cancel venue subscriptions anytime.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How do event expirations work?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Events automatically expire after their end date and move to a "Past Events" section in your
                  dashboard. You can duplicate past events to quickly create new listings with updated dates. Venues
                  remain active continuously until you cancel your subscription.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
