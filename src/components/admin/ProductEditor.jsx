import { useState } from "react";
import { api } from "../../lib/api.js";
import { compressImage, runPool } from "../../lib/folder.js";
import { Close, Plus, Star, Trash } from "../Icons.jsx";

const blank = { name: "", sku: "", category: "", gender: "Women", price: 0, comparePrice: 0, material: "", description: "", images: [], stock: 1, featured: false, visible: true };

export default function ProductEditor({ product, onClose, onSaved }) {
  const isNew = !product.id;
  const [f, setF] = useState({ ...blank, ...product });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [err, setErr] = useState("");
  const set = (k, cast = (v) => v) => (e) => setF({ ...f, [k]: cast(e.target.type === "checkbox" ? e.target.checked : e.target.value) });

  const addImages = async (files) => {
    const list = [...files].filter((x) => x.type.startsWith("image/") || /\.(heic|avif)$/i.test(x.name));
    setUploading(list.length);
    try {
      const urls = await runPool(list, 3, async (file) => {
        const blob = await compressImage(file);
        const r = await api.uploadImage(blob, file.name);
        setUploading((n) => n - 1);
        return r.url;
      });
      setF((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } catch (e) { setErr(e.message); } finally { setUploading(0); }
  };
  const move = (i) => setF((cur) => { const im = [...cur.images]; const [x] = im.splice(i, 1); return { ...cur, images: [x, ...im] }; });
  const drop = (i) => setF((cur) => ({ ...cur, images: cur.images.filter((_, j) => j !== i) }));

  const save = async (e) => {
    e.preventDefault(); setBusy(true); setErr("");
    try {
      if (isNew) await api.createProducts([f]); else await api.updateProduct(f.id, f);
      onSaved();
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="scrim scrim--on" onClick={onClose} />
      <form className="modal__card" onSubmit={save}>
        <div className="modal__head">
          <h2>{isNew ? "Add a piece" : "Edit piece"}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Close /></button>
        </div>
        <div className="modal__body">
          <div className="imgs">
            {f.images.map((src, i) => (
              <div key={src} className={`imgs__item ${i === 0 ? "is-cover" : ""}`}>
                <img src={src} alt="" />
                {i === 0 ? <span className="imgs__badge">Cover</span> : (
                  <button type="button" title="Make cover" onClick={() => move(i)}><Star size={14} /></button>
                )}
                <button type="button" className="imgs__del" title="Remove" onClick={() => drop(i)}><Trash size={14} /></button>
              </div>
            ))}
            <label className="imgs__add">
              <input type="file" accept="image/*" multiple hidden onChange={(e) => addImages(e.target.files)} />
              <Plus /> <span>{uploading ? `Uploading ${uploading}…` : "Add photos"}</span>
            </label>
          </div>
          <label className="field"><span>Name *</span><input required value={f.name} onChange={set("name")} /></label>
          <div className="field-row">
            <label className="field"><span>Category</span><input value={f.category} onChange={set("category")} placeholder="Necklaces, Earrings, Bracelets…" list="cat-suggest" /></label>
            <label className="field"><span>For</span>
              <select value={f.gender} onChange={set("gender")}><option>Women</option><option>Men</option><option>Unisex</option></select>
            </label>
          </div>
          <datalist id="cat-suggest">{["Necklaces", "Earrings", "Bangles", "Bracelets", "Rings", "Chains", "Anklets", "Maang Tikka", "Brooches", "Cufflinks", "Kadas", "Sets"].map((c) => <option key={c} value={c} />)}</datalist>
          <div className="field-row field-row--3">
            <label className="field"><span>Price *</span><input type="number" min="0" step="1" required value={f.price} onChange={set("price", Number)} /></label>
            <label className="field"><span>Compare-at price</span><input type="number" min="0" step="1" value={f.comparePrice} onChange={set("comparePrice", Number)} /></label>
            <label className="field"><span>Stock</span><input type="number" min="0" step="1" value={f.stock} onChange={set("stock", Number)} /></label>
          </div>
          <div className="field-row">
            <label className="field"><span>Material / finish</span><input value={f.material} onChange={set("material")} placeholder="Gold-plated brass, kundan, pearls" /></label>
            <label className="field"><span>SKU / reference</span><input value={f.sku} onChange={set("sku")} /></label>
          </div>
          <label className="field"><span>Description</span><textarea rows={4} value={f.description} onChange={set("description")} /></label>
          <div className="checks">
            <label><input type="checkbox" checked={f.visible} onChange={set("visible")} /> Visible in shop</label>
            <label><input type="checkbox" checked={f.featured} onChange={set("featured")} /> Feature on home page</label>
          </div>
          {err && <p className="error">{err}</p>}
        </div>
        <div className="modal__foot">
          <button type="button" className="btn btn--ghost-dark" onClick={onClose}>Cancel</button>
          <button className="btn btn--gold" disabled={busy || uploading > 0}>{busy ? "Saving…" : "Save piece"}</button>
        </div>
      </form>
    </div>
  );
}
