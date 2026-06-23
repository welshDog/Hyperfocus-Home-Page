import Stripe from 'stripe'

const key = process.env.STRIPE_SECRET_KEY

/** True when STRIPE_SECRET_KEY is set. Routes use this to fail gracefully
 *  with a clear message instead of throwing during checkout. */
export const isStripeConfigured = Boolean(key)

/** Stripe client, or null when unconfigured (server-only). */
export const stripe = key ? new Stripe(key) : null
