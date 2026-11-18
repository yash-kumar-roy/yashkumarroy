import 'dotenv/config';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { seedProjects } from '../data/projectsSeedData.js';
import { connectWithDnsFallback } from '../config/db.js';

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('\n❌ Error: MONGODB_URI is not defined in .env.');
    console.log('Please add MONGODB_URI to your .env file before running seed.\n');
    process.exit(1);
  }

  try {
    console.log('\nConnecting to MongoDB...');
    await connectWithDnsFallback(uri.trim());
    console.log(`Connected to: ${mongoose.connection.host} (${mongoose.connection.name})`);

    console.log(`\nUpserting ${seedProjects.length} portfolio projects...`);
    const operations = seedProjects.map((project) => ({
      updateOne: {
        filter: { slug: project.slug },
        update: { $setOnInsert: project }, // never overwrite admin edits
        upsert: true,
      },
    }));

    const result = await Project.bulkWrite(operations);
    console.log('✅ Seeding completed successfully!');
    console.log(`- Matched: ${result.matchedCount}`);
    console.log(`- Modified: ${result.modifiedCount}`);
    console.log(`- Upserted: ${result.upsertedCount}`);

    const total = await Project.countDocuments();
    console.log(`- Total projects now in MongoDB: ${total}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

runSeed();
