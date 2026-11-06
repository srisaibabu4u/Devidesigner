import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProducts } from "../lib/useProducts.js";
import ProductCard from "../components/ProductCard.jsx";
import { Ornament, Arrow } from "../components/Icons.jsx";

export default function Home() {
  const { products, loading } = useProducts();
  const featured = useMemo(() => {
    const f = products.filter((p) => p.featured);
    return [...f, ...products.filter((p) => !p.featured)].slice(0, 8);
  }, [products]);
  const imgFor = (g) => products.find((p) => p.gender === g && p.images?.[0])?.images[0];
  const categories = useMemo(() => {
    const m = new Map();
    products.forEach((p) => { if (!m.has(p.category)) m.set(p.category, p.images?.[0]); });
    return [...m.entries()].slice(0, 6);
  }, [products]);

  return (
    <>
      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__mandala" aria-hidden="true">
          <svg viewBox="0 0 400 400">
            {Array.from({ length: 24 }).map((_, i) => (
              <ellipse key={i} cx="200" cy="200" rx="190" ry="62" transform={`rotate(${i * 7.5} 200 200)`} />
            ))}
            <circle cx="200" cy="200" r="60" /><circle cx="200" cy="200" r="120" /><circle cx="200" cy="200" r="196" />
          </svg>
        </div>
        <div className="container hero__inner">
          <p className="eyebrow">Maison of Handcrafted Jewellery</p>
          <h1 className="hero__title">Adorned<br /><em>in Grace</em></h1>
          <Ornament className="hero__orn" />
          <p className="hero__lead">Beaded heirlooms, temple-inspired statements and modern classics — designed for her, crafted for him, treasured by both.</p>
          <div className="hero__ctas">
            <Link to="/women" className="btn btn--gold">Shop Women</Link>
            <Link to="/men" className="btn btn--ghost">Shop Men</Link>
          </div>
        </div>
        <div className="hero__scroll">Scroll</div>
      </section>

      <section className="split container">
        {["Women", "Men"].map((g) => (
          <Link key={g} to={`/${g.toLowerCase()}`} className={`split__panel split__panel--${g.toLowerCase()}`}>
            {imgFor(g) && <img src={imgFor(g)} alt="" loading="lazy" />}
            <div className="split__veil" />
            <div className="split__text">
              <span className="eyebrow">The {g === "Women" ? "Her" : "His"} Edit</span>
              <h2>{g === "Women" ? "For Her" : "For Him"}</h2>
              <span className="split__link">Explore <Arrow size={16} /></span>
            </div>
          </Link>
        ))}
      </section>

      {categories.length > 0 && (
        <section className="section container">
          <div className="section__head">
            <p className="eyebrow">Curated Categories</p>
            <h2 className="section__title">Shop by Treasure</h2>
          </div>
          <div className="cats">
            {categories.map(([c, img]) => (
              <Link key={c} to={`/shop?category=${encodeURIComponent(c)}`} className="cat">
                <div className="cat__ring">{img ? <img src={img} alt="" loading="lazy" /> : <span>✦</span>}</div>
                <span>{c}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="section section--ivory">
        <div className="container">
          <div className="section__head">
            <p className="eyebrow">The Signature Collection</p>
            <h2 className="section__title">Pieces of Distinction</h2>
            <Ornament />
          </div>
          {loading ? (
            <div className="grid">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" />)}</div>
          ) : featured.length ? (
            <div className="grid">{featured.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          ) : (
            <div className="empty-state">
              <h3>The collection is being curated</h3>
              <p>New treasures are arriving shortly. Please visit again soon.</p>
            </div>
          )}
          <div className="center"><Link to="/shop" className="btn btn--dark">View all jewellery</Link></div>
        </div>
      </section>

      <section className="promise">
        <div className="container promise__grid">
          {[
            ["Hand-Finished", "Every bead is set and knotted by skilled artisans."],
            ["Gift-Ready", "Presented in our signature keepsake box."],
            ["Secure Delivery", "Insured, tracked shipping to your door."],
            ["Lasting Shine", "Anti-tarnish finishing for everyday radiance."],
          ].map(([t, d]) => (
            <div key={t} className="promise__item"><span className="promise__mark">✦</span><h4>{t}</h4><p>{d}</p></div>
          ))}
        </div>
      </section>
    </>
  );
}
