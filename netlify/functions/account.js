import {
  json, customerStore, customerSession, signToken, emailKey, hashPassword, verifyPassword,
  catalogStore, newId,
} from "../lib/util.js";

const CUSTOMER_TTL = 1000 * 60 * 60 * 24 * 30; // 30 days
const s = (v, n = 300) => (v == null ? "" : String(v).slice(0, n).trim());
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const publicProfile = (c) => ({
  id: c.id, name: c.name, email: c.email, phone: c.phone || "", address: c.address || "",
  wishlist: c.wishlist || [], createdAt: c.createdAt,
});
const tokenFor = (c) => signToken({ role: "customer", sub: c.email, name: c.name }, CUSTOMER_TTL);
const slow = () => new Promise((r) => setTimeout(r, 600));

export default async (req, context) => {
  const action = context.params?.action || "";
  const store = customerStore();
  let body = {};
  if (req.method !== "GET") { try { body = await req.json(); } catch {} }

  // ---- Create account ----
  if (action === "register" && req.method === "POST") {
    const email = s(body.email, 160).toLowerCase();
    const name = s(body.name, 120);
    const password = String(body.password || "");
    if (!name) return json({ error: "Please enter your name." }, 400);
    if (!EMAIL_RE.test(email)) return json({ error: "Please enter a valid email address." }, 400);
    if (password.length < 8) return json({ error: "Password must be at least 8 characters." }, 400);
    if (await store.get(emailKey(email))) return json({ error: "An account with this email already exists. Please sign in." }, 409);
    const wishlist = Array.isArray(body.wishlist) ? body.wishlist.map((x) => s(x, 40)).slice(0, 200) : [];
    const c = {
      id: newId(), name, email, phone: s(body.phone, 40), address: "", wishlist,
      password: hashPassword(password), createdAt: new Date().toISOString(),
    };
    await store.setJSON(emailKey(email), c);
    return json({ token: tokenFor(c), user: publicProfile(c) }, 201);
  }

  // ---- Sign in ----
  if (action === "login" && req.method === "POST") {
    const email = s(body.email, 160).toLowerCase();
    const c = email && (await store.get(emailKey(email), { type: "json" }));
    if (!c || !verifyPassword(body.password || "", c.password)) {
      await slow();
      return json({ error: "Incorrect email or password." }, 401);
    }
    // merge any guest wishlist into the account
    if (Array.isArray(body.wishlist) && body.wishlist.length) {
      c.wishlist = [...new Set([...(c.wishlist || []), ...body.wishlist.map((x) => s(x, 40))])].slice(0, 200);
      await store.setJSON(emailKey(email), c);
    }
    return json({ token: tokenFor(c), user: publicProfile(c) });
  }

  // ---- Everything below needs a signed-in customer ----
  const session = customerSession(req);
  if (!session) return json({ error: "Please sign in." }, 401);
  const key = emailKey(session.sub);
  const c = await store.get(key, { type: "json" });
  if (!c) return json({ error: "Account not found." }, 401);

  if (action === "" && req.method === "GET") return json(publicProfile(c));

  if (action === "" && req.method === "PUT") {
    if (body.name !== undefined) c.name = s(body.name, 120) || c.name;
    if (body.phone !== undefined) c.phone = s(body.phone, 40);
    if (body.address !== undefined) c.address = s(body.address, 800);
    if (Array.isArray(body.wishlist)) c.wishlist = [...new Set(body.wishlist.map((x) => s(x, 40)))].slice(0, 200);
    if (body.newPassword) {
      if (!verifyPassword(body.currentPassword || "", c.password)) return json({ error: "Current password is incorrect." }, 400);
      if (String(body.newPassword).length < 8) return json({ error: "New password must be at least 8 characters." }, 400);
      c.password = hashPassword(body.newPassword);
    }
    await store.setJSON(key, c);
    return json(publicProfile(c));
  }

  if (action === "orders" && req.method === "GET") {
    const orders = (await catalogStore().get("orders.json", { type: "json" })) || [];
    return json(orders.filter((o) => o.customerEmail === c.email));
  }

  return json({ error: "Not found" }, 404);
};

export const config = { path: ["/api/account", "/api/account/:action"] };
