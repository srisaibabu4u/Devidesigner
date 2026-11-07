import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "../lib/account.jsx";
import { useProducts } from "../lib/useProducts.js";
import { api } from "../lib/api.js";
import { money } from "../lib/format.js";
import ProductCard, { ProductImage } from "../components/ProductCard.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { Ornament } from "../components/Icons.jsx";

export default function Account() {
  const { user, ready, signOut } = useAccount();
  const loc = useLocation();
  const nav = useNavigate();
  if (!ready) return <div className="container empty-state"><p>Loading…</p></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;

  return (
    <>
      <section className="page-hero page-hero--sm">
        <p className="eyebrow">My Account</p>
        <h1>Namaste, {user.name.split(" ")[0]}</h1>
        <Ornament />
      </section>
      <section className="container account">
        <nav className="tabs">
          <NavLink end to="/account">My orders</NavLink>
          <NavLink to="/account/wishlist">Wishlist ({user.wishlist.length})</NavLink>
          <NavLink to="/account/profile">Profile</NavLink>
          <button className="tabs__out" onClick={() => { signOut(); nav("/"); }}>Sign out</button>
        </nav>
        <Routes>
          <Route index element={<MyOrders />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </section>
    </>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api.myOrders().then(setOrders).catch((e) => setErr(e.message)); }, []);
  if (err) return <p className="error">{err}</p>;
  if (!orders) return <p className="muted">Loading…</p>;
  if (!orders.length) return (
    <div className="empty-state panel"><h3>No orders yet</h3><p>When you place an order while signed in, it will appear here.</p>
      <Link to="/shop" className="btn btn--dark">Discover the collection</Link></div>
  );
  return (
    <div className="orders">
      {orders.map((o) => (
        <div key={o.id} className="order panel">
          <div className="order__head">
            <div><strong>{o.id}</strong><span className="muted small"> · {new Date(o.createdAt).toLocaleDateString()}</span></div>
            <span className={`pill pill--${o.status.toLowerCase()}`}>{o.status}</span>
          </div>
          <div className="order__items">
            {o.items.map((i) => (
              <Link key={i.id} to={`/product/${i.id}`} className="line line--sm">
                <ProductImage src={i.image} alt={i.name} className="line__img" />
                <div className="line__info"><span className="line__name">{i.name}</span><span className="muted">Qty {i.qty}</span></div>
                <span>{money(i.price * i.qty)}</span>
              </Link>
            ))}
          </div>
          <div className="drawer__total"><span>Total</span><strong>{money(o.total)}</strong></div>
        </div>
      ))}
    </div>
  );
}

function Wishlist() {
  const { wishlist } = useAccount();
  const { products, loading } = useProducts();
  const list = products.filter((p) => wishlist.includes(p.id));
  if (loading) return <p className="muted">Loading…</p>;
  if (!list.length) return (
    <div className="empty-state panel"><h3>Your wishlist is empty</h3><p>Tap the ♡ on any piece to save it here.</p>
      <Link to="/shop" className="btn btn--dark">Browse jewellery</Link></div>
  );
  return <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>;
}

function Profile() {
  const { user, update } = useAccount();
  const [f, setF] = useState({ name: user.name, phone: user.phone, address: user.address });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setMsg(""); setErr("");
    try { await update(f); setMsg("Profile saved."); } catch (e2) { setErr(e2.message); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setMsg(""); setErr("");
    try { await update(pw); setPw({ currentPassword: "", newPassword: "" }); setMsg("Password updated."); } catch (e2) { setErr(e2.message); }
  };

  return (
    <div className="profile">
      <form className="panel" onSubmit={save}>
        <h2>Your details</h2>
        <label className="field"><span>Full name</span><input value={f.name} onChange={set("name")} required /></label>
        <label className="field"><span>Email</span><input value={user.email} disabled /></label>
        <label className="field"><span>Phone</span><input type="tel" value={f.phone} onChange={set("phone")} /></label>
        <label className="field"><span>Delivery address</span><textarea rows={3} value={f.address} onChange={set("address")} placeholder="Used to pre-fill checkout" /></label>
        <button className="btn btn--dark">Save details</button>
      </form>
      <form className="panel panel--dark" onSubmit={changePw}>
        <h2>Change password</h2>
        <label className="lfield"><span>Current password</span>
          <PasswordInput value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
        </label>
        <label className="lfield"><span>New password</span>
          <PasswordInput value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" minLength={8} placeholder="At least 8 characters" />
        </label>
        <button className="btn btn--gold">Update password</button>
      </form>
      {(msg || err) && <p className={err ? "error" : "success"} role="status">{err || msg}</p>}
    </div>
  );
}
