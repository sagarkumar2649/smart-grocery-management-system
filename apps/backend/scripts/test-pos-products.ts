import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(uri);
  const { Product } = await import('../src/app/products/product.model.js');

  // Test 1: Count all products
  console.log('Test 1: Count all products');
  const total = await Product.countDocuments({});
  console.log('  Total products in DB:', total);

  // Test 2: Products with isActive: true, stock > 0 (POS filter)
  console.log('\nTest 2: POS filter (isActive: true, stock > 0)');
  const posCount = await Product.countDocuments({ isActive: true, stock: { $gt: 0 } });
  console.log('  Products matching POS filter:', posCount);
  if (posCount > 0) {
    const samples = await Product.find({ isActive: true, stock: { $gt: 0 } }).limit(3).lean();
    console.log('  Sample:');
    for (const s of samples) {
      console.log('    -', s.name, '| isActive:', s.isActive, '| stock:', s.stock, '| category:', s.category, '| sellingPrice:', s.sellingPrice);
    }
  }

  // Test 3: Check for products with isActive = false
  console.log('\nTest 3: isActive = false or missing');
  const inactive = await Product.countDocuments({ $or: [{ isActive: false }, { isActive: { $exists: false } }] });
  console.log('  Products not active:', inactive);

  // Test 4: Check for products with stock = 0 or missing
  console.log('\nTest 4: stock = 0 or missing');
  const noStock = await Product.countDocuments({ $or: [{ stock: { $lte: 0 } }, { stock: { $exists: false } }] });
  console.log('  Products with no stock:', noStock);

  // Test 5: Check text index exists
  console.log('\nTest 5: Text index check');
  try {
    await Product.find({ $text: { $search: 'test' } }).limit(1).lean();
    console.log('  ✓ Text index works');
  } catch (e: unknown) {
    const msg = (e as Error).message;
    if (msg.includes('index') || msg.includes('text')) {
      console.log('  ✗ Text index missing');
    } else {
      console.log('  ✗ Error:', msg);
    }
  }

  // Test 6: Populate category check
  console.log('\nTest 6: Category population');
  const withCat = await Product.findOne({ isActive: true, stock: { $gt: 0 } }).populate('category', 'name slug').lean();
  if (withCat) {
    console.log('  Category field:', JSON.stringify(withCat.category));
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Script failed:', err); process.exit(1); });
