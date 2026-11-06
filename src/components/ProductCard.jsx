import { Link } from "react-router-dom";
import { money } from "../lib/format.js";
import { Diamond } from "./Icons.jsx";

export function ProductImage({ src, alt, className = "" }) {
  return src ? (
    <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />
  ) : (
    <div className={`img-placeholder ${className}`}><Diamond size={42} sw={0.8} /></div>
  );
}

export default function ProductCard({ p }) {
  const sale = p.comparePrice > p.price;
  return (
    <Link to={`/product/${p.id}`} className="card">
      <div className="card__media">
        <ProductImage src={p.images?.[0]} alt={p.name} className="card__img" />
        {p.images?.[1] && <img className="card__img card__img--alt" src={p.images[1]} alt="" loading="lazy" />}
        {sale && <span className="tag">Special</span>}
        {p.stock === 0 && <span className="tag tag--muted">Sold out</span>}
        <span className="card__cta">View piece</span>
      </div>
      <div className="card__body">
        <span className="card__cat">{p.category}</span>
        <h3 className="card__name">{p.name}</h3>
        <span className="card__price">
          {money(p.price)} {sale && <s>{money(p.comparePrice)}</s>}
        </span>
      </div>
    </Link>
  );
}
