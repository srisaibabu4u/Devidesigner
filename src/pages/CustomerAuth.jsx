import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "../lib/account.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { Ornament, User, Heart, Bag, Diamond } from "../components/Icons.jsx";

export default function CustomerAuth({ mode = "login" }) {
  const isRegister = mode === "register";
  const { user, signIn, signUp } = useAccount();
  const nav = useNavigate();
  const loc = useLocation();
  const dest = loc.state?.from || "/account";
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => { if (user) nav(dest, { replace: true }); }, [user]);
  useEffect(() => setErr(""), [mode]);

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try {
      if (isRegister) await signUp(f); else await signIn(f.email, f.password);
    } catch (e2) { setErr(e2.message); } finally { setBusy(false); }
  };

  return (
    <section className="auth">
      <div className="hero__glow" />
      <div className="auth__wrap container">
        <div className="auth__intro">
          <p className="eyebrow">The Devi Circle</p>
          <h1>{isRegister ? <>Join the <em>circle</em></> : <>Welcome <em>back</em></>}</h1>
          <Ornament className="left" />
          <ul className="auth__perks">
            <li><Heart size={18} /> Save favourites to your wishlist</li>
            <li><Bag size={18} /> Faster checkout with saved details</li>
            <li><Diamond size={18} /> Track every order in one place</li>
          </ul>
          <p className="auth__guest">Just looking? <Link to="/shop">Browse the collection</Link> — no account needed.</p>
        </div>

        <form className="login__card auth__card" onSubmit={submit}>
          <div className="auth__tabs" role="tablist">
            <Link to="/login" state={loc.state} className={!isRegister ? "on" : ""} role="tab" aria-selected={!isRegister}>Sign in</Link>
            <Link to="/register" state={loc.state} className={isRegister ? "on" : ""} role="tab" aria-selected={isRegister}>Create account</Link>
          </div>

          {isRegister && (
            <label className="lfield"><span>Full name</span>
              <div className="lfield__box"><User size={18} /><input autoComplete="name" value={f.name} onChange={set("name")} required placeholder="Your name" /></div>
            </label>
          )}
          <label className="lfield"><span>Email</span>
            <div className="lfield__box"><span className="at">@</span><input type="email" autoComplete="email" value={f.email} onChange={set("email")} required placeholder="you@example.com" /></div>
          </label>
          {isRegister && (
            <label className="lfield"><span>Phone (optional)</span>
              <div className="lfield__box"><span className="at">☏</span><input type="tel" autoComplete="tel" value={f.phone} onChange={set("phone")} placeholder="+91 …" /></div>
            </label>
          )}
          <label className="lfield"><span>Password</span>
            <PasswordInput value={f.password} onChange={set("password")} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} placeholder={isRegister ? "At least 8 characters" : "••••••••"} />
          </label>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn btn--gold btn--block" disabled={busy}>
            {busy ? "Please wait…" : isRegister ? "Create my account" : "Sign in"}
          </button>
          <p className="auth__switch">
            {isRegister ? <>Already a member? <Link to="/login" state={loc.state}>Sign in</Link></> : <>New to Devi? <Link to="/register" state={loc.state}>Create an account</Link></>}
          </p>
        </form>
      </div>
    </section>
  );
}
