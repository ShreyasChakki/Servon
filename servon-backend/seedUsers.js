/**
 * User Seed Script
 * Creates test users for all roles (customer, vendor, admin)
 * 
 * Usage: node seedUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Wallet = require('./models/Wallet');
const connectDB = require('./config/db');

const TEST_USERS = [
    {
        name: 'Admin User',
        email: 'admin@servon.com',
        password: 'admin123',
        role: 'admin',
        phone: '9999999999',
        location: 'Mumbai'
    },
    {
        name: 'John Customer',
        email: 'customer@servon.com',
        password: 'customer123',
        role: 'customer',
        phone: '9876543210',
        location: 'Bangalore'
    },
    {
        name: 'Sarah Customer',
        email: 'customer2@servon.com',
        password: 'customer123',
        role: 'customer',
        phone: '9876543211',
        location: 'Delhi'
    },
    {
        name: 'Mike Vendor',
        email: 'vendor@servon.com',
        password: 'vendor123',
        role: 'vendor',
        phone: '9123456789',
        location: 'Mumbai',
        businessName: 'Mike\'s Plumbing Services',
        businessCategory: 'Home Services',
        serviceCategories: ['Plumbing', 'Repair']
    },
    {
        name: 'Lisa Vendor',
        email: 'vendor2@servon.com',
        password: 'vendor123',
        role: 'vendor',
        phone: '9123456788',
        location: 'Bangalore',
        businessName: 'Lisa\'s Cleaning Co',
        businessCategory: 'Cleaning',
        serviceCategories: ['House Cleaning', 'Office Cleaning']
    },
    {
        name: 'David Vendor',
        email: 'vendor3@servon.com',
        password: 'vendor123',
        role: 'vendor',
        phone: '9123456787',
        location: 'Pune',
        businessName: 'David\'s Electrical Solutions',
        businessCategory: 'Electrical',
        serviceCategories: ['Electrical Repair', 'Installation']
    }
];

const seedUsers = async () => {
    try {
        // Connect to database
        await connectDB();
        console.log('📦 Connected to MongoDB\n');

        // Clear existing users (optional - comment out if you want to keep existing data)
        // await User.deleteMany({});
        // await Wallet.deleteMany({});
        // console.log('🗑️  Cleared existing users\n');

        console.log('👥 Creating test users...\n');
        const createdUsers = [];

        for (const userData of TEST_USERS) {
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ email: userData.email });
                if (existingUser) {
                    console.log(`⚠️  User already exists: ${userData.email} (${userData.role})`);
                    createdUsers.push(userData);
                    continue;
                }

                // Create user
                const user = await User.create(userData);

                // Create wallet for the user
                await Wallet.create({
                    user: user._id,
                    balance: userData.role === 'vendor' ? 1000 : 500 // Vendors get more initial balance
                });

                console.log(`✅ Created: ${userData.email} (${userData.role})`);
                createdUsers.push(userData);
            } catch (error) {
                console.log(`❌ Error creating ${userData.email}: ${error.message}`);
            }
        }

        // Display credentials
        console.log('\n' + '='.repeat(60));
        console.log('🎉 SEED COMPLETE - TEST USER CREDENTIALS');
        console.log('='.repeat(60) + '\n');

        console.log('📧 ADMIN CREDENTIALS:');
        console.log('   Email: admin@servon.com');
        console.log('   Password: admin123\n');

        console.log('📧 CUSTOMER CREDENTIALS:');
        console.log('   Email: customer@servon.com');
        console.log('   Password: customer123');
        console.log('   ---');
        console.log('   Email: customer2@servon.com');
        console.log('   Password: customer123\n');

        console.log('📧 VENDOR CREDENTIALS:');
        console.log('   Email: vendor@servon.com');
        console.log('   Password: vendor123');
        console.log('   Business: Mike\'s Plumbing Services');
        console.log('   ---');
        console.log('   Email: vendor2@servon.com');
        console.log('   Password: vendor123');
        console.log('   Business: Lisa\'s Cleaning Co');
        console.log('   ---');
        console.log('   Email: vendor3@servon.com');
        console.log('   Password: vendor123');
        console.log('   Business: David\'s Electrical Solutions\n');

        console.log('='.repeat(60));
        console.log('⚠️  IMPORTANT: Change passwords in production!');
        console.log('='.repeat(60) + '\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding users:', error.message);
        process.exit(1);
    }
};

seedUsers();
