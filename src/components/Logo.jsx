import { Link } from "react-router-dom";
export default function Logo({ light = false }) {
  return (
    <Link to="/" className={`logo ${light ? "logo--light" : ""}`} aria-label="Devi Designer Beads home">
      <span className="logo__mark">✦</span>
      <span className="logo__text">
        <span className="logo__name">DEVI</span>
        <span className="logo__sub">Designer Beads</span>
      </span>
    </Link>
  );
}
