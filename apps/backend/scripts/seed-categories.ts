import mongoose from 'mongoose';
import { env } from '../src/core/config/env.js';
import { Category } from '../src/app/categories/category.model.js';

const DEFAULT_CATEGORIES = [
  { name: 'Grocery',       description: 'Everyday staples like rice, flour, pulses, and oils' },
  { name: 'Beverages',     description: 'Juices, cold drinks, water, tea, coffee, and health drinks' },
  { name: 'Snacks',        description: 'Chips, biscuits, namkeen, and ready-to-eat snacks' },
  { name: 'Dairy',         description: 'Milk, curd, paneer, butter, cheese, and ghee' },
  { name: 'Bakery',        description: 'Bread, buns, cakes, rusks, and pastries' },
  { name: 'Personal Care', description: 'Soaps, shampoos, skincare, oral care, and grooming products' },
  { name: 'Home Care',     description: 'Detergents, dish wash, floor cleaners, and air fresheners' },
  { name: 'Stationery',    description: 'Pens, notebooks, files, and office supplies' },
  { name: 'Baby Care',     description: 'Baby food, diapers, wipes, and baby hygiene products' },
  { name: 'Frozen Foods',  description: 'Ice cream, frozen vegetables, parathas, and ready meals' },
];

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let created = 0;
    let skipped = 0;

    for (const cat of DEFAULT_CATEGORIES) {
      const slug = toSlug(cat.name);
      const exists = await Category.findOne({ slug });

      if (exists) {
        console.log(`  → Skipping "${cat.name}" (already exists)`);
        skipped++;
        continue;
      }

      await Category.create({ name: cat.name, slug, description: cat.description, isActive: true });
      console.log(`  ✓ Created "${cat.name}"`);
      created++;
    }

    console.log(`\nDone. ${created} created, ${skipped} skipped.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
