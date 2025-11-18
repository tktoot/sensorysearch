import { z } from "zod"

/**
 * Validation Schemas using Zod
 *
 * Provides type-safe validation for forms and API routes
 */

// Address schema
export const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().length(2, "State must be 2 characters").toUpperCase(),
  zip: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
})

// Sensory attributes schema
export const sensoryAttributesSchema = z.object({
  lowNoise: z.boolean().optional(),
  gentleLighting: z.boolean().optional(),
  crowdManaged: z.boolean().optional(),
  quietRoom: z.boolean().optional(),
  visualAids: z.boolean().optional(),
})

// URL validation helper
const urlSchema = z
  .string()
  .optional()
  .refine(
    (val) => {
      if (!val || val.trim() === "") return true
      try {
        // Allow URLs with or without protocol
        const urlToTest = val.startsWith("http") ? val : `https://${val}`
        new URL(urlToTest)
        return true
      } catch {
        return false
      }
    },
    { message: "Please enter a valid URL (e.g., example.com or https://example.com)" },
  )

// Base submission schema (common fields)
const baseSubmissionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(300, "Description must be at least 300 characters")
    .max(1000, "Description must be less than 1000 characters"),
  address: addressSchema,
  hours: z.string().optional(),
  website: urlSchema,
  contactEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  sensoryAttributes: sensoryAttributesSchema.optional(),
  images: z.array(z.string().url()).max(6, "Maximum 6 images allowed").optional(),
})

// Venue submission schema
export const venueSubmissionSchema = baseSubmissionSchema.extend({
  type: z.literal("venue"),
})

// Event submission schema
export const eventSubmissionSchema = baseSubmissionSchema.extend({
  type: z.literal("event"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
})

// Park submission schema
export const parkSubmissionSchema = baseSubmissionSchema.extend({
  type: z.literal("park"),
})

// Union of all submission types
export const submissionSchema = z.discriminatedUnion("type", [
  venueSubmissionSchema,
  eventSubmissionSchema,
  parkSubmissionSchema,
])

// Admin action schemas
export const approveListingSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
})

export const rejectListingSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  reason: z.string().min(10, "Rejection reason must be at least 10 characters").optional(),
})

// Feedback schemas
export const feedbackSubmissionSchema = z.object({
  listingId: z.string().uuid("Invalid listing ID"),
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment must be less than 500 characters"),
  visitDate: z.string().optional(),
})

// Type exports
export type VenueSubmission = z.infer<typeof venueSubmissionSchema>
export type EventSubmission = z.infer<typeof eventSubmissionSchema>
export type ParkSubmission = z.infer<typeof parkSubmissionSchema>
export type Submission = z.infer<typeof submissionSchema>
export type ApproveListingInput = z.infer<typeof approveListingSchema>
export type RejectListingInput = z.infer<typeof rejectListingSchema>
export type FeedbackSubmission = z.infer<typeof feedbackSubmissionSchema>
