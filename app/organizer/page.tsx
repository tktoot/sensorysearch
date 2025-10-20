import { requireOrganizer } from "@/lib/auth-server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, TreePine, Plus } from "lucide-react"
import Link from "next/link"

export default async function OrganizerDashboard() {
  const user = await requireOrganizer()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">Organizer Dashboard</h1>
        <p className="text-lg text-muted-foreground">Submit and manage your events, venues, and parks</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Submit Event</CardTitle>
            <CardDescription>List a one-time sensory-friendly event</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <Link href="/organizer/submit/event">
                <Plus className="h-4 w-4" />
                Submit Event
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Submit Venue</CardTitle>
            <CardDescription>List a permanent sensory-friendly venue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <Link href="/organizer/submit/venue">
                <Plus className="h-4 w-4" />
                Submit Venue
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <TreePine className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Submit Park/Playground</CardTitle>
            <CardDescription>List a free community park or playground</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full gap-2">
              <Link href="/organizer/submit/park">
                <Plus className="h-4 w-4" />
                Submit Park
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">Beta Period - Free Submissions</h3>
          <p className="text-sm text-muted-foreground">
            During the beta period, all submissions are free for 3 months. Submit as many events, venues, and parks as
            you'd like!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
