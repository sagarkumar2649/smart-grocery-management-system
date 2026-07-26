import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Invoice, type IInvoice, type IInvoiceItem, type IInvoicePayment, type IGstBreakdown } from "./invoice.model.js";
import { Coupon } from "./coupon.model.js";
import { Product } from "../products/product.model.js";
import { StockMovement } from "../inventory/stock-movement.model.js";
import { AppUser } from "../users/app-user.model.js";
import { ok, fail } from "../response/api-response.js";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { generateInvoicePDF } from "./pdf.service.js";
import { sendInvoiceEmail } from "./email.service.js";

// NOTE: All MongoDB session/transaction code has been removed.
// Operations execute sequentially without replica-set requirements.

// ── Helpers ──────────────────────────────────────────────────────────────────

const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);
const paiseToRupees = (paise: number) => paise / 100;

async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `INV-${yy}${mm}-`;

  const lastInvoice = await Invoice.findOne({ invoiceNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 })
    .lean();

  let seq = 1;
  if (lastInvoice) {
    const lastNum = lastInvoice.invoiceNumber.split("-").pop();
    if (lastNum) {
      seq = parseInt(lastNum, 10) + 1;
    }
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

function formatInvoice(doc: IInvoice) {
  const obj = "toObject" in doc && typeof doc.toObject === "function" ? doc.toObject() : (doc as unknown as Record<string, unknown>);
  return {
    ...obj,
    subtotal: paiseToRupees(obj.subtotal as number),
    totalItemDiscount: paiseToRupees(obj.totalItemDiscount as number),
    couponDiscount: paiseToRupees(obj.couponDiscount as number),
    totalGST: paiseToRupees(obj.totalGST as number),
    gstBreakdown: {
      cgst: paiseToRupees(((obj.gstBreakdown as IGstBreakdown) ?? { cgst: 0, sgst: 0, igst: 0 }).cgst),
      sgst: paiseToRupees(((obj.gstBreakdown as IGstBreakdown) ?? { cgst: 0, sgst: 0, igst: 0 }).sgst),
      igst: paiseToRupees(((obj.gstBreakdown as IGstBreakdown) ?? { cgst: 0, sgst: 0, igst: 0 }).igst),
    },
    grandTotal: paiseToRupees(obj.grandTotal as number),
    items: ((obj.items as IInvoiceItem[]) ?? []).map((item) => ({
      ...item,
      unitPrice: paiseToRupees(item.unitPrice),
      discount: paiseToRupees(item.discount),
      gstAmount: paiseToRupees(item.gstAmount),
      total: paiseToRupees(item.total),
    })),
    payments: ((obj.payments as IInvoicePayment[]) ?? []).map((p) => ({
      ...p,
      amount: paiseToRupees(p.amount),
    })),
  };
}

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const checkoutItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  discount: z.number().nonnegative().optional(),
  discountType: z.enum(["percentage", "flat"]).optional(),
});

const paymentSchema = z.object({
  method: z.enum(["cash", "upi", "card", "split"]),
  amount: z.number().nonnegative(),
  reference: z.string().max(200).optional(),
  upiTransactionId: z.string().max(100).optional(),
  cardLast4: z.string().max(4).optional(),
  cardType: z.string().max(50).optional(),
});

const checkoutSchema = z.object({
  items: z.array(checkoutItemSchema).min(1, "At least one item required"),
  payments: z.array(paymentSchema).min(1, "At least one payment required"),
  discount: z.number().nonnegative().optional(),
  discountType: z.enum(["percentage", "flat"]).optional(),
  couponCode: z.string().max(30).optional(),
  customerName: z.string().max(200).optional(),
  customerPhone: z.string().max(20).optional(),
  customerEmail: z.string().email().optional(),
  notes: z.string().max(1000).optional(),
});

const validateCouponSchema = z.object({
  code: z.string().min(1).max(30),
  subtotal: z.number().nonnegative(),
});

const voidSchema = z.object({
  reason: z.string().min(1, "Reason is required").max(500),
});

const emailSchema = z.object({
  email: z.string().email("Valid email required"),
});

// ── Controllers ──────────────────────────────────────────────────────────────

export async function searchPOSProducts(req: Request, res: Response): Promise<void> {
  const { page = "1", limit = "50", search = "", category = "" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const filter: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } };

  if (search.trim()) {
    filter["$text"] = { $search: search.trim() };
  }
  if (category) {
    filter["category"] = category;
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Product.countDocuments(filter),
  ]);

  const formatted = products.map((p) => ({
    _id: p._id,
    name: p.name,
    sku: p.sku,
    barcode: p.barcode,
    sellingPrice: paiseToRupees(p.sellingPrice),
    mrp: paiseToRupees(p.mrp),
    gstPercent: p.gstPercent,
    stock: p.stock,
    unit: p.unit,
    imageUrl: p.imageUrl,
    category: p.category,
  }));

  res.status(200).json(
    ok(formatted, {
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    }),
  );
}

export async function getProductByBarcode(req: Request, res: Response): Promise<void> {
  const { barcode } = req.params as { barcode: string };

  const product = await Product.findOne({
    barcode: barcode.trim(),
    isActive: true,
    stock: { $gt: 0 },
  })
    .populate("category", "name slug")
    .lean();

  if (!product) {
    res.status(404).json(fail("No active product found with this barcode", "NOT_FOUND"));
    return;
  }

  res.status(200).json(
    ok({
      _id: product._id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      sellingPrice: paiseToRupees(product.sellingPrice),
      mrp: paiseToRupees(product.mrp),
      gstPercent: product.gstPercent,
      stock: product.stock,
      unit: product.unit,
      imageUrl: product.imageUrl,
      category: product.category,
    }),
  );
}

export async function checkout(req: Request, res: Response): Promise<void> {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    const messages = Object.entries(fieldErrors)
      .map(([field, errs]) => `${field}: ${(errs ?? []).join(", ")}`)
      .join("; ");
    res.status(400).json(
      fail(messages || "Please check your input", "VALIDATION_ERROR"),
    );
    return;
  }

  const data = parsed.data;
  const clerkId = (req as AuthenticatedRequest).auth?.userId;

  try {
    const appUser = await AppUser.findOne({ clerkId }).lean();
    if (!appUser) {
      res.status(403).json(fail("User not provisioned", "FORBIDDEN"));
      return;
    }

    // Fetch all products in one query
    const productIds = data.items.map((item) => new mongoose.Types.ObjectId(item.productId));
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    // Validate items and calculate totals
    let subtotal = 0;
    let totalItemDiscount = 0;
    let totalGST = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;

    const invoiceItems = data.items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}": available ${product.stock}, requested ${item.quantity}`);
      }

      const unitPrice = product.sellingPrice;
      const lineTotalBeforeDiscount = unitPrice * item.quantity;

      let lineDiscount = rupeesToPaise(item.discount ?? 0) * item.quantity;
      if (item.discountType === "percentage" && item.discount) {
        lineDiscount = Math.round(lineTotalBeforeDiscount * (item.discount / 100));
      }

      const taxableAmount = lineTotalBeforeDiscount - lineDiscount;
      const gstAmount = Math.round(taxableAmount * (product.gstPercent / 100));
      const lineTotal = taxableAmount + gstAmount;

      subtotal += lineTotalBeforeDiscount;
      totalItemDiscount += lineDiscount;
      totalGST += gstAmount;

      const halfGST = Math.round(gstAmount / 2);
      cgstTotal += halfGST;
      sgstTotal += gstAmount - halfGST;

      return {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        discount: lineDiscount,
        discountType: item.discountType ?? "flat",
        gstPercent: product.gstPercent,
        gstAmount,
        total: lineTotal,
      };
    });

    // Apply bill-level discount
    let billDiscount = rupeesToPaise(data.discount ?? 0);
    if (data.discountType === "percentage" && data.discount) {
      billDiscount = Math.round(subtotal * (data.discount / 100));
    }

    // Apply coupon
    let couponDiscount = 0;
    let couponCode: string | undefined;
    if (data.couponCode) {
      const coupon = await Coupon.findOne({
        code: data.couponCode.trim().toUpperCase(),
        isActive: true,
      }).lean();

      if (!coupon) {
        res.status(400).json(fail("Invalid or inactive coupon code", "VALIDATION_ERROR"));
        return;
      }

      const now = new Date();
      if (now < coupon.validFrom || now > coupon.validUntil) {
        res.status(400).json(fail("Coupon has expired or is not yet valid", "VALIDATION_ERROR"));
        return;
      }

      const afterItemDiscount = subtotal - totalItemDiscount;
      if (afterItemDiscount < coupon.minOrderAmount) {
        res.status(400).json(
          fail(
            `Minimum order amount ₹${(coupon.minOrderAmount / 100).toFixed(2)} required for this coupon`,
            "VALIDATION_ERROR",
          ),
        );
        return;
      }

      if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
        res.status(400).json(fail("Coupon usage limit reached", "VALIDATION_ERROR"));
        return;
      }

      if (coupon.discountType === "percentage") {
        couponDiscount = Math.round(afterItemDiscount * (coupon.discountValue / 100));
        if (coupon.maxDiscountAmount > 0 && couponDiscount > coupon.maxDiscountAmount) {
          couponDiscount = coupon.maxDiscountAmount;
        }
      } else {
        couponDiscount = Math.min(coupon.discountValue, afterItemDiscount);
      }

      couponCode = coupon.code;
    }

    const grandTotal = subtotal - totalItemDiscount - billDiscount - couponDiscount + totalGST;

    if (grandTotal < 0) {
      res.status(400).json(fail("Grand total cannot be negative", "VALIDATION_ERROR"));
      return;
    }

    // Validate payments
    // Tolerance accounts for rounding differences between frontend (rupees) and backend (paise)
    // when computing GST: Math.round(price_rupees * gst / 100) vs Math.round(price_paise * gst / 100)
    const totalPaid = data.payments.reduce((sum, p) => sum + rupeesToPaise(p.amount), 0);
    if (Math.abs(totalPaid - grandTotal) > 50) {
      res.status(400).json(
        fail(
          `Payment amount ₹${(totalPaid / 100).toFixed(2)} does not match grand total ₹${(grandTotal / 100).toFixed(2)}`,
          "VALIDATION_ERROR",
        ),
      );
      return;
    }

    const payments = data.payments.map((p) => ({
      method: p.method,
      amount: rupeesToPaise(p.amount),
      reference: p.reference,
      upiTransactionId: p.upiTransactionId,
      cardLast4: p.cardLast4,
      cardType: p.cardType,
    }));

    const paymentStatus = totalPaid >= grandTotal ? "paid" : "partial";

    const invoiceNumber = await generateInvoiceNumber();

    // Reduce stock for each product (no transaction — sequential)
    for (const item of invoiceItems) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true },
      );

      if (!product) {
        throw new Error(`Failed to update stock for product: ${item.name}`);
      }

      if (product.stock < 0) {
        throw new Error(`Insufficient stock for "${item.name}" after concurrent update`);
      }

      await StockMovement.create({
        product: item.product,
        type: "sale",
        quantity: -item.quantity,
        previousStock: product.stock + item.quantity,
        newStock: product.stock,
        reference: invoiceNumber,
        unitCost: item.unitPrice,
        notes: `POS Sale - ${invoiceNumber}`,
        createdBy: appUser.name,
      });
    }

    // Increment coupon usage
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $inc: { usedCount: 1 } },
      );
    }

    const invoice = await Invoice.create({
      invoiceNumber,
      items: invoiceItems,
      subtotal,
      totalItemDiscount: totalItemDiscount + billDiscount,
      couponCode,
      couponDiscount,
      totalGST,
      gstBreakdown: { cgst: cgstTotal, sgst: sgstTotal, igst: 0 },
      grandTotal,
      payments,
      paymentStatus,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail,
      cashierName: appUser.name,
      createdBy: appUser._id,
      status: "completed",
      notes: data.notes,
    });

    res.status(201).json(ok(formatInvoice(invoice)));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    res.status(400).json(fail(message, "CHECKOUT_ERROR"));
  }
}

export async function listInvoices(req: Request, res: Response): Promise<void> {
  try {
    const {
      page = "1",
      limit = "20",
      status = "",
      startDate = "",
      endDate = "",
      search = "",
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const filter: Record<string, unknown> = {};
    if (status) filter["status"] = status;
    if (search.trim()) {
      filter["$or"] = [
        { invoiceNumber: new RegExp(search.trim(), "i") },
        { customerName: new RegExp(search.trim(), "i") },
        { customerPhone: new RegExp(search.trim(), "i") },
      ];
    }
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter["$gte"] = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter["$lte"] = end;
      }
      filter["createdAt"] = dateFilter;
    }

    const [invoices, total] = await Promise.all([
      Invoice.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Invoice.countDocuments(filter),
    ]);

    res.status(200).json(
      ok(invoices.map((inv) => formatInvoice(inv as unknown as IInvoice)), {
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      }),
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch invoices";
    res.status(500).json(fail(message, "INVOICE_ERROR"));
  }
}

export async function getInvoice(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params as { id: string };

    const invoice = await Invoice.findById(id).lean();
    if (!invoice) {
      res.status(404).json(fail("Invoice not found", "NOT_FOUND"));
      return;
    }

    res.status(200).json(ok(formatInvoice(invoice as unknown as IInvoice)));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch invoice";
    res.status(500).json(fail(message, "INVOICE_ERROR"));
  }
}

export async function downloadInvoicePDF(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const invoice = await Invoice.findById(id).lean();
  if (!invoice) {
    res.status(404).json(fail("Invoice not found", "NOT_FOUND"));
    return;
  }

  try {
    const pdfBuffer = await generateInvoicePDF(invoice as unknown as IInvoice);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF generation failed";
    res.status(500).json(fail(message, "INTERNAL_ERROR"));
  }
}

export async function voidInvoice(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = voidSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("Invalid input", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    res.status(404).json(fail("Invoice not found", "NOT_FOUND"));
    return;
  }

  if (invoice.status !== "completed") {
    res.status(400).json(fail("Only completed invoices can be voided", "VALIDATION_ERROR"));
    return;
  }

  try {
    // Restore stock
    for (const item of invoice.items) {
      const product = await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true },
      );

      if (product) {
        await StockMovement.create({
          product: item.product,
          type: "return",
          quantity: item.quantity,
          previousStock: product.stock - item.quantity,
          newStock: product.stock,
          reference: invoice.invoiceNumber,
          notes: `Void - ${invoice.invoiceNumber}: ${parsed.data.reason}`,
        });
      }
    }

    // Decrement coupon usage
    if (invoice.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: invoice.couponCode },
        { $inc: { usedCount: -1 } },
      );
    }

    invoice.status = "voided";
    invoice.voidReason = parsed.data.reason;
    await invoice.save();

    res.status(200).json(ok(formatInvoice(invoice)));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Void failed";
    res.status(500).json(fail(message, "INTERNAL_ERROR"));
  }
}

export async function validateCoupon(req: Request, res: Response): Promise<void> {
  const parsed = validateCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("Invalid input", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const coupon = await Coupon.findOne({
    code: parsed.data.code.trim().toUpperCase(),
    isActive: true,
  }).lean();

  if (!coupon) {
    res.status(404).json(fail("Invalid coupon code", "NOT_FOUND"));
    return;
  }

  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    res.status(400).json(fail("Coupon has expired or is not yet valid", "VALIDATION_ERROR"));
    return;
  }

  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    res.status(400).json(fail("Coupon usage limit reached", "VALIDATION_ERROR"));
    return;
  }

  if (parsed.data.subtotal < coupon.minOrderAmount) {
    res.status(400).json(
      fail(
        `Minimum order amount ₹${(coupon.minOrderAmount / 100).toFixed(2)} required`,
        "VALIDATION_ERROR",
      ),
    );
    return;
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = Math.round(parsed.data.subtotal * (coupon.discountValue / 100));
    if (coupon.maxDiscountAmount > 0 && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else {
    discount = Math.min(coupon.discountValue, parsed.data.subtotal);
  }

  res.status(200).json(
    ok({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountType === "percentage" ? coupon.discountValue : paiseToRupees(coupon.discountValue),
      calculatedDiscount: paiseToRupees(discount),
    }),
  );
}

export async function emailInvoice(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };
  const parsed = emailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(
      fail("Invalid input", "VALIDATION_ERROR", parsed.error.flatten().fieldErrors as Record<string, unknown>),
    );
    return;
  }

  const invoice = await Invoice.findById(id).lean();
  if (!invoice) {
    res.status(404).json(fail("Invoice not found", "NOT_FOUND"));
    return;
  }

  try {
    const pdfBuffer = await generateInvoicePDF(invoice as unknown as IInvoice);
    const result = await sendInvoiceEmail(invoice as unknown as IInvoice, pdfBuffer, parsed.data.email);

    if (!result.success) {
      res.status(500).json(fail(result.message, "INTERNAL_ERROR"));
      return;
    }

    res.status(200).json(ok({ message: "Invoice emailed successfully" }));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    res.status(500).json(fail("INTERNAL_ERROR", message));
  }
}

export async function getWhatsAppLink(req: Request, res: Response): Promise<void> {
  const { id } = req.params as { id: string };

  const invoice = await Invoice.findById(id).lean();
  if (!invoice) {
    res.status(404).json(fail("Invoice not found", "NOT_FOUND"));
    return;
  }

  const items = invoice.items
    .map((item, i) => `${i + 1}. ${item.name} x${item.quantity} = ₹${(item.total / 100).toFixed(2)}`)
    .join("%0A");

  const message = encodeURIComponent(
    `*Invoice ${invoice.invoiceNumber}*%0A` +
      `Date: ${new Date(invoice.createdAt).toLocaleDateString("en-IN")}%0A%0A` +
      `${items}%0A%0A` +
      `Grand Total: *₹${(invoice.grandTotal / 100).toFixed(2)}*%0A` +
      `Payment: ${invoice.paymentStatus.toUpperCase()}%0A%0A` +
      `Thank you for your purchase!`,
  );

  const phone = invoice.customerPhone?.replace(/[^0-9]/g, "") ?? "";
  const url = phone
    ? `https://wa.me/${phone}?text=${message}`
    : `https://wa.me/?text=${message}`;

  res.status(200).json(ok({ url, phone }));
}
