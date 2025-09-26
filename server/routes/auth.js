const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { exchangeCodeForToken, getGoogleUserInfo } = require('../utils/googleAuth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production';
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    console.log('📝 Registration request received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    console.log('📝 Processing registration for:', { name, email });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password
    });

    await user.save();
    console.log('✅ User saved to database:', user._id);

    // Generate token
    const token = generateToken(user._id);
    console.log('✅ Token generated for user:', user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });
    console.log('✅ Registration response sent');
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        preferences: req.user.preferences,
        avatar: req.user.avatar,
        picture: req.user.picture,
        isGoogleUser: req.user.isGoogleUser,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('preferences.emailNotifications').optional().isBoolean(),
  body('preferences.reminderTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('preferences.timezone').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, preferences } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (preferences) {
      updateData.preferences = { ...req.user.preferences, ...preferences };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferences: user.preferences,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id);
    
    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error during password change' });
  }
});

// @route   POST /api/auth/google
// @desc    Handle Google OAuth callback
// @access  Public
router.post('/google', async (req, res) => {
  try {
    console.log('Google OAuth request received:', req.body);
    const { code } = req.body;

    if (!code) {
      console.log('No authorization code provided');
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    console.log('Exchanging code for token...');
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code);
    console.log('Token exchange successful:', !!tokenData.access_token);
    
    if (!tokenData.access_token) {
      console.log('No access token received');
      return res.status(400).json({ message: 'Failed to get access token from Google' });
    }

    console.log('Getting user info from Google...');
    // Get user info from Google
    const googleUser = await getGoogleUserInfo(tokenData.access_token);
    console.log('User info received:', { email: googleUser.email, name: googleUser.name });
    
    if (!googleUser.email) {
      console.log('No email in user info');
      return res.status(400).json({ message: 'Failed to get user info from Google' });
    }

    console.log('Checking if user exists...');
    // Use findOneAndUpdate with upsert to handle both create and update cases
    const user = await User.findOneAndUpdate(
      { email: googleUser.email },
      {
        $set: {
          name: googleUser.name || googleUser.email.split('@')[0],
          email: googleUser.email,
          googleId: googleUser.id,
          picture: googleUser.picture,
          isGoogleUser: true
        }
      },
      { 
        upsert: true, 
        new: true,
        runValidators: true
      }
    );
    console.log('User processed:', user._id, 'isGoogleUser:', user.isGoogleUser);

    console.log('Generating JWT token...');
    // Generate JWT token
    const token = generateToken(user._id);

    console.log('Google OAuth successful, sending response');
    res.json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
        isGoogleUser: user.isGoogleUser
      }
    });

  } catch (error) {
    console.error('Google OAuth error:', error);
    
    // Handle specific MongoDB duplicate key error
    if (error.code === 11000) {
      console.log('Duplicate key error, trying to find existing user...');
      try {
        // Get user email from the request body
        const { code } = req.body;
        if (code) {
          // Exchange code for token to get user info
          const tokenData = await exchangeCodeForToken(code);
          if (tokenData.access_token) {
            const googleUser = await getGoogleUserInfo(tokenData.access_token);
            if (googleUser.email) {
              const existingUser = await User.findOne({ email: googleUser.email });
              if (existingUser) {
                const token = generateToken(existingUser._id);
                return res.json({
                  message: 'Google authentication successful (existing user)',
                  token,
                  user: {
                    id: existingUser._id,
                    name: existingUser.name,
                    email: existingUser.email,
                    picture: existingUser.picture,
                    isGoogleUser: existingUser.isGoogleUser
                  }
                });
              }
            }
          }
        }
      } catch (findError) {
        console.error('Error finding existing user:', findError);
      }
    }
    
    res.status(500).json({ 
      message: 'Server error during Google authentication',
      error: error.message 
    });
  }
});

// @route   PUT /api/auth/preferences
// @desc    Update user preferences (including email notifications)
// @access  Private
router.put('/preferences', auth, async (req, res) => {
  try {
    const { emailNotifications, reminderTime, timezone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update preferences
    if (emailNotifications !== undefined) {
      user.preferences.emailNotifications = emailNotifications;
    }
    if (reminderTime) {
      user.preferences.reminderTime = reminderTime;
    }
    if (timezone) {
      user.preferences.timezone = timezone;
    }

    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ message: 'Server error during preferences update' });
  }
});

module.exports = router;


