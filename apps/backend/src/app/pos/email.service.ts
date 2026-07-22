import nodemailer from "nodemailer";
import type { IInvoice } from "./invoice.model.js";

const transporter = nodemailer.createTransport({
  host: process.env["SMTP_HOST"] ?? "smtp.gmail.com",
  port: Number(process.env["SMTP_PORT"] ?? 587),
  secure: process.env["SMTP_PORT"] === "465",
  auth: {
    user: process.env["SMTP_USER"],
    pass: process.env["SMTP_PASS"],
  },
});

function formatPaise(amount: number): string {
  return `₹${(amount / 100).toFixed(2)}`;
}

function buildEmailHTML(invoice: IInvoice): string {
  const itemsRows = invoice.items
    .map(
      (item, i) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i + 1}</td>
        <td style="padding:8px;border-bottom:1px solid #eee">${item.name}<br><small style="color:#888">${item.sku}</small></td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${formatPaise(item.unitPrice)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${item.discount > 0 ? formatPaise(item.discount) : "-"}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${item.gstPercent}%</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold">${formatPaise(item.total)}</td>
      </tr>`,
    )
    .join("");

  const paymentRows = invoice.payments
    .map((p) => {
      const label =
        p.method === "cash"
          ? "Cash"
          : p.method === "upi"
            ? `UPI${p.upiTransactionId ? ` (${p.upiTransactionId})` : ""}`
            : p.method === "card"
              ? `Card${p.cardType ? ` (${p.cardType})` : ""}${p.cardLast4 ? ` ****${p.cardLast4}` : ""}`
              : "Split Payment";
      return `<li style="padding:4px 0">${label}: <strong>${formatPaise(p.amount)}</strong></li>`;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
      <div style="text-align:center;margin-bottom:20px">
        <h1 style="margin:0;color:#0F766E">INVOICE</h1>
        <p style="color:#666;margin:5px 0">${invoice.invoiceNumber}</p>
        <p style="color:#888;margin:2px 0;font-size:14px">${new Date(invoice.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
      </div>
      <hr style="border:none;border-top:1px solid #eee">
      <div style="display:flex;justify-content:space-between;margin:15px 0">
        <div>
          <strong>Bill To:</strong><br>
          ${invoice.customerName || "Walk-in Customer"}<br>
          ${invoice.customerPhone ? `Phone: ${invoice.customerPhone}` : ""}
        </div>
        <div style="text-align:right">
          <strong>Cashier:</strong><br>
          ${invoice.cashierName}
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:15px 0">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:center">#</th>
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:left">Item</th>
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:center">Qty</th>
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:right">Rate</th>
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:right">Disc</th>
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:center">GST</th>
            <th style="padding:8px;border-bottom:2px solid #ddd;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
      <div style="text-align:right;margin:15px 0">
        <table style="margin-left:auto">
          <tr><td style="padding:4px 15px;color:#666">Subtotal:</td><td style="padding:4px 15px;text-align:right">${formatPaise(invoice.subtotal)}</td></tr>
          ${invoice.totalItemDiscount > 0 ? `<tr><td style="padding:4px 15px;color:#666">Item Discount:</td><td style="padding:4px 15px;text-align:right;color:#dc2626">-${formatPaise(invoice.totalItemDiscount)}</td></tr>` : ""}
          ${invoice.couponDiscount > 0 ? `<tr><td style="padding:4px 15px;color:#666">Coupon (${invoice.couponCode}):</td><td style="padding:4px 15px;text-align:right;color:#dc2626">-${formatPaise(invoice.couponDiscount)}</td></tr>` : ""}
          ${invoice.totalGST > 0 ? `<tr><td style="padding:4px 15px;color:#666">GST:</td><td style="padding:4px 15px;text-align:right">${formatPaise(invoice.totalGST)}</td></tr>` : ""}
          <tr><td style="padding:8px 15px;border-top:2px solid #333;font-weight:bold;font-size:16px">Grand Total:</td><td style="padding:8px 15px;border-top:2px solid #333;text-align:right;font-weight:bold;font-size:16px">${formatPaise(invoice.grandTotal)}</td></tr>
        </table>
      </div>
      <hr style="border:none;border-top:1px solid #eee">
      <div style="margin:15px 0">
        <strong>Payment Details:</strong>
        <ul style="list-style:none;padding:0">${paymentRows}</ul>
        <p style="font-size:12px;color:#888">Status: <strong style="color:${invoice.paymentStatus === "paid" ? "#059669" : "#dc2626"}">${invoice.paymentStatus.toUpperCase()}</strong></p>
      </div>
      <div style="text-align:center;margin-top:30px;color:#999;font-size:12px">
        <p>Thank you for your purchase!</p>
        <p>This is a computer-generated invoice.</p>
      </div>
    </body>
    </html>`;
}

export async function sendInvoiceEmail(
  invoice: IInvoice,
  pdfBuffer: Buffer,
  recipientEmail: string,
): Promise<{ success: boolean; message: string }> {
  if (!process.env["SMTP_USER"] || !process.env["SMTP_PASS"]) {
    return { success: false, message: "SMTP credentials not configured" };
  }

  const storeName = process.env["STORE_NAME"] ?? "Smart Inventory Store";

  const info = await transporter.sendMail({
    from: process.env["SMTP_FROM"] ?? `${storeName} <${process.env["SMTP_USER"]}>`,
    to: recipientEmail,
    subject: `Invoice ${invoice.invoiceNumber} - ${storeName}`,
    html: buildEmailHTML(invoice),
    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return { success: true, message: `Email sent: ${info.messageId}` };
}
