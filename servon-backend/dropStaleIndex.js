// Script to drop stale indexes from the quotations collection
const mongoose = require('mongoose');
require('dotenv').config();

const dropStaleIndexes = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/servon');
        console.log('Connected to MongoDB');

        // Get the quotations collection
        const db = mongoose.connection.db;
        const collection = db.collection('quotations');

        // List all indexes
        console.log('\nCurrent indexes:');
        const indexes = await collection.indexes();
        indexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        // Drop the stale index that uses 'requirementId' (old field name)
        try {
            await collection.dropIndex('vendorId_1_requirementId_1');
            console.log('\n✅ Successfully dropped stale index: vendorId_1_requirementId_1');
        } catch (err) {
            if (err.code === 27) {
                console.log('\n⚠️ Index vendorId_1_requirementId_1 does not exist (already dropped)');
            } else {
                throw err;
            }
        }

        // List indexes again to confirm
        console.log('\nIndexes after cleanup:');
        const newIndexes = await collection.indexes();
        newIndexes.forEach(idx => {
            console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
        });

        console.log('\n🎉 Done! You can now send quotations.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

dropStaleIndexes();
