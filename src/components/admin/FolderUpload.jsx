import { useRef, useState } from "react";
import { api } from "../../lib/api.js";
import { compressImage, draftsFromFiles, runPool } from "../../lib/folder.js";
import { Folder, Trash, Upload } from "../Icons.jsx";

// Recursively read a dropped folder (Chrome, Edge, Safari, Firefox)
async function filesFromDrop(items) {
  const out = [];
  const walk = (entry, path) => new Promise((resolve) => {
    if (entry.isFile) {
      entry.file((file) => { file.relativePath = path + file.name; out.push(file); resolve(); }, resolve);
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const all = [];
      const read = () => reader.readEntries(async (batch) => {
        if (!batch.length) { for (const e of all) await walk(e, `${path}${entry.name}/`); resolve(); }
        else { all.push(...batch); read(); }
      }, resolve);
      read();
    } else resolve();
  });
  await Promise.all([...items].map((it) => it.webkitGetAsEntry?.()).filter(Boolean).map((e) => walk(e, "")));
  return out;
}

export default function FolderUpload({ onDone }) {
  const [drafts, setDrafts] = useState([]);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(null);
  const [err, setErr] = useState("");
  const [bulk, setBulk] = useState({ category: "", gender: "", price: "", stock: "1" });
  const input = useRef();

  const accept = (files) => { setErr(""); const d = draftsFromFiles(files); if (!d.length) setErr("No images found in that folder."); setDrafts(d); };
  const upd = (i, k, v) => setDrafts((cur) => cur.map((d, j) => (j === i ? { ...d, [k]: v } : d)));
  const applyAll = () => setDrafts((cur) => cur.map((d) => ({
    ...d,
    ...(bulk.category && { category: bulk.category }),
    ...(bulk.gender && { gender: bulk.gender }),
    ...(bulk.price !== "" && { price: Number(bulk.price) }),
  })));

  const publish = async () => {
    setErr("");
    const totalFiles = drafts.reduce((n, d) => n + d.files.length, 0);
    let doneFiles = 0;
    setProgress({ done: 0, total: totalFiles });
    try {
      const products = await runPool(drafts, 3, async (d) => {
        const images = [];
        for (const file of d.files) {
          const blob = await compressImage(file);
          const r = await api.uploadImage(blob, file.name);
          images.push(r.url);
          setProgress({ done: ++doneFiles, total: totalFiles });
        }
        return { name: d.name, category: d.category, gender: d.gender, price: Number(d.price) || 0, stock: Number(bulk.stock) || 0, images, visible: true };
      });
      for (let i = 0; i < products.length; i += 100) await api.createProducts(products.slice(i, i + 100));
      drafts.forEach((d) => URL.revokeObjectURL(d.preview));
      setDrafts([]); setProgress(null); onDone();
    } catch (e) { setErr(`Upload stopped: ${e.message}`); setProgress(null); }
  };

  if (!drafts.length) return (
    <div
      className={`dropzone ${drag ? "dropzone--on" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={async (e) => { e.preventDefault(); setDrag(false); accept(await filesFromDrop(e.dataTransfer.items)); }}
    >
      <Folder size={46} sw={1} />
      <h3>Drop your jewellery folder here</h3>
      <p>Every photo becomes a piece in your shop. You can review and edit everything before publishing.</p>
      <input ref={input} type="file" hidden multiple webkitdirectory="" directory="" onChange={(e) => accept(e.target.files)} />
      <button className="btn btn--gold" onClick={() => input.current.click()}><Upload size={16} /> Choose folder</button>
      {err && <p className="error">{err}</p>}
      <div className="tips">
        <h4>Make it automatic (optional)</h4>
        <ul>
          <li>Sub-folders named <b>Women</b>, <b>Men</b> or <b>Unisex</b> set who the piece is for.</li>
          <li>Other sub-folder names become the <b>category</b> — e.g. <code>Women/Necklaces/</code>.</li>
          <li>Add the price to a file name: <code>Kundan Choker rs2499.jpg</code>.</li>
          <li>Several photos of one piece: <code>Ruby Ring-1.jpg</code>, <code>Ruby Ring-2.jpg</code>.</li>
        </ul>
      </div>
    </div>
  );

  const photoCount = drafts.reduce((n, d) => n + d.files.length, 0);
  return (
    <div className="review">
      <div className="review__bar panel">
        <div><strong>{drafts.length} pieces</strong> <span className="muted">from {photoCount} photos</span></div>
        <div className="review__bulk">
          <input placeholder="Category for all" value={bulk.category} onChange={(e) => setBulk({ ...bulk, category: e.target.value })} />
          <select value={bulk.gender} onChange={(e) => setBulk({ ...bulk, gender: e.target.value })}>
            <option value="">For…</option><option>Women</option><option>Men</option><option>Unisex</option>
          </select>
          <input type="number" min="0" placeholder="Price for all" value={bulk.price} onChange={(e) => setBulk({ ...bulk, price: e.target.value })} />
          <button className="btn btn--ghost-dark" onClick={applyAll}>Apply to all</button>
          <label className="muted small">Stock each <input type="number" min="0" className="tiny" value={bulk.stock} onChange={(e) => setBulk({ ...bulk, stock: e.target.value })} /></label>
        </div>
      </div>
      <div className="review__grid">
        {drafts.map((d, i) => (
          <div key={d.key} className="rcard">
            <div className="rcard__img"><img src={d.preview} alt="" />{d.files.length > 1 && <span className="tag">{d.files.length} photos</span>}</div>
            <input className="rcard__name" value={d.name} onChange={(e) => upd(i, "name", e.target.value)} aria-label="Name" />
            <div className="rcard__row">
              <input value={d.category} onChange={(e) => upd(i, "category", e.target.value)} aria-label="Category" />
              <select value={d.gender} onChange={(e) => upd(i, "gender", e.target.value)} aria-label="For"><option>Women</option><option>Men</option><option>Unisex</option></select>
            </div>
            <div className="rcard__row">
              <input type="number" min="0" value={d.price} onChange={(e) => upd(i, "price", e.target.value)} aria-label="Price" />
              <button className="icon-btn" onClick={() => setDrafts(drafts.filter((_, j) => j !== i))} aria-label="Skip this piece"><Trash size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      {err && <p className="error">{err}</p>}
      <div className="review__foot panel">
        {progress ? (
          <div className="progress"><div className="progress__bar" style={{ width: `${(progress.done / progress.total) * 100}%` }} /><span>Uploading {progress.done} / {progress.total} photos…</span></div>
        ) : (
          <>
            <button className="btn btn--ghost-dark" onClick={() => setDrafts([])}>Start over</button>
            <button className="btn btn--gold" onClick={publish}>Publish {drafts.length} pieces</button>
          </>
        )}
      </div>
    </div>
  );
}
