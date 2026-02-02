const mongoose = require('mongoose');
require("dotenv").config();
const User = require('./models/User');

const createAdmin = async () => {
    try {
        console.log('Starting admin creation script...');
        console.log('Attempting to connect to MongoDB...');

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/closetrush');
        console.log('MongoDB Connected');

        // Check if admin exists
        console.log('Checking for existing admin user...');
        const existingAdmin = await User.findOne({ email: 'admin@closetrush.com' });

        if (existingAdmin) {
            console.log('Admin already exists.');
            console.log('Email: admin@closetrush.com');
            console.log('Password: admin123');
        } else {
            console.log('Creating new admin user...');
            const adminUser = new User({
                username: 'superadmin',
                fullName: 'Super Admin',
                email: 'admin@closetrush.com',
                password: 'admin123', // In production, hash this!
                role: 'admin',
                isSeller: true,
                sellerStatus: 'approved'
            });

            await adminUser.save();
            console.log('Admin User Created Successfully!');
            console.log('Email: admin@closetrush.com');
            console.log('Password: admin123');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('Connection closed.');
        }
    }
};

createAdmin();
