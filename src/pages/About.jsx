import { Link } from "react-router-dom";
import { Ornament } from "../components/Icons.jsx";
export default function About() {
  return (
    <>
      <section className="page-hero"><p className="eyebrow">The House of Devi</p><h1>Our Story</h1><Ornament /></section>
      <section className="container prose">
        <p className="lead">Devi Designer Beads began with a simple devotion: to string together beauty that tells a story.</p>
        <p>Each piece in our collection is designed in-house and finished by hand — from delicate beaded strands and temple-inspired necklaces for her, to bold bracelets, chains and rings for him. We blend traditional craft with a modern eye, so every ornament feels as right at a wedding as it does on an ordinary Tuesday.</p>
        <p>We make jewellery to be worn, gifted and remembered.</p>
        <div className="center"><Link to="/shop" className="btn btn--dark">Explore the collection</Link></div>
      </section>
    </>
  );
}
