import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../lib/useProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import { Search, Ornament } from "../components/Icons.jsx";

export default function Shop({ gender }) {
  const { products, loading, error } = useProducts();
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");

  const pool = useMemo(
    () => products.filter((p) => !gender || p.gender === gender || p.gender === "Unisex"),
    [products, gender]
  );
  const cats = useMemo(() => ["All", ...new Set(pool.map((p) => p.category))], [pool]);
  const list = useMemo(() => {
    let l = pool.filter((p) => category === "All" || p.category === category);
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((p) => [p.name, p.category, p.material, p.description].join(" ").toLowerCase().includes(s));
    }
    if (sort === "low") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "high") l = [...l].sort((a, b) => b.price - a.price);
    return l;
  }, [pool, category, q, sort]);

  const title = gender === "Women" ? "For Her" : gender === "Men" ? "For Him" : "All Jewellery";

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">{gender ? `${gender}'s Collection` : "The Complete Collection"}</p>
        <h1>{title}</h1>
        <Ornament />
      </section>
      <section className="container shop">
        <div className="toolbar">
          <div className="chips">
            {cats.map((c) => (
              <button key={c} className={`chip ${c === category ? "chip--on" : ""}`}
                onClick={() => setParams(c === "All" ? {} : { category: c })}>{c}</button>
            ))}
          </div>
          <div className="toolbar__right">
            <label className="search"><Search size={16} /><input placeholder="Search pieces" value={q} onChange={(e) => setQ(e.target.value)} /></label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="new">Newest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        {loading ? (
          <div className="grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="card skeleton" />)}</div>
        ) : list.length ? (
          <>
            <p className="muted count">{list.length} {list.length === 1 ? "piece" : "pieces"}</p>
            <div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          </>
        ) : (
          <div className="empty-state"><h3>No pieces found</h3><p>Try another category or search.</p></div>
        )}
      </section>
    </>
  );
}
