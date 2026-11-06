export const CURRENCY = import.meta.env.VITE_CURRENCY || "INR";
export const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER || "";

const fmt = new Intl.NumberFormat(CURRENCY === "INR" ? "en-IN" : "en", {
  style: "currency", currency: CURRENCY, maximumFractionDigits: 0,
});
export const money = (n) => fmt.format(Number(n) || 0);
