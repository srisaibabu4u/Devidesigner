import { Link } from "react-router-dom";
import { useCart } from "../lib/cart.jsx";
import { money } from "../lib/format.js";
import { Close, Plus, Minus } from "./Icons.jsx";
import { ProductImage } from "./ProductCard.jsx";

export default function CartDrawer() {
  const { items, open, setOpen, total, setQty, remove } = useCart();
  return (
    <>
      <div className={`scrim ${open ? "scrim--on" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? "drawer--open" : ""}`} aria-hidden={!open}>
        <div className="drawer__head">
          <h3>Your Bag</h3>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close bag"><Close /></button>
        </div>
        {items.length === 0 ? (
          <div className="drawer__empty">
            <p>Your bag awaits its first treasure.</p>
            <Link to="/shop" className="btn btn--gold" onClick={() => setOpen(false)}>Discover the collection</Link>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {items.map((i) => (
                <li key={i.id} className="line">
                  <ProductImage src={i.image} alt={i.name} className="line__img" />
                  <div className="line__info">
                    <span className="line__name">{i.name}</span>
                    <span className="line__price">{money(i.price)}</span>
                    <div className="qty">
                      <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span>{i.qty}</span>
                      <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                    </div>
                  </div>
                  <button className="link-btn" onClick={() => remove(i.id)}>Remove</button>
                </li>
              ))}
            </ul>
            <div className="drawer__foot">
              <div className="drawer__total"><span>Subtotal</span><strong>{money(total)}</strong></div>
              <Link to="/checkout" className="btn btn--gold btn--block" onClick={() => setOpen(false)}>Proceed to checkout</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
