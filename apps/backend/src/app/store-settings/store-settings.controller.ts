import type { Request, Response } from "express";
import { StoreSettings } from "./store-settings.model.js";
import { ok } from "../response/api-response.js";
import { cloudinary } from "../../infrastructure/cloudinary/cloudinary.js";

/**
 * GET /api/v1/store-settings
 * Public — returns the store settings (singleton).
 */
export async function getStoreSettings(
  _req: Request,
  res: Response,
): Promise<void> {
  let settings = await StoreSettings.findOne();

  if (!settings) {
    settings = await StoreSettings.create({
      storeName: "Sagar General Store",
      storeDescription:
        "Your trusted neighbourhood grocery store for fresh produce and daily essentials.",
    });
  }

  res.status(200).json(ok(settings.toObject()));
}

/**
 * PUT /api/v1/store-settings
 * Admin-only — updates store settings fields.
 * Accepts multipart form data with optional image files.
 */
export async function updateStoreSettings(
  req: Request,
  res: Response,
): Promise<void> {
  let settings = await StoreSettings.findOne();

  if (!settings) {
    settings = new StoreSettings();
  }

  const {
    storeName,
    storeDescription,
    storeAddress,
    phoneNumber,
    whatsappNumber,
    openingHours,
    storeEmail,
    city,
    state,
    pincode,
    gstNumber,
    panNumber,
    currency,
    timezone,
    language,
    tagline,
    brandColor,
  } = req.body as Record<string, string>;

  if (storeName !== undefined) settings.storeName = storeName;
  if (storeDescription !== undefined)
    settings.storeDescription = storeDescription;
  if (storeAddress !== undefined) settings.storeAddress = storeAddress;
  if (phoneNumber !== undefined) settings.phoneNumber = phoneNumber;
  if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
  if (openingHours !== undefined) settings.openingHours = openingHours;
  if (storeEmail !== undefined) settings.storeEmail = storeEmail;
  if (city !== undefined) settings.city = city;
  if (state !== undefined) settings.state = state;
  if (pincode !== undefined) settings.pincode = pincode;
  if (gstNumber !== undefined) settings.gstNumber = gstNumber;
  if (panNumber !== undefined) settings.panNumber = panNumber;
  if (currency !== undefined) settings.currency = currency;
  if (timezone !== undefined) settings.timezone = timezone;
  if (language !== undefined) settings.language = language;
  if (tagline !== undefined) settings.tagline = tagline;
  if (brandColor !== undefined) settings.brandColor = brandColor;

  const files = req.files as
    | Record<string, Express.Multer.File[]>
    | undefined;

  if (files?.heroBanner?.[0]) {
    if (settings.heroBanner?.publicId) {
      await cloudinary.uploader
        .destroy(settings.heroBanner.publicId)
        .catch(() => {});
    }
    const f = files.heroBanner[0];
    settings.heroBanner = { url: f.path, publicId: f.filename };
  }

  if (files?.storeFront?.[0]) {
    if (settings.storeFront?.publicId) {
      await cloudinary.uploader
        .destroy(settings.storeFront.publicId)
        .catch(() => {});
    }
    const f = files.storeFront[0];
    settings.storeFront = { url: f.path, publicId: f.filename };
  }

  if (files?.logo?.[0]) {
    if (settings.logo?.publicId) {
      await cloudinary.uploader
        .destroy(settings.logo.publicId)
        .catch(() => {});
    }
    const f = files.logo[0];
    settings.logo = { url: f.path, publicId: f.filename };
  }

  if (files?.favicon?.[0]) {
    if (settings.favicon?.publicId) {
      await cloudinary.uploader
        .destroy(settings.favicon.publicId)
        .catch(() => {});
    }
    const f = files.favicon[0];
    settings.favicon = { url: f.path, publicId: f.filename };
  }

  if (files?.interiorGallery) {
    const newImages = files.interiorGallery.map((f) => ({
      url: f.path,
      publicId: f.filename,
    }));
    settings.interiorGallery.push(...newImages);
  }

  const removeInterior = req.body.removeInterior as string | undefined;
  if (removeInterior) {
    const idsToRemove = removeInterior.split(",").filter(Boolean);
    for (const id of idsToRemove) {
      const img = settings.interiorGallery.find((i) => i.publicId === id);
      if (img) {
        await cloudinary.uploader.destroy(img.publicId).catch(() => {});
      }
    }
    settings.interiorGallery = settings.interiorGallery.filter(
      (i) => !idsToRemove.includes(i.publicId),
    );
  }

  await settings.save();

  res.status(200).json(ok(settings.toObject()));
}
