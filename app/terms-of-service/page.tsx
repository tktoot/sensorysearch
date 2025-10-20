import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Terms of Service - SensorySearch",
  description: "Read SensorySearch LLC's official terms of service and user agreement.",
  openGraph: {
    title: "Terms of Service - SensorySearch",
    description: "Read SensorySearch LLC's official terms of service and user agreement.",
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#5BC0BE] via-[#C8A2C8] to-[#F8E9A1] bg-clip-text text-transparent">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              By accessing or using SensorySearch ("the Service"), you agree to be bound by these Terms of Service
              ("Terms"). If you do not agree to these Terms, please do not use the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              SensorySearch is a platform that connects families with sensory-friendly venues and events. We provide:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>A searchable directory of sensory-friendly venues and events</li>
              <li>Detailed sensory information and accessibility features</li>
              <li>Tools for venue and event organizers to list their offerings</li>
              <li>Community-contributed venue listings</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>To access certain features, you may need to create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Be responsible for all activities under your account</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Content and Conduct</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>When using the Service, you agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Post false, misleading, or inaccurate information</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm others</li>
              <li>Transmit viruses or malicious code</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Use the Service for commercial purposes without authorization</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Venue and Event Listings</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <h3 className="font-semibold">Organizer Responsibilities</h3>
            <p>If you list a venue or event, you represent and warrant that:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>You have the authority to list the venue or event</li>
              <li>All information provided is accurate and up-to-date</li>
              <li>You will maintain the sensory-friendly features advertised</li>
              <li>You comply with all applicable laws and regulations</li>
            </ul>

            <h3 className="font-semibold mt-4">Review and Moderation</h3>
            <p>
              We reserve the right to review, approve, reject, or remove any listing at our discretion. We do not
              guarantee the accuracy of user-submitted content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment and Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              Certain features require payment. By subscribing, you agree to pay all fees and charges. All fees are
              non-refundable except as required by law or as stated in our Refund Policy.
            </p>
            <p>
              Subscriptions automatically renew unless canceled. You may cancel at any time through your account
              settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              The Service and its content (excluding user-generated content) are owned by SensorySearch LLC and
              protected by copyright, trademark, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of content you submit, but grant us a worldwide, non-exclusive, royalty-free license
              to use, display, and distribute your content in connection with the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimers</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THE ACCURACY,
              COMPLETENESS, OR RELIABILITY OF ANY CONTENT OR INFORMATION.
            </p>
            <p>
              We are not responsible for the conduct of venues, events, or other users. You use the Service at your own
              risk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SENSORYSEARCH LLC SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              We may terminate or suspend your account and access to the Service at any time, with or without notice,
              for conduct that we believe violates these Terms or is harmful to other users or the Service.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to Terms</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by posting
              the updated Terms and updating the "Last Updated" date. Your continued use of the Service constitutes
              acceptance of the modified Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>
              These Terms are governed by the laws of the United States and the state in which SensorySearch LLC is
              registered, without regard to conflict of law principles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-4">
            <p>If you have questions about these Terms, please contact us:</p>
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
