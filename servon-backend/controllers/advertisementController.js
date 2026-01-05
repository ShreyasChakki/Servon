const Advertisement = require('../models/Advertisement');
const Wallet = require('../models/Wallet');

// @desc    Create new advertisement (with payment)
// @route   POST /api/advertisements
// @access  Private (Vendor)
const createAdvertisement = async (req, res, next) => {
    try {
        const { title, description, category, serviceArea, contactPhone, budget } = req.body;
        const vendorId = req.user._id;

        // Validate budget
        if (!budget || budget < 10) {
            return res.status(400).json({
                success: false,
                error: 'Minimum ad budget is ₹10'
            });
        }

        // Check wallet balance
        const wallet = await Wallet.getOrCreateWallet(vendorId);
        if (wallet.balance < budget) {
            return res.status(400).json({
                success: false,
                error: `Insufficient wallet balance. You have ₹${wallet.balance} but need ₹${budget}`
            });
        }

        // Deduct from wallet
        await wallet.deductFunds(budget, `Ad created: ${title}`, null, 'Advertisement');

        // Calculate end date based on budget
        const startDate = new Date();
        const endDate = Advertisement.calculateEndDate(budget, startDate);
        const durationDays = Advertisement.getDurationDays(budget);

        // Create advertisement
        const advertisement = await Advertisement.create({
            vendorId,
            title,
            description,
            category,
            serviceArea,
            contactPhone,
            image: req.body.image || null,
            budget,
            startDate,
            endDate,
            status: 'active'
        });

        res.status(201).json({
            success: true,
            data: advertisement,
            newBalance: wallet.balance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get vendor's advertisements
// @route   GET /api/advertisements/my
// @access  Private (Vendor)
const getMyAdvertisements = async (req, res, next) => {
    try {
        const vendorId = req.user._id;

        const advertisements = await Advertisement.find({ vendorId })
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: advertisements.length,
            data: advertisements
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get active advertisements (for customers)
// @route   GET /api/advertisements
// @access  Public
const getActiveAdvertisements = async (req, res, next) => {
    try {
        const { category, limit = 10 } = req.query;

        // Only show active ads that haven't expired
        const query = {
            status: 'active',
            $or: [
                { endDate: null },
                { endDate: { $gt: new Date() } }
            ]
        };
        if (category) {
            query.category = category;
        }

        const advertisements = await Advertisement.find(query)
            .sort('-createdAt')
            .limit(parseInt(limit));

        res.status(200).json({
            success: true,
            count: advertisements.length,
            data: advertisements
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single advertisement
// @route   GET /api/advertisements/:id
// @access  Public
const getAdvertisement = async (req, res, next) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        // Only increment view count if the viewer is NOT the owner
        // (vendor editing their own ad shouldn't count as a view)
        const viewerUserId = req.user?._id?.toString();
        const ownerUserId = advertisement.vendorId?._id?.toString() || advertisement.vendorId?.toString();

        if (!viewerUserId || viewerUserId !== ownerUserId) {
            advertisement.views += 1;
            await advertisement.save();
        }

        res.status(200).json({
            success: true,
            data: advertisement
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update advertisement
// @route   PUT /api/advertisements/:id
// @access  Private (Vendor - owner only)
const updateAdvertisement = async (req, res, next) => {
    try {
        const { title, description, serviceArea, contactPhone, status } = req.body;
        const vendorId = req.user._id;

        let advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        // Check ownership
        if (advertisement.vendorId._id.toString() !== vendorId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to update this advertisement'
            });
        }

        // Update fields
        if (title) advertisement.title = title;
        if (description) advertisement.description = description;
        if (serviceArea) advertisement.serviceArea = serviceArea;
        if (contactPhone) advertisement.contactPhone = contactPhone;
        if (req.body.image !== undefined) advertisement.image = req.body.image;
        if (status && ['active', 'paused'].includes(status)) {
            advertisement.status = status;
        }

        await advertisement.save();

        res.status(200).json({
            success: true,
            data: advertisement
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete advertisement
// @route   DELETE /api/advertisements/:id
// @access  Private (Vendor - owner only)
const deleteAdvertisement = async (req, res, next) => {
    try {
        const vendorId = req.user._id;

        const advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        // Check ownership
        if (advertisement.vendorId._id.toString() !== vendorId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to delete this advertisement'
            });
        }

        await advertisement.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Advertisement deleted'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Record ad click
// @route   POST /api/advertisements/:id/click
// @access  Public
const recordClick = async (req, res, next) => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            return res.status(404).json({
                success: false,
                error: 'Advertisement not found'
            });
        }

        advertisement.clicks += 1;
        await advertisement.save();

        res.status(200).json({
            success: true,
            message: 'Click recorded'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createAdvertisement,
    getMyAdvertisements,
    getActiveAdvertisements,
    getAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    recordClick
};
