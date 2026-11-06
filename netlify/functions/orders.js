import { json, isAuthed, unauthorized, catalogStore, newId, readProducts } from "../lib/util.js";

const s = (v, n = 300) => (v == null ? "" : String(v).slice(0, n).trim());

export default async (req, context) => {
  const store = catalogStore();
  const orders = (await store.get("orders.json", { type: "json" })) || [];
  const id = context.params?.id;

  if (req.method === "POST" && !id) {
    let body = {};
    try { body = await req.json(); } catch {}
    const c = body.customer || {};
    if (!s(c.name) || !s(c.phone) || !s(c.address, 800)) return json({ error: "Name, phone and address are required." }, 400);
    const products = await readProducts();
    const items = (Array.isArray(body.items) ? body.items : []).slice(0, 50).map((it) => {
      const p = products.find((x) => x.id === it.id && x.visible);
      return p ? { id: p.id, name: p.name, price: p.price, image: p.images?.[0] || "", qty: Math.max(1, Math.min(20, Math.floor(it.qty) || 1)) } : null;
    }).filter(Boolean);
    if (!items.length) return json({ error: "Your bag is empty." }, 400);
    const order = {
      id: `DDB-${Date.now().toString(36).toUpperCase()}-${newId().slice(0, 4).toUpperCase()}`,
      customer: { name: s(c.name, 120), phone: s(c.phone, 40), email: s(c.email, 160), address: s(c.address, 800), note: s(c.note, 800) },
      items,
      total: items.reduce((t, i) => t + i.price * i.qty, 0),
      status: "New",
      createdAt: new Date().toISOString(),
    };
    await store.setJSON("orders.json", [order, ...orders]);
    return json({ id: order.id, total: order.total }, 201);
  }

  if (!isAuthed(req)) return unauthorized();

  if (req.method === "GET") return json(orders);

  if (req.method === "PUT" && id) {
    let body = {};
    try { body = await req.json(); } catch {}
    const o = orders.find((x) => x.id === id);
    if (!o) return json({ error: "Not found" }, 404);
    if (["New", "Confirmed", "Shipped", "Delivered", "Cancelled"].includes(body.status)) o.status = body.status;
    await store.setJSON("orders.json", orders);
    return json(o);
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: ["/api/orders", "/api/orders/:id"] };
