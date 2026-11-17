const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const config = require('../config/env');

// @desc    Get user profile & statistics
// @route   GET /api/v1/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const totalTransactions = await Transaction.countDocuments({ userId: req.user._id });
    const holdingsCount = await Holding.countDocuments({ userId: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        virtualBalance: user.virtualBalance,
        createdAt: user.createdAt,
        stats: {
          totalTransactions,
          holdingsCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/v1/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email } = req.body;
    if (name) user.name = name.trim();
    if (email && email.toLowerCase() !== user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use by another account'
        });
      }
      user.email = email.toLowerCase().trim();
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        virtualBalance: updatedUser.virtualBalance,
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/v1/users/change-password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new passwords'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset virtual balance to initial ₹10,00,000 for learning
// @route   POST /api/v1/users/reset-balance
// @access  Private
const resetBalance = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { virtualBalance: config.INITIAL_VIRTUAL_BALANCE },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Virtual balance has been reset to ₹10,00,000',
      data: {
        virtualBalance: user.virtualBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  resetBalance
};
