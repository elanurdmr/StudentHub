const STRIPE_MOCK = process.env.STRIPE_MOCK !== 'false';

export async function createPaymentIntent({ amount, currency = 'try', metadata = {} }) {
  if (STRIPE_MOCK) {
    return {
      id: `pi_mock_${Date.now()}`,
      client_secret: `pi_mock_${Date.now()}_secret_mock`,
      amount,
      currency,
      status: 'requires_payment_method',
      metadata,
    };
  }
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe.paymentIntents.create({ amount: amount * 100, currency, metadata });
}

export async function confirmPayment(paymentIntentId) {
  if (STRIPE_MOCK) {
    return { id: paymentIntentId, status: 'succeeded' };
  }
  const { default: Stripe } = await import('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe.paymentIntents.confirm(paymentIntentId);
}
