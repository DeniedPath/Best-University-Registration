const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    enum: ['Apparel', 'Supplies', 'Textbooks', 'Electronics', 'Accessories', 'Other']
  },
  imageUrl: {
    type: String,
    default: '/images/default-product.jpg'
  },
  inventory: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
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
shopItemSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ShopItem = mongoose.model('ShopItem', shopItemSchema);

module.exports = ShopItem;
