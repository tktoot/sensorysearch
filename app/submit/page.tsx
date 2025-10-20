import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, ArrowRight, TreePine } from "lucide-react"
import Link from "next/link"

export default async function SubmitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/intro")
  }

  // Check if user is organizer or admin
  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (!userData || (userData.role !== "organizer" && userData.role !== "admin")) {
    redirect("/profile?upgrade=true")
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">What would you like to submit?</h1>
        <p className="text-muted-foreground">Choose the type of listing you want to create</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group transition-all hover:border-primary hover:shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold">Submit an Event</h2>
              <p className="text-sm text-muted-foreground">
                Share a sensory-friendly event happening in your community
              </p>
            </div>
            <Button asChild className="mt-4 w-full gap-2">
              <Link href="/organizer/submit/event">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-primary hover:shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold">Submit a Venue</h2>
              <p className="text-sm text-muted-foreground">
                Add a sensory-friendly business or community space to the map
              </p>
            </div>
            <Button asChild className="mt-4 w-full gap-2">
              <Link href="/organizer/submit/venue">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-primary hover:shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <TreePine className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-semibold">Submit a Park</h2>
              <p className="text-sm text-muted-foreground">Add a sensory-friendly park or playground to the map</p>
            </div>
            <Button asChild className="mt-4 w-full gap-2">
              <Link href="/organizer/submit/park">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          During beta, all submissions are free and will be reviewed within 24-48 hours.
        </p>
      </div>
    </div>
  )
}
