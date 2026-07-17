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

export async function chargeBraintreeCheckout(nonce: string, amount: string): Promise<Transaction> {
  const gateway = getGateway()
  const result = await gateway.transaction.sale({
    amount,
    paymentMethodNonce: nonce,
    options: { submitForSettlement: true },
  })

  if (!result.success) {
    throw new Error(result.message || 'Payment was declined.')
  }

  return result.transaction
}
