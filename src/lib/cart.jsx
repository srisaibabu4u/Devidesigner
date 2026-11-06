import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext(null);
const KEY = "ddb_bag";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {} }, [items]);

  const value = useMemo(() => ({
    items, open, setOpen,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((t, i) => t + i.price * i.qty, 0),
    add(p, qty = 1) {
      setItems((cur) => {
        const ex = cur.find((i) => i.id === p.id);
        if (ex) return cur.map((i) => (i.id === p.id ? { ...i, qty: i.qty + qty } : i));
        return [...cur, { id: p.id, name: p.name, price: p.price, image: p.images?.[0] || "", qty }];
      });
      setOpen(true);
    },
    setQty: (id, qty) => setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i))),
    remove: (id) => setItems((cur) => cur.filter((i) => i.id !== id)),
    clear: () => setItems([]),
  }), [items, open]);

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}

export const useCart = () => useContext(CartCtx);
