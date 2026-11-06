import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Logo from "./Logo.jsx";
import { Bag, Menu, Close, User } from "./Icons.jsx";
import { useCart } from "../lib/cart.jsx";
import { isLoggedIn } from "../lib/api.js";

export default function Header() {
  const { count, setOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [nav, setNav] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const close = () => setNav(false);

  return (
    <>
      <div className="announce">Complimentary shipping on orders above ₹1,999 &nbsp;·&nbsp; Handcrafted with devotion</div>
      <header className={`header ${scrolled ? "header--solid" : ""}`}>
        <div className="container header__row">
          <button className="icon-btn header__burger" onClick={() => setNav(true)} aria-label="Open menu"><Menu /></button>
          <nav className={`nav ${nav ? "nav--open" : ""}`} onClick={close}>
            <button className="icon-btn nav__close" aria-label="Close menu"><Close /></button>
            <NavLink to="/women">Women</NavLink>
            <NavLink to="/men">Men</NavLink>
            <NavLink to="/shop">All Jewellery</NavLink>
            <NavLink to="/about">Our Story</NavLink>
          </nav>
          <Logo />
          <div className="header__actions">
            <Link to={isLoggedIn() ? "/admin" : "/login"} className="icon-btn" aria-label="Account"><User /></Link>
            <button className="icon-btn bag-btn" onClick={() => setOpen(true)} aria-label="Open bag">
              <Bag />{count > 0 && <span className="bag-count">{count}</span>}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
