import type { Request, Response } from "express";
import { AdminSettings } from "./admin-settings.model.js";
import { ok } from "../response/api-response.js";
import { cloudinary } from "../../infrastructure/cloudinary/cloudinary.js";

/**
 * GET /api/v1/admin/settings
 * Admin-only — returns the admin settings (singleton).
 */
export async function getAdminSettings(
  _req: Request,
  res: Response,
): Promise<void> {
  let settings = await AdminSettings.findOne();

  if (!settings) {
    settings = await AdminSettings.create({});
  }

  res.status(200).json(ok(settings.toObject()));
}

/**
 * PUT /api/v1/admin/settings
 * Admin-only — updates admin settings.
 */
export async function updateAdminSettings(
  req: Request,
  res: Response,
): Promise<void> {
  let settings = await AdminSettings.findOne();

  if (!settings) {
    settings = new AdminSettings();
  }

  const body = req.body as Record<string, unknown>;

  if (body.payment && typeof body.payment === "object") {
    Object.assign(settings.payment, body.payment);
  }

  if (body.shipping && typeof body.shipping === "object") {
    const shippingData = body.shipping as Record<string, unknown>;
    if (shippingData.shippingZones !== undefined) {
      settings.shipping.shippingZones = shippingData.shippingZones as typeof settings.shipping.shippingZones;
      delete shippingData.shippingZones;
    }
    Object.assign(settings.shipping, shippingData);
  }

  if (body.invoice && typeof body.invoice === "object") {
    Object.assign(settings.invoice, body.invoice);
  }

  if (body.theme && typeof body.theme === "object") {
    Object.assign(settings.theme, body.theme);
  }

  if (body.security && typeof body.security === "object") {
    Object.assign(settings.security, body.security);
  }

  if (body.notifications && typeof body.notifications === "object") {
    Object.assign(settings.notifications, body.notifications);
  }

  if (body.backup && typeof body.backup === "object") {
    Object.assign(settings.backup, body.backup);
  }

  if (body.printer && typeof body.printer === "object") {
    Object.assign(settings.printer, body.printer);
  }

  if (body.cloudinary && typeof body.cloudinary === "object") {
    Object.assign(settings.cloudinary, body.cloudinary);
  }

  const files = req.files as
    | Record<string, Express.Multer.File[]>
    | undefined;

  if (files?.upiQr?.[0]) {
    if (settings.payment.upiQrPublicId) {
      await cloudinary.uploader
        .destroy(settings.payment.upiQrPublicId)
        .catch(() => {});
    }
    const f = files.upiQr[0];
    settings.payment.upiQrUrl = f.path;
    settings.payment.upiQrPublicId = f.filename;
  }

  if (body.removeUpiQr === "true" && settings.payment.upiQrPublicId) {
    await cloudinary.uploader
      .destroy(settings.payment.upiQrPublicId)
      .catch(() => {});
    settings.payment.upiQrUrl = "";
    settings.payment.upiQrPublicId = "";
  }

  await settings.save();

  res.status(200).json(ok(settings.toObject()));
}

/**
 * POST /api/v1/admin/settings/reset
 * Admin-only — resets all settings to defaults.
 */
export async function resetAdminSettings(
  _req: Request,
  res: Response,
): Promise<void> {
  await AdminSettings.deleteMany({});
  const settings = await AdminSettings.create({});

  res.status(200).json(ok(settings.toObject()));
}
