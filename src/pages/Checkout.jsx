import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../lib/cart.jsx";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";
import { Ornament } from "../components/Icons.jsx";
import { ProductImage } from "../components/ProductCard.jsx";

export default function Checkout() {
  const { items, total, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      const res = await api.placeOrder({ customer: form, items: items.map((i) => ({ id: i.id, qty: i.qty })) });
      setDone(res); clear();
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  if (done) return (
    <section className="container confirm">
      <p className="eyebrow">Thank you</p>
      <h1>Your order is placed</h1><Ornament />
      <p>Order reference <strong>{done.id}</strong> · {money(done.total)}</p>
      <p className="muted">Our atelier will contact you shortly to confirm payment and delivery.</p>
      <Link to="/shop" className="btn btn--dark">Continue shopping</Link>
    </section>
  );

  if (!items.length) return (
    <section className="container confirm"><h1>Your bag is empty</h1><Ornament /><Link to="/shop" className="btn btn--dark">Discover the collection</Link></section>
  );

  return (
    <section className="container checkout">
      <form className="checkout__form panel" onSubmit={submit}>
        <h2>Delivery details</h2>
        <div className="field-row">
          <label className="field"><span>Full name *</span><input required value={form.name} onChange={set("name")} /></label>
          <label className="field"><span>Phone *</span><input required type="tel" value={form.phone} onChange={set("phone")} /></label>
        </div>
        <label className="field"><span>Email</span><input type="email" value={form.email} onChange={set("email")} /></label>
        <label className="field"><span>Delivery address *</span><textarea required rows={3} value={form.address} onChange={set("address")} /></label>
        <label className="field"><span>Note for our atelier</span><textarea rows={2} value={form.note} onChange={set("note")} placeholder="Gift message, sizing, occasion…" /></label>
        {err && <p className="error">{err}</p>}
        <button className="btn btn--gold btn--block" disabled={busy}>{busy ? "Placing order…" : `Place order · ${money(total)}`}</button>
        <p className="muted small">Payment is confirmed personally by our team after you place the order.</p>
      </form>
      <aside className="checkout__summary panel">
        <h2>Order summary</h2>
        {items.map((i) => (
          <div key={i.id} className="line line--sm">
            <ProductImage src={i.image} alt={i.name} className="line__img" />
            <div className="line__info"><span className="line__name">{i.name}</span><span className="muted">Qty {i.qty}</span></div>
            <span>{money(i.price * i.qty)}</span>
          </div>
        ))}
        <div className="drawer__total"><span>Total</span><strong>{money(total)}</strong></div>
      </aside>
    </section>
  );
}
