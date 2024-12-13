require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../../models/Order');

// Webhook handler
const WebhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
        const event = stripe.webhooks.constructEvent(
            req.rawBody,              // Raw request body
            sig,                      // Stripe signature
            process.env.STRIPE_WEBHOOK_SECRET // Secret from Stripe Dashboard
        );

        // Handle specific events
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                const orderId = paymentIntent.metadata.order_id;

                // Update order status in the database
                await Order.findByIdAndUpdate(orderId, { status: 'Paid' });
                console.log(`Order ${orderId} marked as paid.`);
                break;

            case 'payment_intent.payment_failed':
                console.error('Payment failed:', event.data.object);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.status(200).send('Webhook received');
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        res.status(400).send(`Webhook Error: ${err.message}`);
    }
};


module.exports = { WebhookHandler, };