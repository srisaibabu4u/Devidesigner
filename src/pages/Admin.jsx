import { useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { api, logout } from "../lib/api.js";
import { invalidateProducts } from "../lib/useProducts.js";
import { money } from "../lib/format.js";
import { Edit, Trash, Star, Upload, Plus, Search, Eye, EyeOff } from "../components/Icons.jsx";
import { ProductImage } from "../components/ProductCard.jsx";
import ProductEditor from "../components/admin/ProductEditor.jsx";
import FolderUpload from "../components/admin/FolderUpload.jsx";
import Orders from "../components/admin/Orders.jsx";

export default function Admin() {
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = () => {
    setLoading(true);
    api.products().then(setProducts).catch((e) => setErr(e.message)).finally(() => setLoading(false));
    invalidateProducts();
  };
  useEffect(() => { load(); }, []);

  const signOut = () => { logout(); nav("/atelier"); };

  return (
    <section className="admin container">
      <div className="admin__head">
        <div><p className="eyebrow">Atelier</p><h1>Collection Manager</h1></div>
        <button className="btn btn--ghost-dark" onClick={signOut}>Sign out</button>
      </div>
      <nav className="tabs">
        <NavLink end to="/admin">Pieces ({products.length})</NavLink>
        <NavLink to="/admin/upload">Upload folder</NavLink>
        <NavLink to="/admin/orders">Orders</NavLink>
      </nav>
      {err && <p className="error">{err}</p>}
      <Routes>
        <Route index element={<Catalog products={products} loading={loading} reload={load} setProducts={setProducts} />} />
        <Route path="upload" element={<FolderUpload onDone={() => { load(); nav("/admin"); }} />} />
        <Route path="orders" element={<Orders />} />
      </Routes>
    </section>
  );
}

function Catalog({ products, loading, reload, setProducts }) {
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => products.filter((p) =>
    (filter === "All" || p.gender === filter || (filter === "Hidden" && !p.visible)) &&
    (!q || `${p.name} ${p.category} ${p.sku}`.toLowerCase().includes(q.toLowerCase()))
  ), [products, q, filter]);

  const patch = async (p, data) => {
    setProducts((cur) => cur.map((x) => (x.id === p.id ? { ...x, ...data } : x)));
    try { await api.updateProduct(p.id, { ...p, ...data }); invalidateProducts(); } catch (e) { alert(e.message); reload(); }
  };
  const toggle = (id) => setSelected((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} piece(s) permanently?`)) return;
    setBusy(true);
    for (const id of selected) { try { await api.deleteProduct(id); } catch {} }
    setSelected(new Set()); setBusy(false); reload();
  };
  const remove = async (p) => {
    if (!confirm(`Delete “${p.name}” permanently?`)) return;
    await api.deleteProduct(p.id); reload();
  };

  return (
    <>
      <div className="toolbar">
        <div className="chips">
          {["All", "Women", "Men", "Unisex", "Hidden"].map((f) => (
            <button key={f} className={`chip ${filter === f ? "chip--on" : ""}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <div className="toolbar__right">
          <label className="search"><Search size={16} /><input placeholder="Search name, category, SKU" value={q} onChange={(e) => setQ(e.target.value)} /></label>
          {selected.size > 0 && <button className="btn btn--danger" disabled={busy} onClick={bulkDelete}>Delete {selected.size}</button>}
          <button className="btn btn--dark" onClick={() => setEditing({})}><Plus size={16} /> Add piece</button>
        </div>
      </div>

      {loading ? <p className="muted">Loading…</p> : !products.length ? (
        <div className="empty-state panel">
          <Upload size={36} />
          <h3>No pieces yet</h3>
          <p>Upload a folder of photos and every image becomes a product you can edit.</p>
          <NavLink to="/admin/upload" className="btn btn--gold">Upload a folder</NavLink>
        </div>
      ) : (
        <div className="atable">
          <div className="atable__row atable__row--head">
            <span /><span>Piece</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span />
          </div>
          {list.map((p) => (
            <div key={p.id} className={`atable__row ${!p.visible ? "is-hidden" : ""}`}>
              <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.name}`} />
              <button className="atable__piece" onClick={() => setEditing(p)}>
                <ProductImage src={p.images?.[0]} alt="" className="atable__img" />
                <span><strong>{p.name}</strong><small>{p.gender}{p.sku ? ` · ${p.sku}` : ""} · {p.images?.length || 0} photo(s)</small></span>
              </button>
              <span>{p.category}</span>
              <span>{money(p.price)}</span>
              <span>{p.stock}</span>
              <span className="atable__flags">
                <button className={`flag ${p.featured ? "on" : ""}`} title="Featured on home page" onClick={() => patch(p, { featured: !p.featured })}><Star size={16} /></button>
                <button className={`flag ${p.visible ? "on" : ""}`} title={p.visible ? "Visible in shop" : "Hidden from shop"} onClick={() => patch(p, { visible: !p.visible })}>{p.visible ? <Eye size={16} /> : <EyeOff size={16} />}</button>
              </span>
              <span className="atable__actions">
                <button className="icon-btn" onClick={() => setEditing(p)} aria-label="Edit"><Edit size={17} /></button>
                <button className="icon-btn" onClick={() => remove(p)} aria-label="Delete"><Trash size={17} /></button>
              </span>
            </div>
          ))}
        </div>
      )}
      {editing && <ProductEditor product={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />}
    </>
  );
}
