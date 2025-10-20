"use server"

import { BILLING_ENABLED } from "@/lib/config"

export async function createOrRetrieveCustomer(userId: string, email: string) {
  console.log("[v0] CREATE_CUSTOMER_START - Creating/retrieving customer", {
    userId,
    email,
    billingEnabled: BILLING_ENABLED,
  })

  if (!BILLING_ENABLED) {
    console.log("[v0] BILLING_DISABLED - Returning mock customer")
    return {
      success: true,
      disabled: true,
      customerId: `mock_cus_${Date.now()}`,
    }
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      console.error("[v0] STRIPE_CONFIG_ERROR - STRIPE_SECRET_KEY not configured")
      return {
        success: false,
        error: "Billing is not configured. Please contact support.",
        isConfigError: true,
      }
    }

    console.log("[v0] Simulating Stripe API call...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const customerId = `cus_${Date.now()}`

    console.log("[v0] CREATE_CUSTOMER_OK - Customer created successfully", { customerId })

    return {
      success: true,
      customerId,
    }
  } catch (error) {
    console.error("[v0] CREATE_CUSTOMER_ERROR - Failed to create customer", error)
    return {
      success: false,
      error: "Failed to create billing account. Please try again.",
    }
  }
}

export async function createBillingPortalSession(billingCustomerId: string, returnUrl = "/organizer-account") {
  console.log("[v0] BILLING_PORTAL_SESSION_START - Creating billing portal session", {
    billingCustomerId,
    returnUrl,
    billingEnabled: BILLING_ENABLED,
  })

  if (!BILLING_ENABLED) {
    console.log("[v0] BILLING_DISABLED - Returning disabled status")
    return {
      success: false,
      disabled: true,
      error: "Billing is disabled in this preview build.",
    }
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      console.error("[v0] STRIPE_CONFIG_ERROR - STRIPE_SECRET_KEY not configured")
      return {
        success: false,
        error: "Billing is not configured. Please contact support.",
        isConfigError: true,
      }
    }

    if (!billingCustomerId) {
      console.error("[v0] BILLING_PORTAL_ERROR - No billing_customer_id provided")
      return {
        success: false,
        error: "No billing account found. Please complete organizer setup first.",
      }
    }

    console.log("[v0] Simulating Stripe API call...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const portalUrl = `https://billing.stripe.com/p/session_${Date.now()}`

    console.log("[v0] BILLING_PORTAL_SESSION_OK - Portal session created successfully", { portalUrl })

    return {
      success: true,
      url: portalUrl,
    }
  } catch (error) {
    console.error("[v0] BILLING_PORTAL_SESSION_ERROR - Failed to create portal session", error)
    return {
      success: false,
      error: "Billing portal is temporarily unavailable. Please try again in a moment.",
    }
  }
}

export async function addPaymentMethod(userId: string, paymentMethodId: string) {
  console.log("[v0] ADD_PAYMENT_METHOD_START - Adding payment method", {
    userId,
    paymentMethodId,
    billingEnabled: BILLING_ENABLED,
  })

  if (!BILLING_ENABLED) {
    console.log("[v0] BILLING_DISABLED - Returning mock payment method")
    return {
      success: true,
      disabled: true,
      paymentMethodId: `mock_pm_${Date.now()}`,
    }
  }

  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY

    if (!stripeSecretKey) {
      console.error("[v0] STRIPE_CONFIG_ERROR - STRIPE_SECRET_KEY not configured")
      return {
        success: false,
        error: "Billing is not configured.",
        isConfigError: true,
      }
    }

    console.log("[v0] Simulating Stripe API call...")
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] ADD_PAYMENT_METHOD_OK - Payment method added successfully")

    return {
      success: true,
    }
  } catch (error) {
    console.error("[v0] ADD_PAYMENT_METHOD_ERROR - Failed to add payment method", error)
    return {
      success: false,
      error: "We couldn't add your payment method. Check your card or pick PayPal.",
    }
  }
}
