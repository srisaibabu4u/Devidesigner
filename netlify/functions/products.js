import { json, isAuthed, unauthorized, readProducts, writeProducts, sanitizeProduct, imageStore } from "../lib/util.js";

export default async (req, context) => {
  const id = context.params?.id;
  const admin = isAuthed(req);

  if (req.method === "GET") {
    const list = await readProducts();
    const visible = admin ? list : list.filter((p) => p.visible);
    if (id) {
      const p = visible.find((x) => x.id === id);
      return p ? json(p) : json({ error: "Not found" }, 404);
    }
    return json(visible.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
  }

  if (!admin) return unauthorized();
  let body = {};
  try { body = await req.json(); } catch {}
  const list = await readProducts();

  if (req.method === "POST" && !id) {
    const incoming = Array.isArray(body.products) ? body.products : [body];
    const created = incoming.slice(0, 500).map((p) => sanitizeProduct(p));
    await writeProducts([...created, ...list]);
    return json({ created }, 201);
  }

  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return json({ error: "Not found" }, 404);

  if (req.method === "PUT") {
    list[idx] = sanitizeProduct(body, list[idx]);
    await writeProducts(list);
    return json(list[idx]);
  }

  if (req.method === "DELETE") {
    const [removed] = list.splice(idx, 1);
    await writeProducts(list);
    const store = imageStore();
    await Promise.all(
      (removed.images || [])
        .filter((u) => u.startsWith("/api/images/"))
        .map((u) => store.delete(decodeURIComponent(u.replace("/api/images/", ""))).catch(() => {}))
    );
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: ["/api/products", "/api/products/:id"] };
