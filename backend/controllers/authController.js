import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        settings: user.settings,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      profile,
      onboardingCompleted,
      onboardingStep,
      settings
    } = req.body;

    if (name) user.name = name;
    if (typeof onboardingCompleted === 'boolean') user.onboardingCompleted = onboardingCompleted;
    if (typeof onboardingStep === 'number') user.onboardingStep = onboardingStep;

    if (profile) {
      user.profile = {
        ...user.profile.toObject(),
        ...profile,
      };
    }

    if (settings) {
      user.settings = {
        ...user.settings.toObject(),
        ...settings,
      };
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile,
      onboardingCompleted: updatedUser.onboardingCompleted,
      onboardingStep: updatedUser.onboardingStep,
      settings: updatedUser.settings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not disclose whether user exists for security
      return res.json({ message: 'If that email exists, password reset instructions have been sent.' });
    }
    // Return success response with reset token simulation
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot', { expiresIn: '1h' });
    res.json({
      message: 'Password reset link generated successfully.',
      resetToken, // Provided for user verification / testing flow
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeyforinterviewcopilot');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Invalid token or user not found' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password has been updated successfully. You can now login.' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired password reset token' });
  }
};
