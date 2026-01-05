const User = require('../models/User');
const Advertisement = require('../models/Advertisement');
const Message = require('../models/Message');

// @desc    Get vendor public profile with active ads
// @route   GET /api/vendors/:vendorId/profile
// @access  Private (any authenticated user)
const getVendorPublicProfile = async (req, res, next) => {
    try {
        const { vendorId } = req.params;

        // Get vendor info (exclude sensitive data)
        const vendor = await User.findById(vendorId)
            .select('name businessName phone email location services createdAt');

        if (!vendor) {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        // Check if user is actually a vendor
        const vendorUser = await User.findById(vendorId);
        if (vendorUser.role !== 'vendor') {
            return res.status(404).json({
                success: false,
                error: 'This user is not a vendor'
            });
        }

        // Get active advertisements from this vendor
        const now = new Date();
        const advertisements = await Advertisement.find({
            vendorId,
            status: 'active',
            $or: [
                { endDate: null },
                { endDate: { $gt: now } }
            ]
        })
            .sort('-createdAt')
            .select('title description category serviceArea image views clicks createdAt endDate contactPhone');

        res.status(200).json({
            success: true,
            data: {
                vendor: {
                    _id: vendor._id,
                    name: vendor.name,
                    businessName: vendor.businessName,
                    phone: vendor.phone,
                    email: vendor.email,
                    location: vendor.location,
                    services: vendor.services || [],
                    memberSince: vendor.createdAt
                },
                advertisements,
                totalAds: advertisements.length
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Initiate contact with vendor (from ad)
// @route   POST /api/vendors/:vendorId/contact
// @access  Private (customer only)
const initiateContact = async (req, res, next) => {
    try {
        const { vendorId } = req.params;
        const customerId = req.user._id;
        const { message, advertisementId } = req.body;

        // Verify customer role
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                error: 'Only customers can initiate contact'
            });
        }

        // Verify vendor exists
        const vendor = await User.findById(vendorId);
        if (!vendor || vendor.role !== 'vendor') {
            return res.status(404).json({
                success: false,
                error: 'Vendor not found'
            });
        }

        // Generate a unique conversation ID for ad-based contact
        // Format: customerId_vendorId_ad_advertisementId (or just direct if no ad)
        const conversationId = advertisementId
            ? `${[customerId, vendorId].sort().join('_')}_ad_${advertisementId}`
            : `${[customerId, vendorId].sort().join('_')}_direct`;

        // Check if conversation already exists
        const existingMessage = await Message.findOne({ conversationId });

        if (existingMessage) {
            // Conversation exists, just return the ID
            return res.status(200).json({
                success: true,
                data: {
                    conversationId,
                    isNew: false,
                    message: 'Conversation already exists'
                }
            });
        }

        // Create initial message if provided
        if (message && message.trim()) {
            await Message.create({
                conversationId,
                senderId: customerId,
                receiverId: vendorId,
                content: message.trim(),
                messageType: 'text'
            });
        }

        res.status(201).json({
            success: true,
            data: {
                conversationId,
                isNew: true,
                message: 'Contact initiated successfully'
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVendorPublicProfile,
    initiateContact
};
