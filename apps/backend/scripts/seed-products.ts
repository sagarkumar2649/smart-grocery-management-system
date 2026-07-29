import mongoose from 'mongoose';
import { Category } from '../src/app/categories/category.model.js';
import { Product, PRODUCT_UNITS } from '../src/app/products/product.model.js';

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not set');
  process.exit(1);
}

const productsByCategory: Record<string, Array<{
  name: string;
  brand: string;
  purchasePrice: number;
  sellingPrice: number;
  mrp: number;
  gstPercent: number;
  hsnCode: string;
  unit: string;
  stock: number;
  minimumStock: number;
}>> = {
  'grocery': [
    { name: 'Basmati Rice', brand: 'India Gate', purchasePrice: 12000, sellingPrice: 15900, mrp: 17500, gstPercent: 5, hsnCode: '10063090', unit: 'Kg', stock: 500, minimumStock: 50 },
    { name: 'Fortune Refined Oil', brand: 'Fortune', purchasePrice: 15500, sellingPrice: 18900, mrp: 20500, gstPercent: 5, hsnCode: '15121910', unit: 'Litre', stock: 200, minimumStock: 30 },
    { name: 'Tata Salt', brand: 'Tata', purchasePrice: 1200, sellingPrice: 1800, mrp: 2000, gstPercent: 0, hsnCode: '25010010', unit: 'Kg', stock: 1000, minimumStock: 100 },
    { name: 'Aashirvaad Atta', brand: 'Aashirvaad', purchasePrice: 2500, sellingPrice: 3400, mrp: 3700, gstPercent: 5, hsnCode: '11010000', unit: 'Kg', stock: 800, minimumStock: 80 },
    { name: 'Toor Dal', brand: 'Tata Sampann', purchasePrice: 7000, sellingPrice: 9200, mrp: 10500, gstPercent: 5, hsnCode: '07131020', unit: 'Kg', stock: 300, minimumStock: 40 },
  ],
  'beverages': [
    { name: 'Coca-Cola 2L', brand: 'Coca-Cola', purchasePrice: 4500, sellingPrice: 5500, mrp: 6500, gstPercent: 28, hsnCode: '22021010', unit: 'Bottle', stock: 400, minimumStock: 50 },
    { name: 'Pepsi 500ml', brand: 'Pepsi', purchasePrice: 1800, sellingPrice: 2500, mrp: 3000, gstPercent: 28, hsnCode: '22021010', unit: 'Bottle', stock: 600, minimumStock: 60 },
    { name: 'Tata Tea Premium', brand: 'Tata Tea', purchasePrice: 12000, sellingPrice: 15500, mrp: 17500, gstPercent: 5, hsnCode: '09021010', unit: 'Packet', stock: 200, minimumStock: 25 },
    { name: 'Nescafe Classic', brand: 'Nestlé', purchasePrice: 25000, sellingPrice: 32900, mrp: 37500, gstPercent: 18, hsnCode: '21013000', unit: 'Packet', stock: 150, minimumStock: 20 },
    { name: 'Bisleri Water 1L', brand: 'Bisleri', purchasePrice: 1000, sellingPrice: 1500, mrp: 2000, gstPercent: 18, hsnCode: '22011000', unit: 'Bottle', stock: 1000, minimumStock: 100 },
  ],
  'snacks': [
    { name: 'Lays Classic Chips', brand: 'Lays', purchasePrice: 1000, sellingPrice: 1500, mrp: 2000, gstPercent: 18, hsnCode: '21041000', unit: 'Packet', stock: 800, minimumStock: 80 },
    { name: 'Parle-G Biscuit', brand: 'Parle', purchasePrice: 1000, sellingPrice: 1500, mrp: 2000, gstPercent: 5, hsnCode: '19051000', unit: 'Packet', stock: 1000, minimumStock: 100 },
    { name: 'Haldiram Bhujia', brand: 'Haldiram\'s', purchasePrice: 2500, sellingPrice: 3500, mrp: 4000, gstPercent: 12, hsnCode: '20081930', unit: 'Packet', stock: 500, minimumStock: 50 },
    { name: 'Oreo Cookies', brand: 'Cadbury', purchasePrice: 1500, sellingPrice: 2200, mrp: 2500, gstPercent: 18, hsnCode: '19053100', unit: 'Packet', stock: 600, minimumStock: 60 },
    { name: 'Kurkure Masala Munch', brand: 'Kurkure', purchasePrice: 1000, sellingPrice: 1500, mrp: 2000, gstPercent: 18, hsnCode: '21041000', unit: 'Packet', stock: 700, minimumStock: 70 },
  ],
  'dairy': [
    { name: 'Amul Butter', brand: 'Amul', purchasePrice: 24000, sellingPrice: 30000, mrp: 34500, gstPercent: 12, hsnCode: '04051000', unit: 'Piece', stock: 200, minimumStock: 20 },
    { name: 'Amul Paneer', brand: 'Amul', purchasePrice: 3500, sellingPrice: 4500, mrp: 5000, gstPercent: 5, hsnCode: '04063000', unit: 'Packet', stock: 150, minimumStock: 20 },
    { name: 'Mother Dairy Curd', brand: 'Mother Dairy', purchasePrice: 2000, sellingPrice: 2800, mrp: 3200, gstPercent: 5, hsnCode: '04031000', unit: 'Packet', stock: 300, minimumStock: 30 },
    { name: 'Amul Gold Milk 1L', brand: 'Amul', purchasePrice: 4800, sellingPrice: 5800, mrp: 6200, gstPercent: 5, hsnCode: '04012000', unit: 'Litre', stock: 400, minimumStock: 40 },
    { name: 'Britannia Cheese Slices', brand: 'Britannia', purchasePrice: 6500, sellingPrice: 8200, mrp: 9500, gstPercent: 12, hsnCode: '04061000', unit: 'Packet', stock: 120, minimumStock: 15 },
  ],
  'bakery': [
    { name: 'Britannia Brown Bread', brand: 'Britannia', purchasePrice: 2000, sellingPrice: 2800, mrp: 3500, gstPercent: 5, hsnCode: '19059000', unit: 'Packet', stock: 300, minimumStock: 30 },
    { name: 'Britannia Cake', brand: 'Britannia', purchasePrice: 3000, sellingPrice: 4000, mrp: 4500, gstPercent: 18, hsnCode: '19059000', unit: 'Piece', stock: 200, minimumStock: 20 },
    { name: 'Modern Buns', brand: 'Modern', purchasePrice: 800, sellingPrice: 1200, mrp: 1500, gstPercent: 5, hsnCode: '19059000', unit: 'Piece', stock: 400, minimumStock: 40 },
  ],
  'personal-care': [
    { name: 'Lifebuoy Soap', brand: 'Lifebuoy', purchasePrice: 1500, sellingPrice: 2000, mrp: 2500, gstPercent: 18, hsnCode: '34011110', unit: 'Piece', stock: 500, minimumStock: 50 },
    { name: 'Dove Shampoo', brand: 'Dove', purchasePrice: 6500, sellingPrice: 8500, mrp: 9900, gstPercent: 18, hsnCode: '33051010', unit: 'Bottle', stock: 200, minimumStock: 20 },
    { name: 'Colgate Toothpaste', brand: 'Colgate', purchasePrice: 3500, sellingPrice: 4500, mrp: 5200, gstPercent: 18, hsnCode: '33061010', unit: 'Piece', stock: 400, minimumStock: 40 },
    { name: 'Ponds Talcum Powder', brand: 'Pond\'s', purchasePrice: 4500, sellingPrice: 5900, mrp: 6900, gstPercent: 18, hsnCode: '33049110', unit: 'Packet', stock: 150, minimumStock: 20 },
  ],
  'home-care': [
    { name: 'Surf Excel Detergent', brand: 'Surf Excel', purchasePrice: 18000, sellingPrice: 22900, mrp: 26900, gstPercent: 18, hsnCode: '34022010', unit: 'Box', stock: 100, minimumStock: 15 },
    { name: 'Vim Dishwash Bar', brand: 'Vim', purchasePrice: 1000, sellingPrice: 1500, mrp: 2000, gstPercent: 18, hsnCode: '34022010', unit: 'Piece', stock: 600, minimumStock: 60 },
    { name: 'Harpic Toilet Cleaner', brand: 'Harpic', purchasePrice: 2800, sellingPrice: 3800, mrp: 4500, gstPercent: 18, hsnCode: '38089910', unit: 'Bottle', stock: 250, minimumStock: 25 },
    { name: 'Exo Liquid Detergent', brand: 'Exo', purchasePrice: 7500, sellingPrice: 9900, mrp: 11500, gstPercent: 18, hsnCode: '34022010', unit: 'Bottle', stock: 120, minimumStock: 15 },
  ],
  'stationery': [
    { name: 'Classmate Notebook', brand: 'Classmate', purchasePrice: 2500, sellingPrice: 3500, mrp: 4500, gstPercent: 12, hsnCode: '48202000', unit: 'Piece', stock: 300, minimumStock: 30 },
    { name: 'Natraj Pencil Pack', brand: 'Natraj', purchasePrice: 1500, sellingPrice: 2200, mrp: 2800, gstPercent: 12, hsnCode: '96091000', unit: 'Packet', stock: 400, minimumStock: 40 },
    { name: 'Camlin Marker Set', brand: 'Camlin', purchasePrice: 3000, sellingPrice: 4200, mrp: 5000, gstPercent: 12, hsnCode: '96082000', unit: 'Box', stock: 100, minimumStock: 15 },
  ],
  'baby-care': [
    { name: 'Pampers Diapers', brand: 'Pampers', purchasePrice: 45000, sellingPrice: 54900, mrp: 64900, gstPercent: 18, hsnCode: '96190010', unit: 'Packet', stock: 80, minimumStock: 10 },
    { name: 'Johnson Baby Powder', brand: 'Johnson\'s', purchasePrice: 7500, sellingPrice: 9900, mrp: 11500, gstPercent: 18, hsnCode: '33049110', unit: 'Piece', stock: 150, minimumStock: 20 },
    { name: 'MamyPoco Pants', brand: 'MamyPoco', purchasePrice: 35000, sellingPrice: 44900, mrp: 52900, gstPercent: 18, hsnCode: '96190010', unit: 'Packet', stock: 60, minimumStock: 10 },
  ],
  'frozen-foods': [
    { name: 'Amul Vanilla Ice Cream', brand: 'Amul', purchasePrice: 12500, sellingPrice: 15900, mrp: 18500, gstPercent: 18, hsnCode: '21050000', unit: 'Packet', stock: 100, minimumStock: 15 },
    { name: 'McCain French Fries', brand: 'McCain', purchasePrice: 12000, sellingPrice: 15900, mrp: 18500, gstPercent: 5, hsnCode: '20041000', unit: 'Packet', stock: 80, minimumStock: 10 },
    { name: 'MTR Pav Bhaji', brand: 'MTR', purchasePrice: 6500, sellingPrice: 8500, mrp: 9900, gstPercent: 12, hsnCode: '21041000', unit: 'Packet', stock: 120, minimumStock: 15 },
  ],
};

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function seed() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const categories = await Category.find({ isActive: true }).lean();
  const catMap = new Map(categories.map(c => [c.slug, c._id]));

  let created = 0;
  let skipped = 0;

  for (const [slug, products] of Object.entries(productsByCategory)) {
    const catId = catMap.get(slug);
    if (!catId) {
      console.log(`  ⚠ Category "${slug}" not found — skipping its products`);
      continue;
    }

    for (const p of products) {
      const sku = toSlug(p.brand.split("'")[0]).toUpperCase() + '-' +
                  toSlug(p.name).toUpperCase() + '-' +
                  Math.random().toString(36).substring(2, 6).toUpperCase();

      const exists = await Product.findOne({ name: p.name, category: catId });
      if (exists) {
        console.log(`  → Skipping "${p.name}" (already exists)`);
        skipped++;
        continue;
      }

      await Product.create({
        name: p.name,
        sku,
        category: catId,
        brand: p.brand,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        mrp: p.mrp,
        gstPercent: p.gstPercent,
        hsnCode: p.hsnCode,
        unit: p.unit,
        stock: p.stock,
        minimumStock: p.minimumStock,
        isActive: true,
      });

      console.log(`  ✓ Created "${p.name}" (${sku})`);
      created++;
    }
  }

  console.log(`\nDone. ${created} created, ${skipped} skipped.`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
