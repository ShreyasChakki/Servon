const Message = require('../models/Message');
const Quotation = require('../models/Quotation');
const VendorConnection = require('../models/VendorConnection');

// @desc    Get all conversations for user
// @route   GET /api/chat/conversations
// @access  Private
const getConversations = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const conversations = [];

        // Get quotation-based conversations (customer-vendor)
        const quotations = await Quotation.find({
            $or: [
                { vendorId: userId },
                { customerId: userId }
            ],
            status: { $in: ['sent', 'accepted'] }
        })
            .populate('vendorId', 'name businessName role')
            .populate('customerId', 'name role')
            .populate('requestId', 'title')
            .sort('-updatedAt');

        // Build quotation conversation list
        for (const quotation of quotations) {
            const otherUser = quotation.vendorId._id.toString() === userId.toString()
                ? quotation.customerId
                : quotation.vendorId;

            const conversationId = Message.generateConversationId(
                quotation.vendorId._id,
                quotation.customerId._id,
                quotation._id
            );

            // Get last message
            const lastMessage = await Message.findOne({ conversationId })
                .sort('-createdAt')
                .lean();

            // Get unread count
            const unreadCount = await Message.countDocuments({
                conversationId,
                receiverId: userId,
                readAt: null
            });

            conversations.push({
                conversationId,
                type: 'quotation',
                quotationId: quotation._id,
                requestTitle: quotation.requestId?.title || 'Service Request',
                otherUser: {
                    _id: otherUser._id,
                    name: otherUser.businessName || otherUser.name,
                    role: otherUser.role
                },
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    isFromMe: lastMessage.senderId.toString() === userId.toString()
                } : null,
                unreadCount,
                quotationStatus: quotation.status
            });
        }

        // Get vendor connection-based conversations
        const connections = await VendorConnection.find({
            $or: [
                { requesterId: userId },
                { receiverId: userId }
            ],
            status: 'connected'
        })
            .populate('requesterId', 'name businessName role')
            .populate('receiverId', 'name businessName role');

        for (const connection of connections) {
            const otherUser = connection.requesterId._id.toString() === userId.toString()
                ? connection.receiverId
                : connection.requesterId;

            const conversationId = Message.generateConversationId(
                connection.requesterId._id,
                connection.receiverId._id,
                `conn_${connection._id}`
            );

            // Get last message
            const lastMessage = await Message.findOne({ conversationId })
                .sort('-createdAt')
                .lean();

            // Get unread count
            const unreadCount = await Message.countDocuments({
                conversationId,
                receiverId: userId,
                readAt: null
            });

            conversations.push({
                conversationId,
                type: 'connection',
                connectionId: connection._id,
                otherUser: {
                    _id: otherUser._id,
                    name: otherUser.businessName || otherUser.name,
                    role: otherUser.role
                },
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    isFromMe: lastMessage.senderId.toString() === userId.toString()
                } : null,
                unreadCount
            });
        }

        // Get direct/ad-based conversations
        // Find messages where user is sender or receiver in direct/ad conversations
        const directMessages = await Message.find({
            $or: [
                { senderId: userId },
                { receiverId: userId }
            ],
            conversationId: { $regex: /_direct$|_ad_/ }
        }).distinct('conversationId');

        for (const convId of directMessages) {
            // Skip if already added
            if (conversations.some(c => c.conversationId === convId)) continue;

            const parts = convId.split('_');
            const otherUserId = parts[0] === userId.toString() ? parts[1] : parts[0];

            const User = require('../models/User');
            const otherUser = await User.findById(otherUserId).select('name businessName role');
            if (!otherUser) continue;

            const lastMessage = await Message.findOne({ conversationId: convId })
                .sort('-createdAt')
                .lean();

            const unreadCount = await Message.countDocuments({
                conversationId: convId,
                receiverId: userId,
                readAt: null
            });

            conversations.push({
                conversationId: convId,
                type: parts[2] === 'ad' ? 'advertisement' : 'direct',
                otherUser: {
                    _id: otherUser._id,
                    name: otherUser.businessName || otherUser.name,
                    role: otherUser.role
                },
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    isFromMe: lastMessage.senderId.toString() === userId.toString()
                } : null,
                unreadCount
            });
        }

        // Sort all conversations by last message date
        conversations.sort((a, b) => {
            const aDate = a.lastMessage?.createdAt || new Date(0);
            const bDate = b.lastMessage?.createdAt || new Date(0);
            return new Date(bDate) - new Date(aDate);
        });

        res.status(200).json({
            success: true,
            data: conversations
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get messages for a conversation
// @route   GET /api/chat/:conversationId/messages
// @access  Private
const getMessages = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;

        // Verify user is part of this conversation (admins can view any conversation)
        const isAdmin = req.user.role === 'admin';
        const firstMessage = await Message.findOne({ conversationId });
        if (firstMessage && !isAdmin) {
            const isParticipant =
                firstMessage.senderId.toString() === userId.toString() ||
                firstMessage.receiverId.toString() === userId.toString();

            if (!isParticipant) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to view this conversation'
                });
            }
        }

        const messages = await Message.find({ conversationId })
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('senderId', 'name businessName')
            .lean();

        // Mark messages as read
        await Message.updateMany(
            { conversationId, receiverId: userId, readAt: null },
            { readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            data: messages.reverse(), // Oldest first for display
            page,
            hasMore: messages.length === limit
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message (REST fallback)
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res, next) => {
    try {
        const { quotationId, receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!quotationId || !receiverId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Please provide quotationId, receiverId, and content'
            });
        }

        // Verify chat access via quotation
        const canChat = await Message.canChat(senderId, receiverId, quotationId);
        if (!canChat) {
            return res.status(403).json({
                success: false,
                error: 'Chat access requires a valid quotation between both parties'
            });
        }

        const conversationId = Message.generateConversationId(senderId, receiverId, quotationId);

        const message = await Message.create({
            conversationId,
            quotationId,
            senderId,
            receiverId,
            content,
            messageType: 'text'
        });

        await message.populate('senderId', 'name businessName');

        // Emit via socket if available
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId.toString()).emit('newMessage', {
                conversationId,
                message
            });
        }

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:conversationId/read
// @access  Private
const markAsRead = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;

        await Message.updateMany(
            { conversationId, receiverId: userId, readAt: null },
            { readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get conversation info
// @route   GET /api/chat/:conversationId/info
// @access  Private
const getConversationInfo = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const userId = req.user._id;
        const isAdmin = req.user.role === 'admin';

        // Debug logging
        console.log('=== getConversationInfo DEBUG ===');
        console.log('Received conversationId:', conversationId);
        console.log('conversationId length:', conversationId?.length);

        // Extract context ID from conversation ID (format: id1_id2_contextId)
        // For connections: id1_id2_conn_connectionId
        // For quotations: id1_id2_quotationId
        const parts = conversationId.split('_');
        console.log('Parts after split:', parts);
        console.log('Number of parts:', parts.length);

        // Check if this is a vendor connection conversation (parts[2] === 'conn')
        if (parts[2] === 'conn' && parts[3]) {
            const connectionId = parts[3];
            const connection = await VendorConnection.findById(connectionId);

            if (!connection) {
                return res.status(404).json({
                    success: false,
                    error: 'Connection not found'
                });
            }

            // Check if user is part of this connection (admins can view any)
            const isRequester = connection.requesterId._id.toString() === userId.toString();
            const isReceiver = connection.receiverId._id.toString() === userId.toString();

            if (!isAdmin && !isRequester && !isReceiver) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized'
                });
            }

            const otherUser = isAdmin
                ? { ...connection.receiverId.toObject(), note: 'Viewing as admin' }
                : (isRequester ? connection.receiverId : connection.requesterId);

            return res.status(200).json({
                success: true,
                data: {
                    conversationId,
                    type: 'connection',
                    connectionId: connection._id,
                    otherUser: {
                        _id: otherUser._id,
                        name: otherUser.businessName || otherUser.name,
                        phone: otherUser.phone,
                        email: otherUser.email
                    },
                    myRole: 'vendor'
                }
            });
        }

        // Check if this is an ad-based or direct conversation (parts[2] === 'ad' or 'direct')
        if (parts[2] === 'ad' || parts[2] === 'direct') {
            const User = require('../models/User');

            // Get the other user from the conversation ID (parts[0] and parts[1] are user IDs)
            const userIds = [parts[0], parts[1]];
            const otherUserId = userIds.find(id => id !== userId.toString());

            const otherUser = await User.findById(otherUserId)
                .select('name businessName phone email role');

            if (!otherUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            // Verify user is part of this conversation
            if (!isAdmin && !userIds.includes(userId.toString())) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized'
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    conversationId,
                    type: parts[2] === 'ad' ? 'advertisement' : 'direct',
                    otherUser: {
                        _id: otherUser._id,
                        name: otherUser.businessName || otherUser.name,
                        phone: otherUser.phone,
                        email: otherUser.email
                    },
                    myRole: req.user.role
                }
            });
        }

        // Handle ad request-based conversation (parts[2] === 'ad')
        if (parts[2] === 'ad' && parts[3]) {
            const AdRequest = require('../models/AdRequest');
            const adRequestId = parts[3];
            const adRequest = await AdRequest.findById(adRequestId)
                .populate('vendorId', 'name businessName phone email')
                .populate('customerId', 'name phone email')
                .populate('advertisementId', 'title category serviceArea');

            if (!adRequest) {
                return res.status(404).json({
                    success: false,
                    error: 'Ad request conversation not found'
                });
            }

            // Check if user is participant (admins can view any)
            const isVendor = adRequest.vendorId._id.toString() === userId.toString();
            const isCustomer = adRequest.customerId._id.toString() === userId.toString();

            if (!isAdmin && !isVendor && !isCustomer) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized'
                });
            }

            // For admin viewing, show the vendor as "otherUser" for context
            const otherUser = isAdmin
                ? adRequest.vendorId
                : (isVendor ? adRequest.customerId : adRequest.vendorId);

            return res.status(200).json({
                success: true,
                data: {
                    conversationId,
                    type: 'ad_request',
                    adRequest: {
                        _id: adRequest._id,
                        status: adRequest.status
                    },
                    advertisement: adRequest.advertisementId,
                    otherUser: {
                        _id: otherUser._id,
                        name: otherUser.businessName || otherUser.name,
                        phone: otherUser.phone,
                        email: otherUser.email
                    },
                    myRole: isVendor ? 'vendor' : 'customer'
                }
            });
        }

        // Handle quotation-based conversation
        const quotationId = parts[2];
        const quotation = await Quotation.findById(quotationId)
            .populate('vendorId', 'name businessName phone email')
            .populate('customerId', 'name phone email')
            .populate('requestId', 'title category location');

        if (!quotation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        // Check if user is participant (admins can view any)
        const isVendor = quotation.vendorId._id.toString() === userId.toString();
        const isCustomer = quotation.customerId._id.toString() === userId.toString();

        if (!isAdmin && !isVendor && !isCustomer) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized'
            });
        }

        // For admin viewing, show the vendor as "otherUser" for context
        const otherUser = isAdmin
            ? quotation.vendorId
            : (isVendor ? quotation.customerId : quotation.vendorId);

        res.status(200).json({
            success: true,
            data: {
                conversationId,
                type: 'quotation',
                quotation: {
                    _id: quotation._id,
                    price: quotation.price,
                    status: quotation.status
                },
                request: quotation.requestId,
                otherUser: {
                    _id: otherUser._id,
                    name: otherUser.businessName || otherUser.name,
                    phone: otherUser.phone,
                    email: otherUser.email
                },
                myRole: isVendor ? 'vendor' : 'customer'
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a message between connected vendors
// @route   POST /api/chat/send-vendor
// @access  Private (Vendor)
const sendVendorMessage = async (req, res, next) => {
    try {
        const { connectionId, receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!connectionId || !receiverId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Please provide connectionId, receiverId, and content'
            });
        }

        // Verify connection exists and both vendors are connected
        const connection = await VendorConnection.findById(connectionId);
        if (!connection || connection.status !== 'connected') {
            return res.status(403).json({
                success: false,
                error: 'You must be connected with this vendor to chat'
            });
        }

        // Verify sender is part of this connection
        const isParticipant =
            connection.requesterId._id.toString() === senderId.toString() ||
            connection.receiverId._id.toString() === senderId.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to send messages in this conversation'
            });
        }

        const conversationId = Message.generateConversationId(
            connection.requesterId._id,
            connection.receiverId._id,
            `conn_${connectionId}`
        );

        const message = await Message.create({
            conversationId,
            connectionId,
            senderId,
            receiverId,
            content,
            messageType: 'text'
        });

        await message.populate('senderId', 'name businessName');

        // Emit via socket if available
        const io = req.app.get('io');
        if (io) {
            io.to(receiverId.toString()).emit('newMessage', {
                conversationId,
                message
            });
        }

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Send a direct message (customer to vendor from profile/ad)
// @route   POST /api/chat/send-direct
// @access  Private
const sendDirectMessage = async (req, res, next) => {
    try {
        const { conversationId, receiverId, content } = req.body;
        const senderId = req.user._id;

        if (!conversationId || !receiverId || !content) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Verify the conversation ID format and user is part of it
        const parts = conversationId.split('_');
        const userIds = [parts[0], parts[1]];

        if (!userIds.includes(senderId.toString())) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to send messages in this conversation'
            });
        }

        const message = await Message.create({
            conversationId,
            senderId,
            receiverId,
            content,
            messageType: 'text'
        });

        // Populate sender info
        await message.populate('senderId', 'name businessName');

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getConversations,
    getMessages,
    sendMessage,
    sendVendorMessage,
    sendDirectMessage,
    markAsRead,
    getConversationInfo
};
