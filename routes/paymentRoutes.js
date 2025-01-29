// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const stripe = require('stripe')('your-stripe-secret-key');

router.post('/checkout', async (req, res) => {
  const { token, amount } = req.body;

  try {
    const charge = await stripe.charges.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      source: token,
      description: 'Course Enrollment',
    });

    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.status(500).send('Payment failed');
  }
});

module.exports = router;