import { useState } from "react";
import { Eye, EyeOff, Lock } from "./Icons.jsx";

export default function PasswordInput({ value, onChange, autoComplete = "current-password", placeholder = "••••••••", minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="lfield__box">
      <Lock size={18} />
      <input type={show ? "text" : "password"} autoComplete={autoComplete} value={value} onChange={onChange}
        placeholder={placeholder} required minLength={minLength} />
      <button type="button" className="eye" onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
        {show ? <EyeOff size={19} /> : <Eye size={19} />}
      </button>
    </div>
  );
}
