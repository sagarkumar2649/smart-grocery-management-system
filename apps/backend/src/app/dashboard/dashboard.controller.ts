import type { Request, Response } from "express";
import { Order } from "../orders/order.model.js";
import { Product } from "../products/product.model.js";
import { CustomerProfile } from "../customers/customer.model.js";
import { StockMovement } from "../inventory/stock-movement.model.js";
import { AppUser } from "../users/app-user.model.js";
import { ok, fail } from "../response/api-response.js";
import { logger } from "../../core/logging/logger.js";

const paiseToRupees = (paise: number) => paise / 100;

export async function getDashboardStats(_req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    const [
      todaySalesResult,
      totalProducts,
      totalCustomers,
      orderCounts,
      revenueResult,
      lowStockCount,
      outOfStockCount,
      profitResult,
    ] = await Promise.all([
      // Today's sales (sum of grandTotal for non-cancelled orders placed today)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday, $lt: endOfToday },
            orderStatus: { $ne: "cancelled" },
          },
        },
        { $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } } },
      ]),
      // Total active products
      Product.countDocuments({ isActive: true }),
      // Total registered customers
      CustomerProfile.countDocuments(),
      // Order counts by status
      Order.aggregate([
        {
          $group: {
            _id: "$orderStatus",
            count: { $sum: 1 },
          },
        },
      ]),
      // Total revenue from paid orders
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      // Low stock (stock > 0 and stock <= minimumStock)
      Product.countDocuments({ isActive: true, stock: { $gt: 0 }, $expr: { $lte: ["$stock", "$minimumStock"] } }),
      // Out of stock
      Product.countDocuments({ isActive: true, stock: 0 }),
      // Profit: sum of (unitPrice - purchasePrice) * quantity for paid orders
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: { path: "$productInfo", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: null,
            totalProfit: {
              $sum: {
                $multiply: [
                  { $subtract: ["$items.unitPrice", { $ifNull: ["$productInfo.purchasePrice", "$items.unitPrice"] }] },
                  "$items.quantity",
                ],
              },
            },
          },
        },
      ]),
    ]);

    const todaySales = todaySalesResult[0] ?? { total: 0, count: 0 };
    const totalRevenue = revenueResult[0]?.total ?? 0;
    const totalProfit = profitResult[0]?.totalProfit ?? 0;

    const statusMap: Record<string, number> = {};
    for (const entry of orderCounts) {
      statusMap[entry._id] = entry.count;
    }

    const totalOrders = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const pendingOrders =
      (statusMap["placed"] ?? 0) +
      (statusMap["confirmed"] ?? 0) +
      (statusMap["processing"] ?? 0) +
      (statusMap["packed"] ?? 0) +
      (statusMap["shipped"] ?? 0) +
      (statusMap["out_for_delivery"] ?? 0);

    res.status(200).json(
      ok({
        todaySales: paiseToRupees(todaySales.total),
        todayOrdersCount: todaySales.count,
        totalProducts,
        totalCustomers,
        totalOrders,
        pendingOrders,
        deliveredOrders: statusMap["delivered"] ?? 0,
        cancelledOrders: statusMap["cancelled"] ?? 0,
        totalRevenue: paiseToRupees(totalRevenue),
        totalProfit: paiseToRupees(totalProfit),
        lowStockCount,
        outOfStockCount,
      }),
    );
  } catch (err) {
    logger.error({ err }, "Dashboard stats failed");
    res.status(500).json(fail("Failed to load dashboard stats", "INTERNAL_ERROR"));
  }
}

export async function getRecentActivity(_req: Request, res: Response): Promise<void> {
  try {
    const limit = 20;

    // Fetch recent events from multiple collections in parallel
    const [recentOrders, recentMovements, recentUsers] = await Promise.all([
      // Recent orders (last 50 by creation time)
      Order.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .select("orderId customerName orderStatus grandTotal paymentStatus createdAt")
        .lean(),
      // Recent stock movements (last 50)
      StockMovement.find()
        .sort({ createdAt: -1 })
        .limit(50)
        .select("type quantity reference notes createdBy createdAt product")
        .populate("product", "name")
        .lean(),
      // Recent user registrations (last 20)
      AppUser.find({ role: "CUSTOMER" })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("name createdAt")
        .lean(),
    ]);

    // Build activity items from orders
    const activities: Array<{
      id: string;
      action: string;
      user: string;
      timestamp: string;
      amount: number | null;
      status: string;
      type: string;
    }> = [];

    for (const order of recentOrders) {
      let action = "";
      let status = "";
      let amount: number | null = null;

      switch (order.orderStatus) {
        case "placed":
          action = `Order #${order.orderId} placed`;
          status = "Info";
          amount = paiseToRupees(order.grandTotal);
          break;
        case "confirmed":
          action = `Order #${order.orderId} confirmed`;
          status = "Info";
          amount = paiseToRupees(order.grandTotal);
          break;
        case "delivered":
          action = `Order #${order.orderId} delivered`;
          status = "Completed";
          amount = paiseToRupees(order.grandTotal);
          break;
        case "cancelled":
          action = `Order #${order.orderId} cancelled`;
          status = "Refunded";
          amount = paiseToRupees(order.grandTotal);
          break;
        default:
          action = `Order #${order.orderId} ${order.orderStatus}`;
          status = "Info";
          amount = paiseToRupees(order.grandTotal);
      }

      activities.push({
        id: `order-${order._id}`,
        action,
        user: order.customerName,
        timestamp: order.createdAt.toISOString(),
        amount,
        status,
        type: "order",
      });
    }

    // Build activity items from stock movements
    for (const movement of recentMovements) {
      const productName = (movement.product as unknown as { name?: string })?.name ?? "Unknown Product";
      let action = "";
      let status = "";

      switch (movement.type) {
        case "purchase":
          action = `Stock purchased: ${productName}`;
          status = "Info";
          break;
        case "sale":
          action = `Product sold: ${productName}`;
          status = "Completed";
          break;
        case "return":
          action = `Product returned: ${productName}`;
          status = "Warning";
          break;
        case "adjustment":
          action = `Inventory adjusted: ${productName}`;
          status = "Info";
          break;
        case "damaged":
          action = `Damaged: ${productName}`;
          status = "Warning";
          break;
        case "expired":
          action = `Expired: ${productName}`;
          status = "Warning";
          break;
        default:
          action = `${movement.type}: ${productName}`;
          status = "Info";
      }

      activities.push({
        id: `movement-${movement._id}`,
        action,
        user: movement.createdBy ?? "System",
        timestamp: movement.createdAt.toISOString(),
        amount: null,
        status,
        type: "inventory",
      });
    }

    // Build activity items from new user registrations
    for (const user of recentUsers) {
      activities.push({
        id: `user-${user._id}`,
        action: "Customer registered",
        user: user.name,
        timestamp: user.createdAt.toISOString(),
        amount: null,
        status: "Info",
        type: "user",
      });
    }

    // Sort all activities by timestamp descending and take top N
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const sliced = activities.slice(0, limit);

    res.status(200).json(ok(sliced));
  } catch (err) {
    logger.error({ err }, "Recent activity failed");
    res.status(500).json(fail("Failed to load recent activity", "INTERNAL_ERROR"));
  }
}
