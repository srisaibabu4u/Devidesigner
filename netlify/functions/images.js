import { json, isAuthed, unauthorized, imageStore, newId } from "../lib/util.js";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export default async (req, context) => {
  const key = context.params?.key ? decodeURIComponent(context.params.key) : null;
  const store = imageStore();

  if (req.method === "GET" && key) {
    const res = await store.getWithMetadata(key, { type: "arrayBuffer" });
    if (!res) return new Response("Not found", { status: 404 });
    return new Response(res.data, {
      headers: {
        "content-type": res.metadata?.contentType || "image/jpeg",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  if (!isAuthed(req)) return unauthorized();

  if (req.method === "POST") {
    const type = (req.headers.get("content-type") || "").split(";")[0];
    if (!ALLOWED.includes(type)) return json({ error: `Unsupported image type: ${type}` }, 415);
    const data = await req.arrayBuffer();
    if (data.byteLength > 5.5 * 1024 * 1024) return json({ error: "Image too large (max 5.5MB)" }, 413);
    const ext = type.split("/")[1].replace("jpeg", "jpg");
    const newKey = `${Date.now()}-${newId()}.${ext}`;
    await store.set(newKey, data, { metadata: { contentType: type, name: req.headers.get("x-file-name") || "" } });
    return json({ key: newKey, url: `/api/images/${encodeURIComponent(newKey)}` }, 201);
  }

  if (req.method === "DELETE" && key) {
    await store.delete(key);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
};

export const config = { path: ["/api/images", "/api/images/:key"] };
