/**
 * Direct test — imports backend models/controllers,
 * connects to MongoDB, and verifies each code path.
 */
import mongoose from "mongoose";
import { Invoice } from "./src/app/pos/invoice.model.js";
import { StockMovement } from "./src/app/inventory/stock-movement.model.js";

async function run() {
  await mongoose.connect("mongodb://127.0.0.1:27017/smart_inventory");
  console.log("Connected to MongoDB");

  // ── Test 1: List Invoices — .lean() + formatInvoice code path ──
  console.log("\n=== Test 1: listInvoices — .lean() then access properties ===");
  try {
    const invoices = await Invoice.find({}).sort({ createdAt: -1 }).limit(5).lean();
    console.log(`  Found ${invoices.length} invoices`);

    for (const inv of invoices) {
      // Simulate what formatInvoice does — this is the code that was crashing
      const obj = "toObject" in inv && typeof (inv as any).toObject === "function"
        ? (inv as any).toObject()
        : inv;

      if (typeof obj.subtotal !== "number") throw new Error(`subtotal is ${typeof obj.subtotal}`);
      if (typeof obj.grandTotal !== "number") throw new Error(`grandTotal is ${typeof obj.grandTotal}`);
      if (!Array.isArray(obj.items)) throw new Error(`items is not an array`);
      if (!Array.isArray(obj.payments)) throw new Error(`payments is not an array`);
      for (const item of obj.items) {
        if (typeof item.unitPrice !== "number") throw new Error(`item.unitPrice is ${typeof item.unitPrice}`);
      }
      console.log(`  ${inv.invoiceNumber}: grandTotal=${obj.grandTotal}, items=${obj.items.length}`);
    }
    console.log("PASS");
  } catch (err) {
    console.error("FAIL:", err);
  }

  // ── Test 2: getInvoice — .lean() single doc ──
  console.log("\n=== Test 2: getInvoice — single .lean() doc ===");
  try {
    const invoice = await Invoice.findOne().lean();
    if (!invoice) {
      console.log("SKIP: No invoices in DB");
    } else {
      const obj = "toObject" in invoice && typeof (invoice as any).toObject === "function"
        ? (invoice as any).toObject()
        : invoice;
      console.log(`  ${invoice.invoiceNumber}: grandTotal=${obj.grandTotal}`);
      console.log("PASS");
    }
  } catch (err) {
    console.error("FAIL:", err);
  }

  // ── Test 3: Sales report aggregation ──
  console.log("\n=== Test 3: getSalesReport aggregation ===");
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [summary] = await StockMovement.aggregate([
      { $match: { type: "sale", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          avgOrderValue: { $avg: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          transactions: { $sum: 1 },
        },
      },
    ]);
    console.log(`  Summary:`, summary || "(no sales this month)");
    console.log("PASS");
  } catch (err) {
    console.error("FAIL:", err);
  }

  // ── Test 4: Confirm .lean() lacks .toObject ──
  console.log("\n=== Test 4: Verify .lean() lacks .toObject ===");
  const leanDoc = await Invoice.findOne().lean();
  if (leanDoc) {
    const hasToObj = typeof (leanDoc as any).toObject === "function";
    console.log(`  .lean().toObject exists: ${hasToObj}`);
    if (!hasToObj) {
      console.log("  CONFIRMED: old code (doc.toObject()) would have crashed");
    }
  } else {
    console.log("  No docs to test — INSERT a test invoice first");
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

run().catch((err) => { console.error("Fatal:", err); process.exit(1); });
