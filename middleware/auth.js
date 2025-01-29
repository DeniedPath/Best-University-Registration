const User = require('../models/User');

const attachUser = async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
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

module.exports = attachUser;