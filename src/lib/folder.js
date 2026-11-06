// Turns a dropped/selected folder of images into draft products.
//
// Folder conventions (all optional):
//   MyCollection/Women/Necklaces/Kundan Choker rs2499.jpg
//   MyCollection/Men/Bracelets/Onyx Bead Band ₹899-1.jpg   ← "-1", "-2" = extra photos of the same piece
//
//  • a folder named Women / Men / Unisex sets the gender
//  • the deepest other folder becomes the category
//  • a price written as "rs999", "₹999", "inr 999" or "@999" in the file name becomes the price

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif|heic)$/i;
const GENDERS = { women: "Women", womens: "Women", ladies: "Women", female: "Women", men: "Men", mens: "Men", gents: "Men", male: "Men", unisex: "Unisex" };

const titleCase = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function parseFile(file) {
  const rel = file.webkitRelativePath || file.relativePath || file.name;
  const parts = rel.split("/").filter(Boolean);
  const folders = parts.slice(0, -1);
  let base = parts[parts.length - 1].replace(/\.[^.]+$/, "");

  let gender = "Women";
  let category = "";
  folders.forEach((f, i) => {
    const g = GENDERS[f.toLowerCase().replace(/['’\s]/g, "")];
    if (g) gender = g;
    else if (i > 0 || folders.length === 1) category = f;
  });

  // photo index suffix: "name-2", "name_2", "name (2)"
  let group = base;
  const m = base.match(/^(.*?)(?:\s*\((\d{1,2})\)|[\s_-]+(\d{1,2}))$/);
  let order = 0;
  if (m && !/(rs\.?|₹|inr|@)\s*$/i.test(m[1])) { group = m[1]; order = Number(m[2] || m[3]); }

  let price = 0;
  const pm = group.match(/(?:rs\.?|₹|inr|@|price)\s*([\d,]+(?:\.\d+)?)/i);
  if (pm) { price = Number(pm[1].replace(/,/g, "")); group = group.replace(pm[0], ""); }

  const name = titleCase(group.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim()) || "Untitled Piece";
  return { name, category: category ? titleCase(category.replace(/[_-]+/g, " ")) : "Jewellery", gender, price, order, key: `${folders.join("/")}::${name.toLowerCase()}` };
}

export function draftsFromFiles(fileList) {
  const files = [...fileList].filter((f) => IMAGE_RE.test(f.name) && !f.name.startsWith("."));
  const map = new Map();
  for (const file of files) {
    const info = parseFile(file);
    if (!map.has(info.key)) map.set(info.key, { ...info, files: [] });
    const d = map.get(info.key);
    d.files.push({ file, order: info.order });
    if (!d.price && info.price) d.price = info.price;
  }
  return [...map.values()].map((d) => ({
    ...d,
    files: d.files.sort((a, b) => a.order - b.order).map((x) => x.file),
    preview: URL.createObjectURL(d.files[0].file),
  }));
}

// Resize to max 1600px and re-encode for fast pages.
export async function compressImage(file, max = 1600) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    const toBlob = (type, q) => new Promise((r) => canvas.toBlob(r, type, q));
    let blob = await toBlob("image/webp", 0.86);
    if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg", 0.88);
    return blob;
  } catch {
    return file; // unsupported in this browser (e.g. HEIC) – send original
  }
}

export async function runPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) { const i = next++; results[i] = await worker(items[i], i); }
  }));
  return results;
}
