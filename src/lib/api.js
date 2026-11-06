const TOKEN_KEY = "ddb_admin_token";

export const getToken = () => {
  try {
    const t = localStorage.getItem(TOKEN_KEY);
    if (!t) return null;
    const payload = JSON.parse(atob(t.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp < Date.now()) { localStorage.removeItem(TOKEN_KEY); return null; }
    return t;
  } catch { return null; }
};
export const isLoggedIn = () => Boolean(getToken());
export const logout = () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} };

async function request(path, { method = "GET", body, raw, headers = {} } = {}) {
  const token = getToken();
  const res = await fetch(path, {
    method,
    headers: {
      ...(raw ? {} : body ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw || (body ? JSON.stringify(body) : undefined),
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (res.status === 401 && token) logout();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  async login(username, password) {
    const { token } = await request("/api/login", { method: "POST", body: { username, password } });
    localStorage.setItem(TOKEN_KEY, token);
  },
  products: () => request("/api/products"),
  product: (id) => request(`/api/products/${id}`),
  createProducts: (products) => request("/api/products", { method: "POST", body: { products } }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: "PUT", body: data }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),
  uploadImage: (blob, name = "") =>
    request("/api/images", { method: "POST", raw: blob, headers: { "content-type": blob.type, "x-file-name": encodeURIComponent(name) } }),
  placeOrder: (order) => request("/api/orders", { method: "POST", body: order }),
  orders: () => request("/api/orders"),
  updateOrder: (id, status) => request(`/api/orders/${id}`, { method: "PUT", body: { status } }),
};
