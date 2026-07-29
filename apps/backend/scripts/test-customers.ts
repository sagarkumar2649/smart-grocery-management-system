import mongoose from 'mongoose';
const uri = process.env.MONGODB_URI!;

async function main() {
  await mongoose.connect(uri);
  const { CustomerProfile } = await import('../src/app/customers/customer.model.js');
  const { AppUser } = await import('../src/app/users/app-user.model.js');
  const { AdminSettings } = await import('../src/app/admin-settings/admin-settings.model.js');

  // Test 1: listCustomers without search
  console.log('Test 1: Customer list (no search)');
  try {
    const r = await CustomerProfile.find({}).sort({ createdAt: -1 }).skip(0).limit(20).lean();
    console.log('  ✓ OK —', r.length, 'customers');
  } catch (e: unknown) { console.error('  ✗ FAILED:', (e as Error).message); }

  // Test 2: listCustomers with text search
  console.log('Test 2: Customer list (with $text search)');
  try {
    const r = await CustomerProfile.find({ $text: { $search: 'test' } }).lean();
    console.log('  ✓ OK —', r.length, 'results');
  } catch (e: unknown) {
    const msg = (e as Error).message;
    if (msg.includes('index') || msg.includes('text')) {
      console.error('  ✗ FAILED — text index missing:', msg);
    } else {
      console.error('  ✗ FAILED:', msg);
    }
  }

  // Test 3: getCustomerStats aggregation
  console.log('Test 3: Customer stats aggregation');
  try {
    const r = await CustomerProfile.aggregate([
      { $group: { _id: null, totalSpending: { $sum: '$totalSpending' }, totalOrders: { $sum: '$totalOrders' }, avgSpending: { $avg: '$totalSpending' }, totalLoyaltyPoints: { $sum: '$loyaltyPoints' } } },
    ]);
    console.log('  ✓ OK —', JSON.stringify(r[0] || {}));
  } catch (e: unknown) { console.error('  ✗ FAILED:', (e as Error).message); }

  // Test 4: AdminSettings.create({})
  console.log('Test 4: AdminSettings.create({})');
  try {
    const existing = await AdminSettings.findOne();
    if (!existing) {
      const s = await AdminSettings.create({});
      console.log('  ✓ Created OK —', s._id);
    } else {
      console.log('  ✓ Already exists —', existing._id);
    }
  } catch (e: unknown) { console.error('  ✗ FAILED:', (e as Error).message); }

  // Test 5: Supplier list
  const { Supplier } = await import('../src/app/suppliers/supplier.model.js');
  console.log('Test 5: Supplier list (no search)');
  try {
    const r = await Supplier.find({}).sort({ createdAt: -1 }).skip(0).limit(20).lean();
    console.log('  ✓ OK —', r.length, 'suppliers');
  } catch (e: unknown) { console.error('  ✗ FAILED:', (e as Error).message); }

  // Test 6: Supplier stats aggregation
  console.log('Test 6: Supplier stats aggregation');
  try {
    const r = await Supplier.aggregate([
      { $group: { _id: null, totalPurchases: { $sum: '$totalPurchases' }, totalPaid: { $sum: '$paidAmount' }, totalPending: { $sum: '$pendingPayments' } } },
    ]);
    console.log('  ✓ OK —', JSON.stringify(r[0] || {}));
  } catch (e: unknown) { console.error('  ✗ FAILED:', (e as Error).message); }

  // Test 7: PurchaseOrder stats
  const { PurchaseOrder } = await import('../src/app/suppliers/purchase-order.model.js');
  console.log('Test 7: PurchaseOrder pending aggregation');
  try {
    const r = await PurchaseOrder.aggregate([
      { $match: { status: { $in: ['pending', 'confirmed'] } } },
      { $group: { _id: null, pendingOrders: { $sum: 1 }, pendingAmount: { $sum: '$remainingBalance' } } },
    ]);
    console.log('  ✓ OK —', JSON.stringify(r[0] || {}));
  } catch (e: unknown) { console.error('  ✗ FAILED:', (e as Error).message); }

  await mongoose.disconnect();
  process.exit(0);
}

main();
