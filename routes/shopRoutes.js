// routes/shopRoutes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', productController.listProducts);
router.get('/product/:id', productController.getProductDetails);

// Cart routes (require authentication)
router.post('/cart/add', isAuthenticated, productController.addToCart);
router.get('/cart', isAuthenticated, productController.viewCart);
router.delete('/cart/remove/:itemIndex', isAuthenticated, productController.removeFromCart);

// Admin routes
router.get('/admin/products', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const products = await Product.find();
    res.render('adminProducts', { 
      title: 'Manage Products',
      products,
      user: req.session.userId ? await User.findById(req.session.userId) : null
    });
  } catch (error) {
    console.error('Error fetching products for admin:', error);
    res.status(500).send('Server error');
  }
});

router.get('/admin/products/add', isAuthenticated, isAdmin, productController.renderAddProductPage);
router.post('/admin/products/add', isAuthenticated, isAdmin, productController.addProduct);
router.get('/admin/products/edit/:id', isAuthenticated, isAdmin, productController.renderEditProductPage);
router.post('/admin/products/edit/:id', isAuthenticated, isAdmin, productController.updateProduct);
router.post('/admin/products/delete/:id', isAuthenticated, isAdmin, productController.deleteProduct);

module.exports = router;
