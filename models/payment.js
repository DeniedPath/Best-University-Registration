const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'other'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['course_enrollment', 'shop_purchase', 'application_fee', 'other'],
    required: true
  },
  items: [{
    itemType: {
      type: String,
      enum: ['course', 'shop_item', 'application', 'other'],
      required: true
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  receiptUrl: String,
  refundReason: String,
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate a transaction ID if not provided
paymentSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000000);
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;