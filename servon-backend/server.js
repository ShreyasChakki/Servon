const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const walletRoutes = require('./routes/walletRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const advertisementRoutes = require('./routes/advertisementRoutes');
const vendorNetworkRoutes = require('./routes/vendorNetworkRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/network', vendorNetworkRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/vendors', require('./routes/vendorProfileRoutes'));
app.use('/api/ad-requests', require('./routes/adRequestRoutes'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'SERVON API is running' });
});

// Error Handler (must be last)
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user's personal room
    socket.on('join', (userId) => {
        socket.userId = userId;
        socket.join(userId);
        console.log(`User ${userId} joined their room`);
    });

    // Join a specific conversation room
    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
    });

    // Leave a conversation room
    socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left conversation: ${conversationId}`);
    });

    // Handle real-time chat message
    socket.on('sendMessage', async (data) => {
        const { conversationId, receiverId, message } = data;

        // Emit to receiver's personal room
        io.to(receiverId).emit('newMessage', {
            conversationId,
            message
        });

        // Emit to conversation room
        io.to(conversationId).emit('conversationMessage', {
            conversationId,
            message
        });
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
        const { conversationId, userId, isTyping } = data;
        socket.to(conversationId).emit('userTyping', {
            conversationId,
            userId,
            isTyping
        });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 SERVON Server running on port ${PORT}`);
});

