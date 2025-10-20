import type { Metadata } from "next"
import Link from "next/link"
import { Volume2, Lightbulb, Heart, Armchair, Users, Calendar, ExternalLink, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Resources for Creating Sensory-Friendly Spaces | SensorySearch",
  description:
    "Learn how to make your business sensory-friendly and welcoming for all guests. Practical tips, tools, and trusted resources for sensory inclusion.",
}

const tips = [
  {
    icon: Volume2,
    title: "Reduce background noise",
    description: "Lower music volume or offer quiet hours for a calmer environment.",
  },
  {
    icon: Lightbulb,
    title: "Adjust lighting",
    description: "Dim bright lights or provide natural lighting when possible.",
  },
  {
    icon: Heart,
    title: "Create calm zones",
    description: "Designate quiet corners or break areas for sensory relief.",
  },
  {
    icon: Armchair,
    title: "Sensory-friendly seating",
    description: "Use open layouts and minimize flashing visuals or screens.",
  },
  {
    icon: Users,
    title: "Train your staff",
    description: "Help your team understand sensory sensitivities and use patient communication.",
  },
  {
    icon: Calendar,
    title: "Offer sensory-friendly hours",
    description: "Designate specific times for sensory-friendly experiences — and list them on SensorySearch.",
  },
]

const resources = [
  {
    title: "Autism Speaks",
    subtitle: "Make Your Business Autism Friendly",
    url: "https://www.autismspeaks.org/tool-kit/autism-friendly-business-toolkit",
  },
  {
    title: "KultureCity",
    subtitle: "Sensory Inclusive Certification",
    url: "https://www.kulturecity.org/sensory-inclusive/",
  },
  {
    title: "Autism Society",
    subtitle: "Community Inclusion Resources",
    url: "https://autismsociety.org/",
  },
  {
    title: "CDC",
    subtitle: "Understanding Autism Spectrum Disorder",
    url: "https://www.cdc.gov/autism/",
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-gradient mb-4">
            Resources for Creating Sensory-Friendly Spaces
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Simple ways your business can make every guest feel welcome.
          </p>
        </div>

        {/* Section 1: Why This Matters */}
        <Card className="mb-12 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mt-2">Why This Matters</h2>
            </div>
            <div className="space-y-4 text-base md:text-lg leading-relaxed text-foreground/90">
              <p>
                For many families, going out can feel isolating — not because they don't want to, but because the world
                isn't always designed with sensory needs in mind.
              </p>
              <p>
                By making your business sensory-friendly, you're not just improving comfort — you're creating
                connection, understanding, and community.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Simple Things You Can Do */}
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-8 text-gradient">
            Simple Things You Can Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {tips.map((tip, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg hover:-translate-y-1 transition-all duration-200 border-border/50 hover:border-primary/30"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <tip.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-lg mb-2 text-foreground">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 3: Learn More */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-3 mb-8">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gradient">Learn More</h2>
          </div>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore these trusted organizations for more guidance on creating inclusive, sensory-friendly experiences.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource, index) => (
              <Button
                key={index}
                asChild
                variant="outline"
                className="h-auto p-6 justify-between hover:bg-primary/5 hover:border-primary/50 transition-all group bg-transparent"
              >
                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                  <div className="text-left">
                    <div className="font-heading font-semibold text-base mb-1">{resource.title}</div>
                    <div className="text-sm text-muted-foreground">{resource.subtitle}</div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </a>
              </Button>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 border-2 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-heading font-bold mb-4 text-gradient">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              List your sensory-friendly events and venues on SensorySearch so families can find you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link href="/advertise?type=event">
                  <Calendar className="h-5 w-5" />
                  List an Event
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
                <Link href="/advertise?type=venue">
                  <Armchair className="h-5 w-5" />
                  List a Venue
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
