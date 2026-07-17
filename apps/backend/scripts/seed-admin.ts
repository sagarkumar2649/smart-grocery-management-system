import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { env } from '../src/core/config/env.js';
import { User } from '../src/app/users/user.model.js';

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@sagarstore.com';
    const adminPassword = 'Admin@123';

    // const existingAdmin = await User.findOne({ email: adminEmail });
    // if (existingAdmin) {
    //   existingAdmin.passwordHash = await bcrypt.hash('Admin@123', 10);
    //   await existingAdmin.save();
    //   console.log('Admin password reset successfully!');
    //   process.exit(0);
    // }
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.passwordHash = await bcrypt.hash('Admin@123', 10);
      await existingAdmin.save();

      console.log('Admin password reset!');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      email: adminEmail,
      passwordHash,
      role: 'admin',
    });

    console.log('Admin user seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
