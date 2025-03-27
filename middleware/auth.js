const User = require('../models/user');

// Middleware to check if user is authenticated
exports.isAuthenticated = async (req, res, next) => {
  if (req.session?.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        // Reset session expiration on each request
        req.session.cookie.maxAge = 20 * 60 * 1000; // 20 minutes
        return next();
      } else {
        req.session.destroy();
        return res.redirect('/login');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      req.session.destroy();
      return res.redirect('/login');
    }
  } else {
    return res.redirect('/login');
  }
};

// Middleware to check if user is admin
exports.isAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  if (req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).render('common/error', { 
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      user: req.user
    });
  }
};

// Middleware to check if user is faculty
exports.isFaculty = async (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  if (req.user.role === 'faculty' || req.user.role === 'admin') {
    return next();
  } else {
    return res.status(403).render('common/error', { 
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      user: req.user
    });
  }
};

// Middleware to check if user is student
exports.isStudent = async (req, res, next) => {
  if (!req.user) {
    return res.redirect('/login');
  }
  
  if (req.user.role === 'student') {
    return next();
  } else {
    return res.status(403).render('common/error', { 
      title: 'Access Denied',
      message: 'You do not have permission to access this page.',
      user: req.user
    });
  }
};

// Optional middleware to attach user to request if logged in
exports.attachUser = async (req, res, next) => {
  if (req.session?.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        // Reset session expiration on each request
        req.session.cookie.maxAge = 20 * 60 * 1000; // 20 minutes
      } else {
        req.user = null;
      }
    } catch (error) {
      console.error('Error attaching user to request:', error);
      req.user = null;
    }
  } else {
    req.user = null;
  }
  next();
};