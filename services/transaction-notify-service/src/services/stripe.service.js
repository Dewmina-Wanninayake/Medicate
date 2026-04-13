/**
 * services/stripe.service.js
 * Stripe payment gateway integration
 *
 * Covers:
 *  - Create payment intent (card payments)
 *  - Confirm payment intent
 *  - Create/retrieve customers
 *  - Issue refunds
 *  - Validate webhook signatures
 */

const Stripe = require('stripe');

const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

/**
 * Create a Stripe PaymentIntent.
 *
 * @param {object} params
 * @param {number}  params.amount        Amount in smallest currency unit (cents)
 * @param {string}  params.currency      ISO currency code e.g. 'usd'
 * @param {string}  params.customerId    Stripe customer ID (optional)
 * @param {string}  params.description   Human-readable description
 * @param {object}  params.metadata      Key/value pairs stored on Stripe object
 * @returns {Promise<Stripe.PaymentIntent>}
 */
const createPaymentIntent = async ({
  amount,
  currency = 'usd',
  customerId,
  description,
  metadata = {},
}) => {
  const intentParams = {
    amount,
    currency,
    description,
    metadata,
    payment_method_types: ['card'],
    capture_method: 'automatic',
  };

  if (customerId) {
    intentParams.customer = customerId;
  }

  const paymentIntent = await stripe.paymentIntents.create(intentParams);
  return paymentIntent;
};

/**
 * Confirm a PaymentIntent with a payment method.
 *
 * @param {string} paymentIntentId
 * @param {string} paymentMethodId   Stripe payment method ID
 * @returns {Promise<Stripe.PaymentIntent>}
 */
const confirmPaymentIntent = async (paymentIntentId, paymentMethodId) => {
  return stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  });
};

/**
 * Retrieve a PaymentIntent by ID.
 */
const retrievePaymentIntent = async (paymentIntentId) => {
  return stripe.paymentIntents.retrieve(paymentIntentId);
};

/**
 * Create or retrieve a Stripe Customer for a patient.
 *
 * @param {object} params
 * @param {string}  params.email
 * @param {string}  params.name
 * @param {string}  params.phone
 * @param {string}  params.patientId   Internal patient ID stored as metadata
 * @returns {Promise<Stripe.Customer>}
 */
const createOrRetrieveCustomer = async ({ email, name, phone, patientId }) => {
  // Search for existing customer with that email
  const existing = await stripe.customers.list({ email, limit: 1 });

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return stripe.customers.create({
    email,
    name,
    phone,
    metadata: { patientId },
  });
};

/**
 * Issue a full or partial refund for a Stripe charge.
 *
 * @param {object} params
 * @param {string}  params.paymentIntentId
 * @param {number}  params.amount           Refund amount in cents (omit for full refund)
 * @param {string}  params.reason           'duplicate'|'fraudulent'|'requested_by_customer'
 * @returns {Promise<Stripe.Refund>}
 */
const createRefund = async ({ paymentIntentId, amount, reason = 'requested_by_customer' }) => {
  const refundParams = { payment_intent: paymentIntentId, reason };
  if (amount) refundParams.amount = amount;
  return stripe.refunds.create(refundParams);
};

/**
 * Validate a Stripe webhook signature and return the event.
 *
 * @param {Buffer|string} rawBody    Raw request body (must NOT be parsed)
 * @param {string}        signature  Value of stripe-signature header
 * @returns {Stripe.Event}
 */
const constructWebhookEvent = (rawBody, signature) => {
  return stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
  );
};

/**
 * List payment methods attached to a customer.
 */
const listCustomerPaymentMethods = async (customerId, type = 'card') => {
  return stripe.paymentMethods.list({ customer: customerId, type });
};

module.exports = {
  createPaymentIntent,
  confirmPaymentIntent,
  retrievePaymentIntent,
  createOrRetrieveCustomer,
  createRefund,
  constructWebhookEvent,
  listCustomerPaymentMethods,
};
