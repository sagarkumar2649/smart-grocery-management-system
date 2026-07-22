import { Router } from "express";
import { requireAdmin } from "../middlewares/auth.middleware.js";
import {
  searchPOSProducts,
  getProductByBarcode,
  checkout,
  listInvoices,
  getInvoice,
  downloadInvoicePDF,
  voidInvoice,
  validateCoupon,
  emailInvoice,
  getWhatsAppLink,
} from "./pos.controller.js";

export function buildPOSRouter(): Router {
  const router = Router();

  router.use(requireAdmin);

  router.get("/products", searchPOSProducts);
  router.get("/products/barcode/:barcode", getProductByBarcode);
  router.post("/checkout", checkout);
  router.get("/invoices", listInvoices);
  router.get("/invoices/:id", getInvoice);
  router.get("/invoices/:id/pdf", downloadInvoicePDF);
  router.post("/invoices/:id/void", voidInvoice);
  router.post("/validate-coupon", validateCoupon);
  router.post("/send-email/:id", emailInvoice);
  router.get("/send-whatsapp/:id", getWhatsAppLink);

  return router;
}
