export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

export function sanitizeText(value: string) {
  return value.replace(/<[^>]*>/g, "").replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function sanitizeEmail(value: string) {
  return sanitizeText(value).toLowerCase();
}

export function normalizePhone(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "").trim();
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned;
  return `+${cleaned}`;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());
}

export function validateUpload(file: File | undefined, kind: "document" | "image") {
  if (!file) return { ok: false, reason: "No file selected." };
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { ok: false, reason: `${kind === "image" ? "Image" : "Document"} size must be 5 MB or less.` };
  }
  const allowedTypes = kind === "image" ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
  if (!allowedTypes.has(file.type)) {
    return { ok: false, reason: `Unsupported ${kind} type.` };
  }
  return { ok: true };
}
