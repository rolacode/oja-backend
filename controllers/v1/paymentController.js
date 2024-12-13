const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const config = require('../../config/config');
const Order = require('../../models/Order');


const createPayment = async (req, res) => {
  try {
    const { order_id, payment_method, amount } = req.body;

    // Validate order
    const order = await Order.findById(order_id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Amount in cents
        currency: 'usd',                 // Set your currency
        payment_method_types: [payment_method], // Example: ['card']
        metadata: { order_id },          // Attach metadata
    });

    res.status(201).json({
        client_secret: paymentIntent.client_secret, // Client-side needs this
        status: paymentIntent.status,
    });
    console.log('Stripe Secret Key:', process.env.STRIPE_SECRET);

  } catch (err) {
      res.status(500).json({ error: err.message });
  }
};

// @desc Create Checkout
// @route POST /v1/payment/checkout
// @access Public
// const createCheckoutHandler = async (req, res) => {
//   const { amount, currency, paymentMethodId } = req.body;

//   try {
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount,
//       currency,
//       payment_method: paymentMethodId,
//       confirm: true,
//     });
//     res.json(paymentIntent);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


module.exports = {
  createPayment,
  // createCheckoutHandler,
};
