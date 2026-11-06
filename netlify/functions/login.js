import { json, safeEqual, signToken, isAuthed } from "../lib/util.js";

export default async (req) => {
  if (req.method === "GET") return json({ authenticated: isAuthed(req) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const configured = process.env.ADMIN_PASSWORD;
  if (!configured) {
    return json({ error: "ADMIN_PASSWORD is not configured on the server." }, 500);
  }
  let body = {};
  try { body = await req.json(); } catch {}
  const userOk = safeEqual((body.username || "").toLowerCase(), (process.env.ADMIN_USERNAME || "admin").toLowerCase());
  const passOk = safeEqual(body.password || "", configured);
  if (!userOk || !passOk) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return json({ error: "Invalid username or password." }, 401);
  }
  return json({ token: signToken({ role: "admin" }) });
};

export const config = { path: "/api/login" };
