import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Building2, ArrowRight, TreePine, Church, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function SubmitPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("[v0] Submit page: No user, redirecting to intro")
    redirect("/intro?next=/submit")
  }

  const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

  console.log("[v0] Submit page: User role:", userData?.role)

  const isOrganizer = userData?.role === "organizer" || userData?.role === "admin"

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">What would you like to submit?</h1>
        <p className="text-muted-foreground">Choose the type of listing you want to create</p>
      </div>

      {!isOrganizer && (
        <Alert className="mb-6 border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">Organizer Account Required</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            To submit listings, you need to create a free organizer account.{" "}
            <Link href="/upgrade-organizer?next=/submit" className="underline font-medium">
              Create organizer account
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group transition-all hover:border-primary hover:shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Calendar className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Event</h2>
              <p className="text-xs text-muted-foreground">Share a sensory-friendly event</p>
            </div>
            {isOrganizer ? (
              <Button asChild size="sm" className="mt-2 w-full gap-2">
                <Link href="/organizer/submit/event">
                  Continue
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="mt-2 w-full gap-2 bg-transparent">
                <Link href="/upgrade-organizer?next=/organizer/submit/event">Upgrade to Continue</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="group transition-all hover:border-primary hover:shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Building2 className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Venue</h2>
              <p className="text-xs text-muted-foreground">Add a sensory-friendly business</p>
            </div>
            {isOrganizer ? (
              <Button asChild size="sm" className="mt-2 w-full gap-2">
                <Link href="/organizer/submit/venue">
                  Continue
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="mt-2 w-full gap-2 bg-transparent">
                <Link href="/upgrade-organizer?next=/organizer/submit/venue">Upgrade to Continue</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="group relative transition-all hover:border-primary hover:shadow-lg">
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            FREE
          </div>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <TreePine className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Park/Playground</h2>
              <p className="text-xs text-muted-foreground">Add a sensory-friendly outdoor space</p>
            </div>
            {isOrganizer ? (
              <Button asChild size="sm" className="mt-2 w-full gap-2">
                <Link href="/organizer/submit/park">
                  Continue
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="mt-2 w-full gap-2 bg-transparent">
                <Link href="/upgrade-organizer?next=/organizer/submit/park">Upgrade to Continue</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="group relative transition-all hover:border-primary hover:shadow-lg">
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            FREE
          </div>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
              <Church className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold">Place of Worship</h2>
              <p className="text-xs text-muted-foreground">Share your sensory-friendly services</p>
            </div>
            {isOrganizer ? (
              <Button asChild size="sm" className="mt-2 w-full gap-2">
                <Link href="/organizer/submit/worship">
                  Continue
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="mt-2 w-full gap-2 bg-transparent">
                <Link href="/upgrade-organizer?next=/organizer/submit/worship">Upgrade to Continue</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          During beta, all submissions are <strong>free</strong> and will be reviewed within 24-48 hours.
        </p>
        <p className="text-xs text-muted-foreground">
          Places of worship, parks, and playgrounds are always free as part of our community support initiative.
        </p>
      </div>
    </div>
  )
}
