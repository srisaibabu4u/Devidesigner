import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import Logo from "../components/Logo.jsx";
import { Eye, EyeOff, Lock, User, Ornament } from "../components/Icons.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await api.login(username, password); nav(loc.state?.from || "/admin", { replace: true }); }
    catch (e2) { setErr(e2.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="login">
      <div className="login__art" aria-hidden="true">
        <div className="hero__glow" />
        <div className="login__quote">
          <p className="eyebrow">The Atelier</p>
          <h2>Where every<br /><em>treasure</em> begins</h2>
          <Ornament />
        </div>
      </div>
      <div className="login__panel">
        <form className="login__card" onSubmit={submit}>
          <Logo light />
          <h1>Atelier Sign In</h1>
          <p className="muted">Manage your collection, pieces and orders.</p>
          <label className="lfield">
            <span>Username</span>
            <div className="lfield__box"><User size={18} /><input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required /></div>
          </label>
          <label className="lfield">
            <span>Password</span>
            <div className="lfield__box">
              <Lock size={18} />
              <input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
                {show ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>
          {err && <p className="error" role="alert">{err}</p>}
          <button className="btn btn--gold btn--block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          <Link to="/" className="login__back">← Return to boutique</Link>
        </form>
      </div>
    </div>
  );
}
