import Stripe from 'stripe';
import { storage } from '../storage.js';

// Initialize Stripe - will use env variable in production
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
});

// Price IDs from your Stripe dashboard
const SUBSCRIPTION_PRICES = {
  'Basic': 'price_id_for_basic',
  'Premium': 'price_id_for_premium',
  'Enterprise': 'price_id_for_enterprise'
};

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan } = req.body;
    
    if (!SUBSCRIPTION_PRICES[plan]) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: SUBSCRIPTION_PRICES[plan],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/subscription-plans`,
      client_reference_id: userId.toString(),
      customer_email: user.email,
      metadata: {
        userId: userId.toString(),
        plan
      }
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
};

/**
 * Note: Subscription functionality has been removed.
 * This is just a stub that returns a success response.
 */
export const handleWebhook = async (req, res) => {
  res.json({ received: true, message: "Subscription functionality removed" });
}; 