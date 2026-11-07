# ✦ Devi Designer Beads

An elegant e-commerce boutique for fashion jewellery for women and men, built with React + Vite, running on **Netlify** (Functions + Blobs storage). No separate database or server is needed.

## Features
- **A grand storefront**: black-and-gold design, *For Her* and *For Him* collections, category rings, product pages with photo galleries, a slide-out bag and a checkout.
- **Upload a folder**: in the admin, choose (or drag in) a folder of photos and every photo becomes a product. Images are resized in the browser and stored in Netlify Blobs.
- **Edit each item**: name, category, Women/Men/Unisex, price, compare-at price, stock, material, SKU and description. You can add, remove or reorder photos, show or hide a piece, and feature it on the home page. Bulk delete is supported.
- **Orders**: checkout orders show up in the admin with status tracking (New → Confirmed → Shipped → Delivered).
- **Open browsing**: anyone can browse, search and buy without an account (guest checkout).
- **Customer accounts** (`/login`, `/register`): sign up or sign in with email + password (with a show/hide 👁 toggle). Members get:
  - **My Orders**: order history with live status
  - **Wishlist**: tap ♡ on any piece; guest favourites carry over when you sign in
  - **Profile**: saved phone and address that pre-fill checkout, plus password change
  - Passwords are hashed with scrypt; sessions last 30 days.
- **Admin login** (`/atelier`): a separate username + password with the 👁 toggle. Sessions last 12 hours, the password is never stored in the code, and customer logins can never access admin features.

## Folder upload conventions (all optional — you can edit everything before publishing)
```
Devi Collection/
  Women/Necklaces/Temple Kundan Choker rs3499.jpg
  Women/Earrings/Kundan Jhumka rs1299-1.jpg   ← -1, -2 … = more photos of the same piece
  Women/Earrings/Kundan Jhumka rs1299-2.jpg
  Men/Bracelets/Onyx Bead Bracelet rs899.jpg
```
- A folder named `Women`, `Men` or `Unisex` sets who the piece is for.
- Other folder names become the **category**.
- `rs999`, `₹999`, `inr 999` or `@999` in a file name sets the **price**.

## Deploy on Netlify (CI/CD)
1. In Netlify, choose **Add new site → Import from Git** and pick this GitHub repo. `netlify.toml` already contains the build settings.
2. Under **Site configuration → Environment variables**, add:
   | Variable | Value |
   |---|---|
   | `ADMIN_USERNAME` | e.g. `admin` |
   | `ADMIN_PASSWORD` | a strong password |
   | `AUTH_SECRET` | a long random string |
   | `VITE_WHATSAPP_NUMBER` *(optional)* | e.g. `919876543210` (adds an "Enquire on WhatsApp" button) |
   | `VITE_CURRENCY` *(optional)* | defaults to `INR` |
3. Deploy. Each push to `main` then deploys to production automatically, and each pull request gets a Deploy Preview. GitHub Actions (`.github/workflows/ci.yml`) also checks that every push builds.
4. Go to `/atelier` on your site, sign in as admin, then open **Upload folder**. Customers sign up at `/register`.

## Local development
```bash
npm install
npm i -g netlify-cli
cp .env.example .env   # set ADMIN_PASSWORD etc.
netlify dev            # http://localhost:8888 (UI + functions + blobs)
```
