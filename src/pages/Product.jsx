import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api.js";
import { money, WHATSAPP } from "../lib/format.js";
import { useCart } from "../lib/cart.jsx";
import { useProducts } from "../lib/useProducts.js";
import ProductCard, { ProductImage } from "../components/ProductCard.jsx";
import { Ornament, Plus, Minus } from "../components/Icons.jsx";

export default function Product() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const { products } = useProducts();

  useEffect(() => {
    setP(null); setActive(0); setQty(1);
    api.product(id).then(setP).catch((e) => setErr(e.message));
  }, [id]);

  if (err) return <div className="container empty-state"><h2>Piece not found</h2><Link to="/shop" className="btn btn--dark">Back to collection</Link></div>;
  if (!p) return <div className="container pdp"><div className="pdp__gallery skeleton" /><div /></div>;

  const related = products.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const sale = p.comparePrice > p.price;
  const wa = WHATSAPP && `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello Devi Designer Beads, I'm interested in "${p.name}" (${money(p.price)}) — ${location.href}`)}`;

  return (
    <>
      <div className="container crumbs"><Link to="/">Home</Link> / <Link to={`/${p.gender === "Men" ? "men" : "women"}`}>{p.gender}</Link> / <span>{p.name}</span></div>
      <section className="container pdp">
        <div className="pdp__gallery">
          <div className="pdp__main"><ProductImage src={p.images?.[active]} alt={p.name} /></div>
          {p.images?.length > 1 && (
            <div className="pdp__thumbs">
              {p.images.map((src, i) => (
                <button key={src} className={i === active ? "on" : ""} onClick={() => setActive(i)}><img src={src} alt="" /></button>
              ))}
            </div>
          )}
        </div>
        <div className="pdp__info">
          <p className="eyebrow">{p.category} · {p.gender}</p>
          <h1>{p.name}</h1>
          <div className="pdp__price">{money(p.price)} {sale && <s>{money(p.comparePrice)}</s>}</div>
          <Ornament className="left" />
          {p.description && <p className="pdp__desc">{p.description}</p>}
          <dl className="pdp__specs">
            {p.material && (<><dt>Material</dt><dd>{p.material}</dd></>)}
            {p.sku && (<><dt>Reference</dt><dd>{p.sku}</dd></>)}
            <dt>Availability</dt><dd>{p.stock > 0 ? (p.stock < 5 ? `Only ${p.stock} left` : "In stock") : "Sold out"}</dd>
          </dl>
          {p.stock > 0 && (
            <div className="pdp__buy">
              <div className="qty qty--lg">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease"><Minus size={14} /></button>
                <span>{qty}</span>
                <button onClick={() => setQty(Math.min(p.stock, qty + 1))} aria-label="Increase"><Plus size={14} /></button>
              </div>
              <button className="btn btn--gold btn--grow" onClick={() => add(p, qty)}>Add to bag</button>
            </div>
          )}
          {wa && <a className="btn btn--ghost-dark btn--block" href={wa} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>}
          <ul className="pdp__notes"><li>Hand-finished by our artisans</li><li>Gift-ready keepsake packaging</li><li>Secure, tracked delivery</li></ul>
        </div>
      </section>
      {related.length > 0 && (
        <section className="section container">
          <div className="section__head"><p className="eyebrow">You may also adore</p><h2 className="section__title">From the same collection</h2></div>
          <div className="grid">{related.map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </>
  );
}
