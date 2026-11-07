import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
import Product from "./pages/Product.jsx";
import Checkout from "./pages/Checkout.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import CustomerAuth from "./pages/CustomerAuth.jsx";
import Account from "./pages/Account.jsx";
import Admin from "./pages/Admin.jsx";
import About from "./pages/About.jsx";
import { isLoggedIn } from "./lib/api.js";

function RequireAuth({ children }) {
  const loc = useLocation();
  return isLoggedIn() ? children : <Navigate to="/atelier" replace state={{ from: loc.pathname }} />;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  const bare = pathname === "/atelier";

  return (
    <>
      {!bare && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/women" element={<Shop gender="Women" />} />
          <Route path="/men" element={<Shop gender="Men" />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<CustomerAuth />} />
          <Route path="/register" element={<CustomerAuth mode="register" />} />
          <Route path="/account/*" element={<Account />} />
          <Route path="/atelier" element={<AdminLogin />} />
          <Route path="/admin/*" element={<RequireAuth><Admin /></RequireAuth>} />
          <Route path="*" element={<div className="container empty-state"><h2>Page not found</h2></div>} />
        </Routes>
      </main>
      {!bare && <Footer />}
      <CartDrawer />
    </>
  );
}
