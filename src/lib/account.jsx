import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getCustomerToken, setCustomerToken, clearCustomerToken } from "./api.js";

const Ctx = createContext(null);
const GUEST_WISH = "ddb_wishlist";
const readGuest = () => { try { return JSON.parse(localStorage.getItem(GUEST_WISH)) || []; } catch { return []; } };

export function AccountProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!getCustomerToken());
  const [guestWish, setGuestWish] = useState(readGuest);

  useEffect(() => {
    if (!getCustomerToken()) return;
    api.me().then(setUser).catch(() => clearCustomerToken()).finally(() => setReady(true));
  }, []);
  useEffect(() => { try { localStorage.setItem(GUEST_WISH, JSON.stringify(guestWish)); } catch {} }, [guestWish]);

  const finish = ({ token, user: u }) => {
    setCustomerToken(token); setUser(u);
    setGuestWish([]);
    return u;
  };

  const wishlist = user ? user.wishlist : guestWish;

  const toggleWish = useCallback(async (id) => {
    if (!user) { setGuestWish((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id])); return; }
    const next = user.wishlist.includes(id) ? user.wishlist.filter((x) => x !== id) : [...user.wishlist, id];
    setUser({ ...user, wishlist: next });
    try { await api.updateMe({ wishlist: next }); } catch {}
  }, [user]);

  const value = useMemo(() => ({
    user, ready, wishlist,
    isWished: (id) => wishlist.includes(id),
    toggleWish,
    signIn: async (email, password) => finish(await api.customerLogin({ email, password, wishlist: guestWish })),
    signUp: async (data) => finish(await api.register({ ...data, wishlist: guestWish })),
    signOut: () => { clearCustomerToken(); setUser(null); },
    update: async (data) => { const u = await api.updateMe(data); setUser(u); return u; },
  }), [user, ready, wishlist, toggleWish, guestWish]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAccount = () => useContext(Ctx);
