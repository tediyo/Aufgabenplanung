const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Try JWT token first
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const userEmail = req.header('X-User-Email');
    
    if (token && token !== 'demo-token') {
      // Use JWT authentication
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Token is not valid' });
      }

      req.user = user;
      next();
    } else if (userEmail) {
      // Use email-based authentication for demo
      let user = await User.findOne({ email: userEmail });
      
      if (!user) {
        // Create a demo user if it doesn't exist
        user = new User({
          name: userEmail.split('@')[0],
          email: userEmail,
          password: 'demo-password',
          isGoogleUser: userEmail.includes('gmail.com')
        });
        await user.save();
        console.log('Created demo user:', userEmail);
      }
      
      req.user = user;
      next();
    } else {
      return res.status(401).json({ message: 'No authentication provided' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

module.exports = { auth, optionalAuth };


