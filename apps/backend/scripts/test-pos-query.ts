import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(uri);
  const { Product } = await import('../src/app/products/product.model.js');
  const { Category } = await import('../src/app/categories/category.model.js');

  const filter: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } };
  const products = await Product.find(filter)
    .populate('category', 'name slug')
    .sort({ name: 1 })
    .limit(100)
    .lean();

  console.log('Products found:', products.length);
  if (products.length > 0) {
    const p = products[0] as Record<string, unknown>;
    console.log('First product:', JSON.stringify({
      name: p.name,
      isActive: p.isActive,
      stock: p.stock,
      category: p.category,
      sellingPrice: p.sellingPrice,
    }));
  }

  // Do the same as searchPOSProducts does
  const formatted = products.map((p: Record<string, unknown>) => ({
    _id: p._id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    sellingPrice: (p.sellingPrice as number) / 100,
    mrp: (p.mrp as number) / 100,
    gstPercent: p.gstPercent,
    stock: p.stock,
    unit: p.unit,
    imageUrl: p.imageUrl,
    category: p.category,
  }));

  console.log('\nFormatted first product:', JSON.stringify(formatted[0]));

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Error:', err); process.exit(1); });
