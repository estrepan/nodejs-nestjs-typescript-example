import StripeConstructor, { Stripe } from 'stripe';

export const stripeConstructor: StripeConstructor = new StripeConstructor(
  process.env.STRIPE_API_KEY,
  {
    apiVersion: '2020-08-27',
    typescript: true,
  },
);

export { StripeConstructor, Stripe };
