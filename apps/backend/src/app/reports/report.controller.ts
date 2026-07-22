import type { Request, Response } from "express";
import { Product } from "../products/product.model.js";
import { StockMovement } from "../inventory/stock-movement.model.js";
import { PurchaseOrder } from "../suppliers/purchase-order.model.js";
import { Supplier } from "../suppliers/supplier.model.js";
import { CustomerProfile } from "../customers/customer.model.js";
import { ok, fail } from "../response/api-response.js";
import { logger } from "../../core/logging/logger.js";

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseDateRange(query: Record<string, string>): { start: Date; end: Date } {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const period = query.period || "monthly";
  const startDate = query.startDate;
  const endDate = query.endDate;

  if (startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  switch (period) {
    case "daily":
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      break;
    case "weekly": {
      const day = now.getDay();
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
      break;
    }
    case "yearly":
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case "monthly":
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
  }

  return { start, end };
}

function getDateGroupId(period: string): "$year" | "$month" | "$week" | "$dayOfMonth" {
  switch (period) {
    case "daily": return "$dayOfMonth";
    case "weekly": return "$week";
    case "yearly": return "$year";
    case "monthly":
    default: return "$month";
  }
}

// ── Sales Report ──────────────────────────────────────────────────────────────

export async function getSalesReport(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = parseDateRange(req.query as Record<string, string>);
    const period = (req.query.period as string) || "monthly";

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

    const trend = await StockMovement.aggregate([
      { $match: { type: "sale", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            [getDateGroupId(period)]: "$createdAt",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          quantity: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const byProduct = await StockMovement.aggregate([
      { $match: { type: "sale", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$product",
          quantity: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          productName: "$product.name",
          sku: "$product.sku",
          quantity: 1,
          revenue: 1,
        },
      },
    ]);

    res.status(200).json(ok({
      summary: summary || { totalSales: 0, totalRevenue: 0, avgOrderValue: 0, transactions: 0 },
      trend,
      byProduct,
      dateRange: { start, end },
      period,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate sales report");
    res.status(500).json(fail("Failed to generate sales report", "REPORT_ERROR"));
  }
}

// ── Purchase Report ───────────────────────────────────────────────────────────

export async function getPurchaseReport(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = parseDateRange(req.query as Record<string, string>);
    const period = (req.query.period as string) || "monthly";

    const [summary] = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          totalPaid: { $sum: "$paidAmount" },
          totalPending: { $sum: "$remainingBalance" },
          totalGST: { $sum: "$gstAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]);

    const byStatus = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } },
      { $sort: { count: -1 } },
    ]);

    const trend = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            [getDateGroupId(period)]: "$createdAt",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          amount: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
          paid: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const bySupplier = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$supplier",
          orders: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
          paidAmount: { $sum: "$paidAmount" },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: "suppliers",
          localField: "_id",
          foreignField: "_id",
          as: "supplier",
        },
      },
      { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          companyName: "$supplier.companyName",
          orders: 1,
          totalAmount: 1,
          paidAmount: 1,
        },
      },
    ]);

    res.status(200).json(ok({
      summary: summary || { totalOrders: 0, totalAmount: 0, totalPaid: 0, totalPending: 0, totalGST: 0, avgOrderValue: 0 },
      byStatus,
      trend,
      bySupplier,
      dateRange: { start, end },
      period,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate purchase report");
    res.status(500).json(fail("Failed to generate purchase report", "REPORT_ERROR"));
  }
}

// ── Inventory Report ──────────────────────────────────────────────────────────

export async function getInventoryReport(_req: Request, res: Response): Promise<void> {
  try {
    const [summary] = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockValue: { $sum: { $multiply: ["$stock", "$purchasePrice"] } },
          totalRetailValue: { $sum: { $multiply: ["$stock", "$sellingPrice"] } },
          totalStock: { $sum: "$stock" },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", "$minimumStock"] }] }, 1, 0] },
          },
          outOfStock: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        },
      },
    ]);

    const byCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$category",
          products: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          stockValue: { $sum: { $multiply: ["$stock", "$purchasePrice"] } },
          retailValue: { $sum: { $multiply: ["$stock", "$sellingPrice"] } },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      { $project: { categoryName: "$category.name", products: 1, totalStock: 1, stockValue: 1, retailValue: 1 } },
      { $sort: { stockValue: -1 } },
    ]);

    const topValue = await Product.aggregate([
      { $match: { isActive: true, stock: { $gt: 0 } } },
      {
        $project: {
          name: 1,
          sku: 1,
          stock: 1,
          unit: 1,
          purchasePrice: 1,
          sellingPrice: 1,
          totalValue: { $multiply: ["$stock", "$purchasePrice"] },
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 15 },
    ]);

    const movements = await StockMovement.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: "$type", count: { $sum: 1 }, quantity: { $sum: "$quantity" } } },
      { $sort: { quantity: -1 } },
    ]);

    res.status(200).json(ok({
      summary: summary || { totalProducts: 0, totalStockValue: 0, totalRetailValue: 0, totalStock: 0, lowStock: 0, outOfStock: 0 },
      byCategory,
      topValue,
      movements,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate inventory report");
    res.status(500).json(fail("Failed to generate inventory report", "REPORT_ERROR"));
  }
}

// ── Profit & Loss Report ──────────────────────────────────────────────────────

export async function getProfitLossReport(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = parseDateRange(req.query as Record<string, string>);
    const period = (req.query.period as string) || "monthly";

    const [salesData] = await StockMovement.aggregate([
      { $match: { type: "sale", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          totalCOGS: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          unitsSold: { $sum: "$quantity" },
        },
      },
    ]);

    const [purchaseData] = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalPurchases: { $sum: "$totalAmount" },
          totalGST: { $sum: "$gstAmount" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
    ]);

    const revenue = salesData?.totalRevenue || 0;
    const cogs = purchaseData?.totalPurchases || 0;
    const gst = purchaseData?.totalGST || 0;
    const grossProfit = revenue - cogs;
    const margin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    const trend = await StockMovement.aggregate([
      { $match: { type: "sale", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            [getDateGroupId(period)]: "$createdAt",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          revenue: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          units: { $sum: "$quantity" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    const purchaseTrend = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: {
            [getDateGroupId(period)]: "$createdAt",
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          cost: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
    ]);

    res.status(200).json(ok({
      summary: {
        revenue,
        costOfGoods: cogs,
        gst,
        grossProfit,
        margin,
        unitsSold: salesData?.unitsSold || 0,
        totalPurchases: purchaseData?.totalPurchases || 0,
        totalPaid: purchaseData?.totalPaid || 0,
      },
      trend,
      purchaseTrend,
      dateRange: { start, end },
      period,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate profit & loss report");
    res.status(500).json(fail("Failed to generate profit & loss report", "REPORT_ERROR"));
  }
}

// ── Top / Least Selling Products ──────────────────────────────────────────────

export async function getTopSellingReport(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = parseDateRange(req.query as Record<string, string>);
    const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) || "10", 10)));
    const sortDir = ((req.query.sort as string) || "desc") === "asc" ? 1 : -1;

    const products = await StockMovement.aggregate([
      { $match: { type: "sale", createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: "$product",
          totalSold: { $sum: "$quantity" },
          totalRevenue: { $sum: { $multiply: ["$quantity", { $ifNull: ["$unitCost", 0] }] } },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { totalSold: sortDir } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$product.name",
          sku: "$product.sku",
          sellingPrice: "$product.sellingPrice",
          stock: "$product.stock",
          totalSold: 1,
          totalRevenue: 1,
          transactions: 1,
        },
      },
    ]);

    res.status(200).json(ok({
      products,
      dateRange: { start, end },
      total: products.length,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate top selling report");
    res.status(500).json(fail("Failed to generate top selling report", "REPORT_ERROR"));
  }
}

// ── Customer Report ───────────────────────────────────────────────────────────

export async function getCustomerReport(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = parseDateRange(req.query as Record<string, string>);

    const [summary] = await CustomerProfile.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          totalSpending: { $sum: "$totalSpending" },
          totalOrders: { $sum: "$totalOrders" },
          avgSpending: { $avg: "$totalSpending" },
          totalLoyaltyPoints: { $sum: "$loyaltyPoints" },
        },
      },
    ]);

    const newCustomers = await CustomerProfile.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const byStatus = await CustomerProfile.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const topSpenders = await CustomerProfile.find({ totalSpending: { $gt: 0 } })
      .sort({ totalSpending: -1 })
      .limit(20)
      .select("name email phone totalSpending totalOrders loyaltyPoints")
      .lean();

    const spendingTrend = await CustomerProfile.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: {
            [((req.query.period as string) || "monthly") === "daily" ? "$dayOfMonth" : "$month"]: "$createdAt",
            year: { $year: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json(ok({
      summary: summary || { totalCustomers: 0, activeCustomers: 0, totalSpending: 0, totalOrders: 0, avgSpending: 0, totalLoyaltyPoints: 0 },
      newCount: newCustomers[0]?.count || 0,
      byStatus,
      topSpenders,
      spendingTrend,
      dateRange: { start, end },
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate customer report");
    res.status(500).json(fail("Failed to generate customer report", "REPORT_ERROR"));
  }
}

// ── Supplier Report ───────────────────────────────────────────────────────────

export async function getSupplierReport(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = parseDateRange(req.query as Record<string, string>);

    const [summary] = await Supplier.aggregate([
      {
        $group: {
          _id: null,
          totalSuppliers: { $sum: 1 },
          activeSuppliers: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] } },
          totalPurchases: { $sum: "$totalPurchases" },
          totalPaid: { $sum: "$paidAmount" },
          totalPending: { $sum: "$pendingPayments" },
        },
      },
    ]);

    const byStatus = await Supplier.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const topSuppliers = await Supplier.find({ totalPurchases: { $gt: 0 } })
      .sort({ totalPurchases: -1 })
      .limit(20)
      .select("companyName contactPerson totalOrders totalPurchases paidAmount pendingPayments status")
      .lean();

    const paymentMethods = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $unwind: "$payments" },
      { $group: { _id: "$payments.method", count: { $sum: 1 }, total: { $sum: "$payments.amount" } } },
      { $sort: { total: -1 } },
    ]);

    const ordersByStatus = await PurchaseOrder.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: "$status", count: { $sum: 1 }, amount: { $sum: "$totalAmount" } } },
    ]);

    res.status(200).json(ok({
      summary: summary || { totalSuppliers: 0, activeSuppliers: 0, totalPurchases: 0, totalPaid: 0, totalPending: 0 },
      byStatus,
      topSuppliers,
      paymentMethods,
      ordersByStatus,
      dateRange: { start, end },
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate supplier report");
    res.status(500).json(fail("Failed to generate supplier report", "REPORT_ERROR"));
  }
}

// ── Low Stock Report ──────────────────────────────────────────────────────────

export async function getLowStockReport(_req: Request, res: Response): Promise<void> {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true, stock: { $gt: 0 }, $expr: { $lte: ["$stock", "$minimumStock"] } } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          sku: 1,
          stock: 1,
          minimumStock: 1,
          maximumStock: 1,
          unit: 1,
          categoryName: "$categoryData.name",
          deficit: { $subtract: ["$minimumStock", "$stock"] },
        },
      },
      { $sort: { deficit: -1 } },
    ]);

    res.status(200).json(ok({
      products,
      count: products.length,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate low stock report");
    res.status(500).json(fail("Failed to generate low stock report", "REPORT_ERROR"));
  }
}

// ── Out of Stock Report ───────────────────────────────────────────────────────

export async function getOutOfStockReport(_req: Request, res: Response): Promise<void> {
  try {
    const products = await Product.aggregate([
      { $match: { isActive: true, stock: 0 } },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      { $unwind: { path: "$categoryData", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          sku: 1,
          stock: 1,
          minimumStock: 1,
          unit: 1,
          categoryName: "$categoryData.name",
          purchasePrice: 1,
          sellingPrice: 1,
          imageUrl: 1,
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json(ok({
      products,
      count: products.length,
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate out of stock report");
    res.status(500).json(fail("Failed to generate out of stock report", "REPORT_ERROR"));
  }
}

// ── Expired Products Report ───────────────────────────────────────────────────

export async function getExpiredProductsReport(_req: Request, res: Response): Promise<void> {
  try {
    const products = await StockMovement.aggregate([
      { $match: { type: "expired" } },
      {
        $group: {
          _id: "$product",
          totalExpired: { $sum: { $abs: "$quantity" } },
          batches: { $addToSet: { $ifNull: ["$batchNumber", "N/A"] } },
          lastExpired: { $max: "$createdAt" },
        },
      },
      { $sort: { totalExpired: -1 } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: "$product.name",
          sku: "$product.sku",
          stock: "$product.stock",
          unit: "$product.unit",
          totalExpired: 1,
          batches: 1,
          lastExpired: 1,
        },
      },
    ]);

    const summary = await StockMovement.aggregate([
      { $match: { type: "expired" } },
      {
        $group: {
          _id: null,
          totalExpiredItems: { $sum: 1 },
          totalExpiredQuantity: { $sum: { $abs: "$quantity" } },
        },
      },
    ]);

    res.status(200).json(ok({
      products,
      summary: summary[0] || { totalExpiredItems: 0, totalExpiredQuantity: 0 },
    }));
  } catch (err) {
    logger.error({ err }, "Failed to generate expired products report");
    res.status(500).json(fail("Failed to generate expired products report", "REPORT_ERROR"));
  }
}
