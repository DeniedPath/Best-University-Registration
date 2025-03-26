// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
let stripe;

try {
  // Initialize Stripe if the API key is available
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } else {
    console.warn('Stripe API key not found. Payment features will be limited.');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

const User = require('../models/user');
const Course = require('../models/course'); 
const Product = require('../models/product');
const { isAuthenticated } = require('../middleware/auth');

// Middleware to check if Stripe is configured
const checkStripeConfig = (req, res, next) => {
  if (!stripe) {
    return res.render('error', {
      title: 'Payment Not Available',
      message: 'Payment processing is not configured. Please contact the administrator.',
      user: req.user
    });
  }
  next();
};

// Render payment page for course enrollment
router.get('/course/:id', isAuthenticated, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor');
    if (!course) {
      return res.status(404).render('error', {
        title: 'Course Not Found',
        message: 'The requested course does not exist.',
        user: req.user
      });
    }

    // If Stripe is not configured, show a message
    if (!stripe) {
      return res.render('paymentDemo', {
        title: 'Course Payment',
        course,
        user: req.user,
        stripeNotConfigured: true
      });
    }

    res.render('coursePayment', {
      title: 'Course Payment',
      course,
      user: req.user,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Error rendering course payment page:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while processing your request.',
      user: req.user
    });
  }
});

// Process course payment
router.post('/process-course', isAuthenticated, checkStripeConfig, async (req, res) => {
  const { paymentMethodId } = req.body;
  const courseId = req.body.courseId;
  const userId = req.session.userId;

  try {
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ success: false, message: 'Course or user not found' });
    }

    // Check if already enrolled
    if (user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: course.price * 100, // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Enrollment for ${course.name}`,
      metadata: {
        courseId: course._id.toString(),
        userId: user._id.toString()
      }
    });

    // If payment is successful, enroll the user in the course
    if (paymentIntent.status === 'succeeded') {
      user.enrolledCourses.push(courseId);
      await user.save();

      // Update course enrollment count
      course.enrolled += 1;
      await course.save();

      return res.json({ success: true, message: 'Payment successful', redirectUrl: '/dashboard' });
    } else {
      return res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing course payment:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing your payment' });
  }
});

// Render shop payment page
router.get('/checkout', isAuthenticated, async (req, res) => {
  try {
    const cart = req.session.cart || [];
    
    if (cart.length === 0) {
      return res.redirect('/shop/cart');
    }

    // Fetch product details for items in cart
    const productIds = cart.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Calculate total
    let total = 0;
    const cartItems = cart.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (product) {
        const subtotal = product.price * item.quantity;
        total += subtotal;
        return {
          product,
          quantity: item.quantity,
          subtotal
        };
      }
      return null;
    }).filter(item => item !== null);

    // If Stripe is not configured, show a message
    if (!stripe) {
      return res.render('paymentDemo', {
        title: 'Shop Payment',
        cartItems,
        total,
        user: req.user,
        stripeNotConfigured: true
      });
    }

    res.render('checkout', {
      title: 'Shop Payment',
      cartItems,
      total,
      user: req.user,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY
    });
  } catch (error) {
    console.error('Error rendering shop payment page:', error);
    res.status(500).render('error', {
      title: 'Server Error',
      message: 'An error occurred while processing your request.',
      user: req.user
    });
  }
});

// Process shop payment
router.post('/process-shop', isAuthenticated, checkStripeConfig, async (req, res) => {
  const { paymentMethodId } = req.body; 
  const cart = req.session.cart || [];
  const userId = req.session.userId;

  try {
    if (cart.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch product details for items in cart
    const productIds = cart.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    
    // Calculate total
    let total = 0;
    const items = cart.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      if (product) {
        const subtotal = product.price * item.quantity;
        total += subtotal;
        return {
          product,
          quantity: item.quantity,
          subtotal
        };
      }
      return null;
    }).filter(item => item !== null);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Shop purchase`,
      metadata: {
        userId: user._id.toString(),
        items: JSON.stringify(items.map(item => ({
          productId: item.product._id.toString(),
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })))
      }
    });

    // If payment is successful, clear the cart
    if (paymentIntent.status === 'succeeded') {
      req.session.cart = [];

      // Update product stock (in a real app, you'd want to handle this in a transaction)
      for (const item of cart) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      return res.json({ success: true, message: 'Payment successful', redirectUrl: '/shop' });
    } else {
      return res.json({ success: false, message: 'Payment failed' });
    }
  } catch (error) {
    console.error('Error processing shop payment:', error);
    res.status(500).json({ success: false, message: 'An error occurred while processing your payment' });
  }
});

// Payment success page
router.get('/success', isAuthenticated, (req, res) => {
  res.render('paymentSuccess', {
    title: 'Payment Successful',
    message: req.query.type === 'course' ? 'You have successfully enrolled in the course!' : 'Your purchase was successful!',
    user: req.user
  });
});

// Payment cancel page
router.get('/cancel', isAuthenticated, (req, res) => {
  res.render('paymentCancel', {
    title: 'Payment Cancelled',
    message: 'Your payment was cancelled or failed. Please try again.',
    user: req.user
  });
});

module.exports = router;