import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Refund & Advertising Policy - SensorySearch",
  description: "Read SensorySearch LLC's official refund and advertising policy for organizers and advertisers.",
  openGraph: {
    title: "Refund & Advertising Policy - SensorySearch",
    description: "Read SensorySearch LLC's official refund and advertising policy for organizers and advertisers.",
  },
}

export default function RefundPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5BC0BE] via-[#C8A2C8] to-[#F8E9A1] bg-clip-text text-transparent">
            Refund & Advertising Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              This Refund & Advertising Policy outlines the terms for paid listings, subscriptions, and advertising on
              SensorySearch. By submitting a paid listing or advertisement, you agree to these terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h3 className="font-semibold">Business Venue Listings</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Monthly subscription: $9.99/month</li>
              <li>Includes one venue listing with full sensory details</li>
              <li>Additional locations: $2.99/month each</li>
              <li>Automatically renews monthly unless canceled</li>
            </ul>

            <h3 className="font-semibold mt-4">Event Listings</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Standard event: $9.99 per event</li>
              <li>Featured event: $19.99 per event (priority placement)</li>
              <li>One-time payment per event</li>
            </ul>

            <h3 className="font-semibold mt-4">Community Venues</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Parks and playgrounds: FREE</li>
              <li>No payment required</li>
              <li>Subject to review and approval</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Refund Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h3 className="font-semibold">General Policy</h3>
            <p>
              All payments are generally non-refundable. However, we may issue refunds at our discretion in the
              following circumstances:
            </p>

            <h3 className="font-semibold mt-4">Eligible for Refund</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                <strong>Technical Issues:</strong> If our platform experiences significant downtime preventing your
                listing from being displayed
              </li>
              <li>
                <strong>Duplicate Charges:</strong> If you were charged multiple times for the same listing due to a
                system error
              </li>
              <li>
                <strong>Rejected Listings:</strong> If your listing is rejected during review, you will receive a full
                refund
              </li>
              <li>
                <strong>First 7 Days:</strong> For monthly subscriptions, you may request a refund within 7 days of your
                first payment if you are unsatisfied
              </li>
            </ul>

            <h3 className="font-semibold mt-4">Not Eligible for Refund</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Change of mind after listing approval</li>
              <li>Venue or event cancellation (your responsibility to update or remove listing)</li>
              <li>Low engagement or traffic to your listing</li>
              <li>Partial month subscriptions (no pro-rated refunds)</li>
            </ul>

            <h3 className="font-semibold mt-4">Refund Process</h3>
            <p>
              To request a refund, contact us at{" "}
              <a href="mailto:sensorysearchquestions@gmail.com" className="text-[#5BC0BE] hover:underline">
                sensorysearchquestions@gmail.com
              </a>{" "}
              with your order details. Refunds are processed within 5-10 business days to the original payment method.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cancellation Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h3 className="font-semibold">Monthly Subscriptions</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You may cancel your subscription at any time through your account settings</li>
              <li>Cancellation takes effect at the end of the current billing period</li>
              <li>You will retain access to your listing until the end of the paid period</li>
              <li>No refunds for partial months</li>
            </ul>

            <h3 className="font-semibold mt-4">Event Listings</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Event listings remain active until the event date passes</li>
              <li>You may remove your listing early, but no refund will be issued</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advertising Standards</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>All listings and advertisements must:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate and truthful information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not contain offensive, discriminatory, or inappropriate content</li>
              <li>Include genuine sensory-friendly features and accommodations</li>
              <li>Not mislead users about accessibility or sensory attributes</li>
            </ul>

            <h3 className="font-semibold mt-4">Prohibited Content</h3>
            <p>Listings may not include:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>False or misleading claims</li>
              <li>Hate speech or discriminatory language</li>
              <li>Adult or inappropriate content</li>
              <li>Spam or irrelevant information</li>
              <li>Copyrighted material without permission</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listing Review and Approval</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>All paid listings are subject to review before publication. We reserve the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Reject listings that do not meet our standards</li>
              <li>Request modifications or additional information</li>
              <li>Remove listings that violate our policies</li>
              <li>Suspend or terminate accounts for repeated violations</li>
            </ul>
            <p className="mt-4">Review typically takes 2-3 business days. You will be notified of the decision.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Listing Modifications</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>You may update your listing information at any time through your account. Changes are subject to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Re-review if substantial changes are made</li>
              <li>Our advertising standards and policies</li>
              <li>No additional fees for updates (within your subscription)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Processing</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Payments are processed securely through Stripe. We do not store your full payment information. By
              providing payment information, you authorize us to charge your payment method for applicable fees.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              If you have a dispute regarding a charge or listing, please contact us first at{" "}
              <a href="mailto:sensorysearchquestions@gmail.com" className="text-[#5BC0BE] hover:underline">
                sensorysearchquestions@gmail.com
              </a>
              . We will work with you to resolve the issue promptly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              We may update this policy from time to time. Changes will be posted on this page with an updated "Last
              Updated" date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>For questions about refunds, billing, or advertising policies, please contact:</p>
            <p>
              <strong>SensorySearch LLC</strong>
              <br />
              Email:{" "}
              <a href="mailto:sensorysearchquestions@gmail.com" className="text-[#5BC0BE] hover:underline">
                sensorysearchquestions@gmail.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
