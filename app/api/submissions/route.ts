import { type NextRequest, NextResponse } from "next/server"
import { getServerUser } from "@/lib/auth-server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const user = await getServerUser()
    if (!user || (user.role !== "organizer" && user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      title,
      description,
      address,
      date,
      time,
      hours,
      serviceTimes,
      denomination,
      website,
      contactEmail,
      phone,
      sensory,
      accessibility,
      sensorySupports,
      eventEnvironment,
      parkFeatures,
      worshipFeatures,
      images,
    } = body

    if (!type || !["event", "venue", "park", "playground", "place_of_worship"].includes(type)) {
      return NextResponse.json({ error: "Invalid submission type" }, { status: 400 })
    }

    if (!title || !description || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!sensory || !sensory.noiseLevel || !sensory.lightingLevel || !sensory.crowdLevel || !sensory.densityLevel) {
      return NextResponse.json(
        { error: "Missing required sensory fields (noise, lighting, crowd, density)" },
        { status: 400 },
      )
    }

    const supabase = await createClient()

    const payload: any = {
      // Core sensory fields
      noiseLevel: sensory.noiseLevel,
      lightingLevel: sensory.lightingLevel,
      crowdLevel: sensory.crowdLevel,
      densityLevel: sensory.densityLevel,

      // Accessibility fields
      wheelchairAccessible: accessibility?.wheelchairAccessible || false,
      accessibleParking: accessibility?.accessibleParking || false,
      accessibleRestroom: accessibility?.accessibleRestroom || false,

      // Sensory support fields
      quietSpaceAvailable: sensorySupports?.quietSpaceAvailable || false,
      sensoryFriendlyHours: sensorySupports?.sensoryFriendlyHours || false,
      headphonesAllowed: sensorySupports?.headphonesAllowed || false,
      staffTrained: sensorySupports?.staffTrained || false,

      // Type-specific fields
      ...(type === "event" && eventEnvironment
        ? {
            amplifiedSound: eventEnvironment.amplifiedSound || false,
            flashingLights: eventEnvironment.flashingLights || false,
            indoorEvent: eventEnvironment.indoorEvent || false,
            outdoorEvent: eventEnvironment.outdoorEvent || false,
            expectedCrowdSize: eventEnvironment.expectedCrowdSize || "",
          }
        : {}),

      ...(type === "park" || type === "playground"
        ? {
            fencingType: parkFeatures?.fencingType || "",
            petsAllowed: parkFeatures?.petsAllowed || false,
            dogsOnLeash: parkFeatures?.dogsOnLeash || false,
            noPets: parkFeatures?.noPets || false,
            shadedAreas: parkFeatures?.shadedAreas || false,
            benchesSeating: parkFeatures?.benchesSeating || false,
            softGround: parkFeatures?.softGround || false,
            hours: hours || "",
          }
        : {}),

      ...(type === "place_of_worship" && worshipFeatures
        ? {
            sensoryFriendlyService: worshipFeatures.sensoryFriendlyService || false,
            quietCryRoom: worshipFeatures.quietCryRoom || false,
            flexibleSeating: worshipFeatures.flexibleSeating || false,
            sensoryKits: worshipFeatures.sensoryKits || false,
            serviceTimes: serviceTimes || "",
            denomination: denomination || "",
          }
        : {}),

      ...(type === "venue" ? { hours: hours || "" } : {}),
    }

    const submissionData: any = {
      type,
      title,
      description,
      category: type === "place_of_worship" ? denomination || "Non-denominational" : type,
      address: `${address.street}, ${address.city}, ${address.state} ${address.zip}`,
      city: address.city,
      state: address.state,
      zip: address.zip,
      website: website || null,
      email: contactEmail || null,
      phone: phone || null,
      // Store all sensory/accessibility data as JSONB for the approval function to read
      sensory_features: payload,
      images: images || [],
      status: "pending",
      organizer_id: user.id,
      submitted_at: new Date().toISOString(),
    }

    if (type === "event") {
      submissionData.event_date = date || null
      submissionData.event_start_time = time || null
      // Store noise/lighting/crowd at top level too for backwards compatibility
      submissionData.noise_level = sensory.noiseLevel
      submissionData.lighting = sensory.lightingLevel
      submissionData.crowd_level = sensory.crowdLevel
    }

    const { data: submission, error } = await supabase.from("listings").insert(submissionData).select().single()

    if (error) {
      console.error("[v0] Database error:", error)
      return NextResponse.json({ error: "Failed to create submission", details: error.message }, { status: 500 })
    }

    // Try to send email notification (don't fail submission if this fails)
    try {
      await fetch(`${request.nextUrl.origin}/api/notify-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          listing: submission,
          submittedBy: user.email,
        }),
      })
    } catch (emailError) {
      console.error("[v0] Email notification failed:", emailError)
    }

    console.log("[v0] SUBMISSION_CREATED", {
      id: submission.id,
      type,
      title,
      submitter: user.email,
      payload: Object.keys(payload),
    })

    return NextResponse.json({ success: true, id: submission.id })
  } catch (error) {
    console.error("[v0] Submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
