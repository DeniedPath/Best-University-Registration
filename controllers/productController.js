const Product = require('../models/product');
const User = require('../models/user');

// Render the shop page with all products
exports.listProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const categories = ['Textbooks', 'Stationery', 'Electronics', 'Apparel', 'Accessories', 'Other'];
    
    res.render('student/shop', { 
      title: 'University Shop',
      products,
      categories,
      user: req.session.userId ? await User.findById(req.session.userId) : null
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
};

// Render product details page
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    res.render('student/productDetails', { 
      title: product.name,
      product,
      user: req.session.userId ? await User.findById(req.session.userId) : null
    });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).send('Server error');
  }
};

// Add product to cart
exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  
  try {
    // Check if user is logged in
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Please log in to add items to cart' });
    }
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Check if quantity is valid
    const qty = parseInt(quantity) || 1;
    if (qty <= 0 || qty > product.stock) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }
    
    // Initialize cart in session if it doesn't exist
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    // Check if product already exists in cart
    const existingItemIndex = req.session.cart.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      // Update quantity if product already in cart
      req.session.cart[existingItemIndex].quantity += qty;
    } else {
      // Add new item to cart
      req.session.cart.push({
        productId,
        name: product.name,
        price: product.price,
        quantity: qty,
        imageUrl: product.imageUrl
      });
    }
    
    res.json({ success: true, message: 'Product added to cart', cartCount: req.session.cart.length });
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// View cart
exports.viewCart = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).populate('cart.product');
    
    if (!user) {
      return res.redirect('/login');
    }
    
    // Calculate total price
    let total = 0;
    user.cart.forEach(item => {
      total += item.product.price * item.quantity;
    });
    
    res.render('student/cart', { 
      title: 'Shopping Cart',
      cartItems: user.cart,
      total,
      user
    });
  } catch (error) {
    console.error('Error viewing cart:', error);
    res.status(500).send('Server error');
  }
};

// Remove item from cart
exports.removeFromCart = (req, res) => {
  const { itemIndex } = req.params;
  
  try {
    if (!req.session.cart) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }
    
    const index = parseInt(itemIndex);
    if (isNaN(index) || index < 0 || index >= req.session.cart.length) {
      return res.status(400).json({ success: false, message: 'Invalid item index' });
    }
    
    req.session.cart.splice(index, 1);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Admin: Render add product page
exports.renderAddProductPage = (req, res) => {
  res.render('admin/addProduct', { 
    title: 'Add New Product',
    user: req.user,
    activeTab: 'shop'
  });
};

// Admin: Add new product
exports.addProduct = async (req, res) => {
  const { name, description, price, category, stock, sku, imageUrl } = req.body;
  
  try {
    const newProduct = new Product({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      sku,
      imageUrl: imageUrl || '/images/default-product.jpg'
    });
    
    await newProduct.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).send('Server error');
  }
};

// Admin: Render edit product page
exports.renderEditProductPage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).send('Product not found');
    }
    
    res.render('admin/editProduct', { 
      title: 'Edit Product',
      product,
      user: req.user,
      activeTab: 'shop'
    });
  } catch (error) {
    console.error('Error fetching product for edit:', error);
    res.status(500).send('Server error');
  }
};

// Admin: Update product
exports.updateProduct = async (req, res) => {
  const { name, description, price, category, stock, sku, imageUrl, isActive } = req.body;
  
  try {
    await Product.findByIdAndUpdate(req.params.id, {
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock),
      sku,
      imageUrl: imageUrl || '/images/default-product.jpg',
      isActive: isActive === 'on'
    });
    
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Server error');
  }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect('/admin/products');
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send('Server error');
  }
};
