import connectDB from './config/db.js';
import File from './models/file.model.js';
import fs from 'fs/promises';

connectDB();

// Get all records older than 24 hours 
async function fetchData() {
    try {
        const files = await File.find({ createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
        if (files.length) {
            for (const file of files) {
                try {
                    await fs.unlink(file.path);
                    await file.remove();
                    console.log(`Successfully deleted ${file.filename}`);
                } catch (err) {
                    console.log(`Error while deleting file: ${err}`);
                }
            }
        }
        console.log('Job done!');
    } catch (err) {
        console.error(`Error fetching data: ${err}`);
    }
}

fetchData().then(() => process.exit());
