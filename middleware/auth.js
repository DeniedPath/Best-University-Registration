const User = require('../models/User');

module.exports = async (req, res, next) => {
  if (req.session?.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      } else {
        req.user = null;
        return res.status(401).send('User not authenticated');
      }
    } catch (error) {
      console.error('Error attaching user to request:', error);
      req.user = null;
      return res.status(500).send('Server error');
    }
  } else {
    req.user = null;
    return res.status(401).send('User not authenticated');
  }
};