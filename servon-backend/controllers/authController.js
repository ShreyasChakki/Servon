const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
    try {
        const { name, email, password, role, phone, location, businessName, businessCategory } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Validate role
        if (role && !['customer', 'vendor'].includes(role)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid role. Must be customer or vendor'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            phone,
            location,
            businessName: role === 'vendor' ? businessName : undefined,
            businessCategory: role === 'vendor' ? businessCategory : undefined
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                businessName: user.businessName,
                businessCategory: user.businessCategory,
                avatar: user.avatar,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Please provide email and password'
            });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                location: user.location,
                businessName: user.businessName,
                businessCategory: user.businessCategory,
                avatar: user.avatar,
                token
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
    try {
        const fieldsToUpdate = {
            name: req.body.name,
            phone: req.body.phone,
            location: req.body.location,
            businessName: req.body.businessName,
            businessCategory: req.body.businessCategory,
            avatar: req.body.avatar
        };

        // Remove undefined fields
        Object.keys(fieldsToUpdate).forEach(key =>
            fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
        );

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    updateProfile
};
