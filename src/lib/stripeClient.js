import { loadStripe } from '@stripe/stripe-js'

let stripePromise

// Lazily initialize — loadStripe is only called the first time and only
// when the ACH payment flow is actually mounted, not on every page load.
export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}
