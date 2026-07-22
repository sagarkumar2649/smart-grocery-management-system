import PDFDocument from "pdfkit";
import type { IInvoice } from "./invoice.model.js";

const GST_SLABS = [0, 5, 12, 18, 28] as const;

function formatPaise(amount: number): string {
  return `₹${(amount / 100).toFixed(2)}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function generateInvoicePDF(invoice: IInvoice): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100;

    // ── Header ───────────────────────────────────────────────────────────────
    doc
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("INVOICE", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#666666")
      .text(`Invoice #: ${invoice.invoiceNumber}`, { align: "center" })
      .text(`Date: ${formatDate(invoice.createdAt)}  |  Time: ${formatTime(invoice.createdAt)}`, {
        align: "center",
      })
      .moveDown(0.5);

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .stroke("#cccccc")
      .moveDown(0.5);

    // ── Customer & Cashier Info ──────────────────────────────────────────────
    const infoY = doc.y;
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333");

    doc.text("BILL TO:", 50, infoY);
    doc.font("Helvetica").fillColor("#555555");
    const customerName = invoice.customerName || "Walk-in Customer";
    doc.text(customerName, 50, infoY + 12);
    if (invoice.customerPhone) {
      doc.text(`Phone: ${invoice.customerPhone}`, 50, infoY + 24);
    }
    if (invoice.customerEmail) {
      doc.text(`Email: ${invoice.customerEmail}`, 50, infoY + 36);
    }

    doc.font("Helvetica-Bold").fillColor("#333333");
    const rightX = 50 + pageWidth / 2 + 20;
    doc.text("CASHIER:", rightX, infoY);
    doc.font("Helvetica").fillColor("#555555");
    doc.text(invoice.cashierName, rightX, infoY + 12);

    doc.y = infoY + 50;

    // ── Items Table ──────────────────────────────────────────────────────────
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .stroke("#cccccc")
      .moveDown(0.3);

    // Table header
    const tableTop = doc.y;
    const colWidths = {
      sn: 30,
      name: 170,
      qty: 50,
      rate: 80,
      disc: 60,
      gst: 50,
      total: 80,
    };
    const colX = {
      sn: 50,
      name: 50 + colWidths.sn,
      qty: 50 + colWidths.sn + colWidths.name,
      rate: 50 + colWidths.sn + colWidths.name + colWidths.qty,
      disc: 50 + colWidths.sn + colWidths.name + colWidths.qty + colWidths.rate,
      gst: 50 + colWidths.sn + colWidths.name + colWidths.qty + colWidths.rate + colWidths.disc,
      total:
        50 + colWidths.sn + colWidths.name + colWidths.qty + colWidths.rate + colWidths.disc + colWidths.gst,
    };

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#333333");
    doc.text("#", colX.sn, tableTop, { width: colWidths.sn, align: "center" });
    doc.text("Item", colX.name, tableTop, { width: colWidths.name });
    doc.text("Qty", colX.qty, tableTop, { width: colWidths.qty, align: "center" });
    doc.text("Rate", colX.rate, tableTop, { width: colWidths.rate, align: "right" });
    doc.text("Disc", colX.disc, tableTop, { width: colWidths.disc, align: "right" });
    doc.text("GST%", colX.gst, tableTop, { width: colWidths.gst, align: "center" });
    doc.text("Total", colX.total, tableTop, { width: colWidths.total, align: "right" });

    doc.y = tableTop + 14;
    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .stroke("#dddddd")
      .moveDown(0.2);

    // Table rows
    doc.font("Helvetica").fontSize(8).fillColor("#444444");
    for (let i = 0; i < invoice.items.length; i++) {
      const item = invoice.items[i]!;
      const rowY = doc.y;

      doc.text(String(i + 1), colX.sn, rowY, { width: colWidths.sn, align: "center" });
      doc.text(item.name, colX.name, rowY, { width: colWidths.name });
      doc.text(String(item.quantity), colX.qty, rowY, { width: colWidths.qty, align: "center" });
      doc.text(formatPaise(item.unitPrice), colX.rate, rowY, {
        width: colWidths.rate,
        align: "right",
      });
      doc.text(
        item.discount > 0 ? formatPaise(item.discount) : "-",
        colX.disc,
        rowY,
        { width: colWidths.disc, align: "right" },
      );
      doc.text(`${item.gstPercent}%`, colX.gst, rowY, { width: colWidths.gst, align: "center" });
      doc.text(formatPaise(item.total), colX.total, rowY, {
        width: colWidths.total,
        align: "right",
      });

      doc.y = rowY + 14;

      if (i < invoice.items.length - 1) {
        doc
          .moveTo(50, doc.y)
          .lineTo(50 + pageWidth, doc.y)
          .stroke("#eeeeee")
          .moveDown(0.1);
      }
    }

    doc
      .moveTo(50, doc.y)
      .lineTo(50 + pageWidth, doc.y)
      .stroke("#cccccc")
      .moveDown(0.5);

    // ── Totals ───────────────────────────────────────────────────────────────
    const totalsX = 50 + pageWidth - 200;
    const totalsValueX = 50 + pageWidth;
    let totalsY = doc.y;

    const drawTotalLine = (label: string, amount: number, bold = false) => {
      doc
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(bold ? 10 : 9)
        .fillColor(bold ? "#000000" : "#555555");
      doc.text(label, totalsX, totalsY, { width: 120, align: "right" });
      doc.text(formatPaise(amount), totalsValueX - 80, totalsY, {
        width: 80,
        align: "right",
      });
      totalsY += bold ? 18 : 14;
    };

    drawTotalLine("Subtotal:", invoice.subtotal);
    if (invoice.totalItemDiscount > 0) {
      drawTotalLine("Item Discount:", -invoice.totalItemDiscount);
    }
    if (invoice.couponDiscount > 0) {
      drawTotalLine(`Coupon (${invoice.couponCode}):`, -invoice.couponDiscount);
    }
    if (invoice.totalGST > 0) {
      drawTotalLine("CGST:", invoice.gstBreakdown.cgst);
      drawTotalLine("SGST:", invoice.gstBreakdown.sgst);
      if (invoice.gstBreakdown.igst > 0) {
        drawTotalLine("IGST:", invoice.gstBreakdown.igst);
      }
    }

    totalsY += 4;
    doc
      .moveTo(totalsX, totalsY)
      .lineTo(totalsValueX, totalsY)
      .stroke("#333333");
    totalsY += 8;

    drawTotalLine("GRAND TOTAL:", invoice.grandTotal, true);

    // ── Payment Info ─────────────────────────────────────────────────────────
    totalsY += 10;
    doc
      .moveTo(50, totalsY)
      .lineTo(50 + pageWidth, totalsY)
      .stroke("#cccccc")
      .moveDown(0.3);
    totalsY = doc.y;

    doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333");
    doc.text("PAYMENT DETAILS", 50, totalsY);
    totalsY += 14;

    doc.font("Helvetica").fontSize(8).fillColor("#555555");
    for (const payment of invoice.payments) {
      const methodLabel =
        payment.method === "cash"
          ? "Cash"
          : payment.method === "upi"
            ? `UPI${payment.upiTransactionId ? ` (${payment.upiTransactionId})` : ""}`
            : payment.method === "card"
              ? `Card${payment.cardType ? ` (${payment.cardType})` : ""}${payment.cardLast4 ? ` ****${payment.cardLast4}` : ""}`
              : "Split";
      doc.text(`${methodLabel}: ${formatPaise(payment.amount)}`, 50, totalsY);
      totalsY += 12;
    }

    doc.fontSize(8).font("Helvetica-Bold").fillColor("#333333");
    doc.text(`Status: ${invoice.paymentStatus.toUpperCase()}`, 50, totalsY);
    totalsY += 20;

    // ── GST Summary ──────────────────────────────────────────────────────────
    if (invoice.totalGST > 0) {
      doc
        .moveTo(50, totalsY)
        .lineTo(50 + pageWidth, totalsY)
        .stroke("#cccccc")
        .moveDown(0.3);
      totalsY = doc.y;

      doc.fontSize(9).font("Helvetica-Bold").fillColor("#333333");
      doc.text("GST SUMMARY", 50, totalsY);
      totalsY += 14;

      // Group items by GST rate
      const gstGroups = new Map<number, { taxableAmount: number; gstAmount: number }>();
      for (const item of invoice.items) {
        const existing = gstGroups.get(item.gstPercent) ?? { taxableAmount: 0, gstAmount: 0 };
        existing.taxableAmount += item.total - item.gstAmount;
        existing.gstAmount += item.gstAmount;
        gstGroups.set(item.gstPercent, existing);
      }

      doc.font("Helvetica").fontSize(8).fillColor("#555555");
      for (const rate of GST_SLABS) {
        const group = gstGroups.get(rate);
        if (!group) continue;
        doc.text(
          `GST ${rate}%: Taxable ${formatPaise(group.taxableAmount)} | GST ${formatPaise(group.gstAmount)} | CGST ${formatPaise(group.gstAmount / 2)} | SGST ${formatPaise(group.gstAmount / 2)}`,
          50,
          totalsY,
        );
        totalsY += 12;
      }
      totalsY += 8;
    }

    // ── Footer ───────────────────────────────────────────────────────────────
    doc
      .moveTo(50, totalsY)
      .lineTo(50 + pageWidth, totalsY)
      .stroke("#cccccc")
      .moveDown(0.5);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999999")
      .text("Thank you for your purchase!", { align: "center" })
      .text("This is a computer-generated invoice.", { align: "center" });

    doc.end();
  });
}
