import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

export const catalogStore = () => getStore({ name: "catalog", consistency: "strong" });
export const imageStore = () => getStore({ name: "images", consistency: "strong" });
export const customerStore = () => getStore({ name: "customers", consistency: "strong" });

const secret = () =>
  process.env.AUTH_SECRET || `${process.env.ADMIN_PASSWORD || ""}::devi-designer-beads`;

const b64url = (buf) => Buffer.from(buf).toString("base64url");

export function signToken(payload, ttl = TOKEN_TTL_MS) {
  const body = b64url(JSON.stringify({ ...payload, exp: Date.now() + ttl }));
  const sig = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyToken(token) {
  if (!token || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  const expected = crypto.createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export function safeEqual(a = "", b = "") {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function getSession(req) {
  const h = req.headers.get("authorization") || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  return verifyToken(token);
}

// Admin-only check — customer sessions never pass this.
export function isAuthed(req) {
  return getSession(req)?.role === "admin";
}

export function customerSession(req) {
  const s = getSession(req);
  return s?.role === "customer" && s.sub ? s : null;
}

export const emailKey = (email) =>
  "u/" + crypto.createHash("sha256").update(String(email).trim().toLowerCase()).digest("hex");

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored = "") {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(String(password), salt, 64);
  const known = Buffer.from(hash, "hex");
  return known.length === test.length && crypto.timingSafeEqual(known, test);
}

export const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers },
  });

export const unauthorized = () => json({ error: "Unauthorized" }, 401);

export const newId = () => crypto.randomBytes(9).toString("base64url");

export async function readProducts() {
  return (await catalogStore().get("products.json", { type: "json" })) || [];
}
export async function writeProducts(list) {
  await catalogStore().setJSON("products.json", list);
}

const str = (v, max = 2000) => (v == null ? "" : String(v).slice(0, max).trim());
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : 0;
};

export function sanitizeProduct(input = {}, existing = {}) {
  const merged = { ...existing, ...input };
  return {
    id: existing.id || newId(),
    name: str(merged.name, 140) || "Untitled Piece",
    sku: str(merged.sku, 60),
    category: str(merged.category, 60) || "Jewellery",
    gender: ["Women", "Men", "Unisex"].includes(merged.gender) ? merged.gender : "Women",
    price: num(merged.price),
    comparePrice: num(merged.comparePrice),
    material: str(merged.material, 140),
    description: str(merged.description, 4000),
    images: Array.isArray(merged.images) ? merged.images.map((u) => str(u, 500)).filter(Boolean).slice(0, 12) : [],
    stock: Math.max(0, Math.floor(Number(merged.stock) || 0)),
    featured: Boolean(merged.featured),
    visible: merged.visible === undefined ? true : Boolean(merged.visible),
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
