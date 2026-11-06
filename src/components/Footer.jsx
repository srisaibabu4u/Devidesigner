import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { Ornament } from "./Icons.jsx";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <Ornament className="footer__orn" />
        <div className="footer__grid">
          <div>
            <Logo light />
            <p className="footer__about">Heirloom-inspired fashion jewellery, beaded and finished by hand for every celebration.</p>
          </div>
          <div>
            <h4>Shop</h4>
            <Link to="/women">Women</Link><Link to="/men">Men</Link><Link to="/shop">All Jewellery</Link>
          </div>
          <div>
            <h4>House</h4>
            <Link to="/about">Our Story</Link><Link to="/checkout">Your Bag</Link><Link to="/login">Atelier Login</Link>
          </div>
          <div>
            <h4>Promise</h4>
            <p>Hand-finished pieces<br />Secure, insured shipping<br />Gift-ready packaging</p>
          </div>
        </div>
        <p className="footer__legal">© {new Date().getFullYear()} Devi Designer Beads. All rights reserved.</p>
      </div>
    </footer>
  );
}
