const ADMIN_KEY = "ddb_admin_token";
const CUSTOMER_KEY = "ddb_customer_token";

const readToken = (key) => {
  try {
    const t = localStorage.getItem(key);
    if (!t) return null;
    const payload = JSON.parse(atob(t.split(".")[0].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp < Date.now()) { localStorage.removeItem(key); return null; }
    return t;
  } catch { return null; }
};

export const getToken = () => readToken(ADMIN_KEY);
export const isLoggedIn = () => Boolean(getToken());
export const logout = () => { try { localStorage.removeItem(ADMIN_KEY); } catch {} };

export const getCustomerToken = () => readToken(CUSTOMER_KEY);
export const setCustomerToken = (t) => { try { localStorage.setItem(CUSTOMER_KEY, t); } catch {} };
export const clearCustomerToken = () => { try { localStorage.removeItem(CUSTOMER_KEY); } catch {} };

async function request(path, { method = "GET", body, raw, headers = {}, as = "admin" } = {}) {
  const token = as === "customer" ? getCustomerToken() : getToken();
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
  if (res.status === 401 && token) (as === "customer" ? clearCustomerToken : logout)();
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // ---- admin ----
  async login(username, password) {
    const { token } = await request("/api/login", { method: "POST", body: { username, password } });
    localStorage.setItem(ADMIN_KEY, token);
  },
  products: () => request("/api/products"),
  product: (id) => request(`/api/products/${id}`),
  createProducts: (products) => request("/api/products", { method: "POST", body: { products } }),
  updateProduct: (id, data) => request(`/api/products/${id}`, { method: "PUT", body: data }),
  deleteProduct: (id) => request(`/api/products/${id}`, { method: "DELETE" }),
  uploadImage: (blob, name = "") =>
    request("/api/images", { method: "POST", raw: blob, headers: { "content-type": blob.type, "x-file-name": encodeURIComponent(name) } }),
  orders: () => request("/api/orders"),
  updateOrder: (id, status) => request(`/api/orders/${id}`, { method: "PUT", body: { status } }),

  // ---- customers ----
  placeOrder: (order) => request("/api/orders", { method: "POST", body: order, as: "customer" }),
  register: (data) => request("/api/account/register", { method: "POST", body: data, as: "customer" }),
  customerLogin: (data) => request("/api/account/login", { method: "POST", body: data, as: "customer" }),
  me: () => request("/api/account", { as: "customer" }),
  updateMe: (data) => request("/api/account", { method: "PUT", body: data, as: "customer" }),
  myOrders: () => request("/api/account/orders", { as: "customer" }),
};
