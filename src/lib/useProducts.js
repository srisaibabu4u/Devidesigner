import { useEffect, useState } from "react";
import { api } from "./api.js";

let cache = null;

export function useProducts() {
  const [products, setProducts] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    api.products()
      .then((p) => { cache = p; if (live) setProducts(p); })
      .catch((e) => live && setError(e.message))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, []);
  return { products, loading, error };
}
export const invalidateProducts = () => { cache = null; };
