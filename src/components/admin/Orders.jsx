import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { money } from "../../lib/format.js";

const STATUSES = ["New", "Confirmed", "Shipped", "Delivered", "Cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.orders().then(setOrders).catch((e) => setErr(e.message)); }, []);
  const setStatus = async (o, status) => {
    setOrders((cur) => cur.map((x) => (x.id === o.id ? { ...x, status } : x)));
    try { await api.updateOrder(o.id, status); } catch (e) { setErr(e.message); }
  };
  if (err) return <p className="error">{err}</p>;
  if (!orders) return <p className="muted">Loading…</p>;
  if (!orders.length) return <div className="empty-state panel"><h3>No orders yet</h3><p>Orders placed at checkout will appear here.</p></div>;
  return (
    <div className="orders">
      {orders.map((o) => (
        <div key={o.id} className="order panel">
          <div className="order__head">
            <div><strong>{o.id}</strong><span className="muted small"> · {new Date(o.createdAt).toLocaleString()}</span></div>
            <select value={o.status} onChange={(e) => setStatus(o, e.target.value)} className={`status status--${o.status.toLowerCase()}`}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="order__body">
            <div>
              <p><strong>{o.customer.name}</strong> · <a href={`tel:${o.customer.phone}`}>{o.customer.phone}</a>{o.customer.email && <> · <a href={`mailto:${o.customer.email}`}>{o.customer.email}</a></>}</p>
              <p className="muted">{o.customer.address}</p>
              {o.customer.note && <p className="small">Note: {o.customer.note}</p>}
            </div>
            <ul>{o.items.map((i) => <li key={i.id}>{i.qty} × {i.name} <span className="muted">{money(i.price * i.qty)}</span></li>)}</ul>
            <strong className="order__total">{money(o.total)}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
