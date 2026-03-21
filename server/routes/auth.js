import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/email.js';

const EMAIL_VERIFICATION_ENABLED = process.env.ENABLE_EMAIL_VERIFICATION === 'true';

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  businessName: user.businessName,
  phone: user.phone,
  businessType: user.businessType,
  taxRate: user.taxRate,
  onboardingCompleted: user.onboardingCompleted,
  address: user.address,
  brandColor: user.brandColor,
  templateStyle: user.templateStyle,
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, businessName, phone, businessType, taxRate } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // If verification is enabled, allow re-signup over stale unverified accounts
      if (
        EMAIL_VERIFICATION_ENABLED &&
        !existingUser.emailVerified &&
        existingUser.emailVerificationExpires &&
        existingUser.emailVerificationExpires < new Date()
      ) {
        await User.deleteOne({ _id: existingUser._id });
      } else {
        return res.status(400).json({ message: 'Email already registered' });
      }
    }

    const userData = { name, email, password, businessName, phone, businessType, taxRate };

    if (EMAIL_VERIFICATION_ENABLED) {
      userData.emailVerified = false;

      const rawToken = crypto.randomBytes(16).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      userData.emailVerificationToken = hashedToken;
      userData.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create(userData);

      try {
        await sendVerificationEmail(email, rawToken);
      } catch (emailErr) {
        console.error('[auth] Failed to send verification email:', emailErr.message);
        await User.deleteOne({ _id: user._id });
        return res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
      }

      return res.status(201).json({
        message: 'Verification email sent. Please check your inbox.',
        requiresVerification: true,
      });
    }

    // Verification disabled — current behavior
    const user = await User.create(userData);
    const token = generateToken(user._id);
    res.status(201).json({ token, user: serializeUser(user) });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (EMAIL_VERIFICATION_ENABLED && !user.emailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        requiresVerification: true,
      });
    }

    const token = generateToken(user._id);
    res.json({ token, user: serializeUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link.' });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    // Always return 200 to avoid email enumeration
    const successMsg = { message: 'If that email is registered, a new verification link has been sent.' };

    if (!email) return res.json(successMsg);

    const user = await User.findOne({ email, emailVerified: false });
    if (!user) return res.json(successMsg);

    // Cooldown: skip if last token was generated less than 60s ago
    if (
      user.emailVerificationExpires &&
      user.emailVerificationExpires.getTime() > Date.now() + 23 * 60 * 60 * 1000
    ) {
      return res.json(successMsg);
    }

    const rawToken = crypto.randomBytes(16).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, rawToken);

    res.json(successMsg);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: serializeUser(req.user) });
});

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'businessName', 'phone', 'businessType', 'taxRate',
      'address', 'brandColor', 'templateStyle', 'onboardingCompleted',
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    Object.assign(req.user, updates);
    await req.user.save();

    res.json({ user: serializeUser(req.user) });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
