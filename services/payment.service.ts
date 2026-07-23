import { BraintreeGateway, Environment, type Transaction } from 'braintree'

// BRAINTREE_MERCHANT_ID/PUBLIC_KEY/PRIVATE_KEY aren't configured in this
// environment yet — the gateway is built lazily inside each function (not at
// module load) so importing this file doesn't crash routes that don't call
// it, and callers get a clear error instead of a silent undefined-credential
// failure from the SDK.
function getGateway(): BraintreeGateway {
  const merchantId = process.env.BRAINTREE_MERCHANT_ID
  const publicKey = process.env.BRAINTREE_PUBLIC_KEY
  const privateKey = process.env.BRAINTREE_PRIVATE_KEY

  if (!merchantId || !publicKey || !privateKey) {
    throw new Error('Braintree is not configured — missing BRAINTREE_MERCHANT_ID/PUBLIC_KEY/PRIVATE_KEY.')
  }

  return new BraintreeGateway({
    environment: process.env.BRAINTREE_ENVIRONMENT === 'production'
      ? Environment.Production
      : Environment.Sandbox,
    merchantId,
    publicKey,
    privateKey,
  })
}

export async function getBraintreeClientToken(): Promise<string> {
  const gateway = getGateway()
  const result = await gateway.clientToken.generate({})
  return result.clientToken
}

/** Braintree's address shape (transaction.sale billing/shipping params). */
export interface BraintreeAddress {
  firstName?: string
  lastName?: string
  streetAddress?: string
  extendedAddress?: string
  locality?: string
  region?: string
  postalCode?: string
  countryCodeAlpha2?: string
}

/**
 * Payer details forwarded to Braintree so transactions are identifiable in the
 * control panel (and correlatable with our own orders) instead of showing up
 * as a bare amount. Sending billing.postalCode/streetAddress also enables AVS.
 */
export interface BraintreePayer {
  customer?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
  }
  billing?: BraintreeAddress
  shipping?: BraintreeAddress
}

/**
 * Drop blank/undefined values. Braintree validates the fields it is given, so
 * passing empty strings for optional address parts is rejected outright —
 * omitting them is the difference between a charge and a validation error.
 */
function compact<T extends object>(obj: T | undefined): T | undefined {
  if (!obj) return undefined
  const entries = Object.entries(obj).filter(([, v]) => typeof v === 'string' && v.trim() !== '')
  return entries.length ? (Object.fromEntries(entries) as T) : undefined
}

export async function chargeBraintreeCheckout(
  nonce: string,
  amount: string,
  payer: BraintreePayer = {},
): Promise<Transaction> {
  const gateway = getGateway()

  // Spread conditionally rather than assigning undefined. The SDK validates
  // against bracketed paths (`billing[firstName]`), so a present-but-undefined
  // `billing` key has no sub-keys to match and is rejected outright with
  // "These keys are invalid: billing, shipping" — the charge fails before it
  // ever reaches the gateway.
  const customer = compact(payer.customer)
  const billing = compact(payer.billing)
  const shipping = compact(payer.shipping)

  const result = await gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: { submitForSettlement: true },
    ...(customer && { customer }),
    ...(billing && { billing }),
    ...(shipping && { shipping }),
  })

  if (!result.success) {
    throw new Error(result.message || 'Payment was declined.')
  }

  return result.transaction
}
