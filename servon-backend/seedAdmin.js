/**
 * Admin Seed Script
 * Creates the initial admin user if none exists
 * 
 * Usage: npm run seed:admin
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

const ADMIN_CONFIG = {
    name: 'Admin',
    email: 'admin@servon.com',
    password: 'admin123',  // Change this in production!
    role: 'admin',
    phone: '9999999999',
    location: 'Mumbai'
};

const seedAdmin = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('📦 Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            console.log('⚠️  Admin user already exists:', existingAdmin.email);
            console.log('    No new admin created.');
            process.exit(0);
        }

        // Check if email is already taken
        const emailExists = await User.findOne({ email: ADMIN_CONFIG.email });
        if (emailExists) {
            console.log('⚠️  Email already exists. Updating role to admin...');
            emailExists.role = 'admin';
            await emailExists.save();
            console.log('✅ User upgraded to admin:', emailExists.email);
            process.exit(0);
        }

        // Create new admin user
        const admin = await User.create(ADMIN_CONFIG);

        console.log('');
        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('   📧 Email:', ADMIN_CONFIG.email);
        console.log('   🔑 Password:', ADMIN_CONFIG.password);
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
};

seedAdmin();
