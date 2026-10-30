/**
 * Read a catalogue PDF and turn it into product candidates.
 *
 * For every page we collect the images (with where they sit on the page) and the lines of
 * text (with their position). Each line is attached to the nearest image, so the text under
 * or beside a product photo becomes that product's name, description and, when printed,
 * its price and code. Pages with text but no usable images become one candidate per page.
 *
 * Images are re-encoded with sharp and handed to the `saveImage` callback (disk or Cloudinary).
 */
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import sharp from 'sharp';

const require = createRequire(import.meta.url);
const PDFJS_DIR = path.dirname(require.resolve('pdfjs-dist/package.json'));
/** pdfjs insists on a trailing forward slash; Node reads these paths with fs, which accepts "/" on Windows too. */
const withSep = (p) => `${p.split(path.sep).join('/')}/`;

let pdfjsPromise;
const loadPdfjs = () => (pdfjsPromise ||= import('pdfjs-dist/legacy/build/pdf.mjs'));

const MIN_IMAGE_SIDE = 48; // icons, bullets, rules
const MAX_ASPECT = 6; // banners and decorative strips
const FULL_PAGE_RATIO = 0.7; // covers and background photos
const MAX_IMAGE_PX = 1200;

const PRICE_RE = /(?:\b(?:rwf|frw|rf|usd|eur|ksh|ugx|tsh)\b|\$|€)\s*:?\s*([\d][\d.,\s]*)|([\d][\d.,]*)\s*(?:\b(?:rwf|frw|rf|usd|eur|ksh|ugx|tsh)\b|\$|€)|\b(?:price|prix|bei|igiciro)\s*[:=]?\s*([\d][\d.,\s]*)/i;
const CODE_RE = /\b(?:code|ref(?:erence)?|sku|item\s*(?:no|n°|#)?|art(?:icle)?\.?\s*(?:no|#)?)\s*[:#.]?\s*([A-Za-z0-9][A-Za-z0-9/-]{2,30})\b/i;

/* ------------------------------------------------------------------ geometry */

const applyTransform = (p, m) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

const unitSquareBBox = (m) => {
  const pts = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ].map((p) => applyTransform(p, m));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
};

/** Distance from a text line (a short horizontal segment at y) to an image rectangle. */
function lineToRectDistance(line, rect) {
  const dx = Math.max(rect.x0 - line.x1, line.x0 - rect.x1, 0);
  const dy = Math.max(rect.y0 - line.y, line.y - rect.y1, 0);
  return Math.hypot(dx, dy);
}

/* --------------------------------------------------------------------- text */

/** Group text items into lines ordered top to bottom, left to right. */
function buildLines(textContent) {
  const items = textContent.items
    .filter((it) => it.str && it.str.trim() && Array.isArray(it.transform))
    .map((it) => {
      const [a, b, c, d, x, y] = it.transform;
      const h = it.height || Math.hypot(c, d) || Math.hypot(a, b) || 10;
      const w = it.width || it.str.length * h * 0.5;
      return { str: it.str, x0: x, x1: x + w, y, h };
    })
    .sort((p, q) => q.y - p.y || p.x0 - q.x0);

  // Rows: items that share a baseline.
  const rows = [];
  for (const it of items) {
    const row = rows.length ? rows[rows.length - 1] : null;
    const tol = Math.max(2, Math.min(it.h, row?.h || it.h) * 0.6);
    if (row && Math.abs(row.y - it.y) <= tol) {
      row.parts.push(it);
    } else {
      rows.push({ y: it.y, h: it.h, parts: [it] });
    }
  }

  // Lines: a row is split where the horizontal gap is clearly wider than a word space, so
  // text in neighbouring columns (two products side by side) stays apart.
  const lines = [];
  for (const row of rows) {
    row.parts.sort((p, q) => p.x0 - q.x0);
    const h = Math.max(...row.parts.map((p) => p.h));
    const columnGap = Math.max(10, h * 1.5);
    let group = [];
    const flush = () => {
      if (!group.length) return;
      let text = '';
      let prev = null;
      for (const part of group) {
        if (prev) {
          const gap = part.x0 - prev.x1;
          if (gap > Math.max(1, h * 0.12) && !text.endsWith(' ') && !part.str.startsWith(' ')) text += ' ';
        }
        text += part.str;
        prev = part;
      }
      text = text.replace(/\s+/g, ' ').trim();
      if (text) lines.push({ text, x0: group[0].x0, x1: Math.max(...group.map((p) => p.x1)), y: row.y, h });
      group = [];
    };
    for (const part of row.parts) {
      const prev = group[group.length - 1];
      if (prev && part.x0 - prev.x1 > columnGap) flush();
      group.push(part);
    }
    flush();
  }
  return lines;
}

/* ------------------------------------------------------------------- images */

/**
 * Image objects are decoded in the background and may not be ready when the operator list
 * resolves, so wait for them (with a cap). Images shared by several pages live in commonObjs.
 */
function getImageObject(page, objId, timeoutMs = 30000) {
  const store = String(objId).startsWith('g_') ? page.commonObjs : page.objs;
  return new Promise((resolve) => {
    let done = false;
    const finish = (value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(value || null);
    };
    const timer = setTimeout(() => finish(null), timeoutMs);
    try {
      store.get(objId, finish);
    } catch {
      finish(null);
    }
  });
}

/** Walk the operator list keeping the current transform, so every image gets a bbox. */
async function collectImages(page, pdfjs) {
  const { OPS, Util } = pdfjs;
  const ops = await page.getOperatorList();
  const stack = [];
  let ctm = [1, 0, 0, 1, 0, 0];
  const found = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];
    switch (fn) {
      case OPS.save:
        stack.push(ctm);
        break;
      case OPS.restore:
        ctm = stack.pop() || ctm;
        break;
      case OPS.transform:
        ctm = Util.transform(ctm, args);
        break;
      case OPS.paintFormXObjectBegin:
        stack.push(ctm);
        if (Array.isArray(args?.[0])) ctm = Util.transform(ctm, args[0]);
        break;
      case OPS.paintFormXObjectEnd:
        ctm = stack.pop() || ctm;
        break;
      case OPS.paintImageXObject:
      case OPS.paintImageXObjectRepeat:
      case OPS.paintInlineImageXObject: {
        // eslint-disable-next-line no-await-in-loop
        const img = fn === OPS.paintInlineImageXObject ? args?.[0] : await getImageObject(page, args?.[0]);
        if (img && img.data && img.width && img.height) found.push({ img, bbox: unitSquareBBox(ctm) });
        break;
      }
      default:
        break;
    }
  }
  return found;
}

/** 1 bit per pixel rows (padded to bytes) -> 1 byte per pixel. */
function unpack1bpp(data, width, height) {
  const rowBytes = Math.ceil(width / 8);
  const out = Buffer.alloc(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const byte = data[y * rowBytes + (x >> 3)];
      out[y * width + x] = byte & (0x80 >> (x & 7)) ? 255 : 0;
    }
  }
  return out;
}

function rawPixels(img, ImageKind) {
  const { width, height, kind } = img;
  const data = img.data;
  if (kind === ImageKind.GRAYSCALE_1BPP) return { data: unpack1bpp(data, width, height), channels: 1 };
  if (kind === ImageKind.RGB_24BPP) return { data, channels: 3 };
  if (kind === ImageKind.RGBA_32BPP) return { data, channels: 4 };
  const per = data.length / (width * height);
  if (per === 4 || per === 3 || per === 1) return { data, channels: per };
  return null;
}

const hasTransparency = (data, channels) => {
  if (channels !== 4) return false;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
};

/** Encode a decoded PDF image to JPG (or PNG when it has transparency). Returns { buffer, ext }. */
async function encodeImage(img, pixels) {
  const buf = Buffer.from(pixels.data.buffer, pixels.data.byteOffset, pixels.data.byteLength);
  let pipeline = sharp(buf, { raw: { width: img.width, height: img.height, channels: pixels.channels } }).resize({
    width: MAX_IMAGE_PX,
    height: MAX_IMAGE_PX,
    fit: 'inside',
    withoutEnlargement: true,
  });
  if (hasTransparency(pixels.data, pixels.channels)) {
    return { buffer: await pipeline.png({ compressionLevel: 8 }).toBuffer(), ext: '.png' };
  }
  return { buffer: await pipeline.flatten({ background: '#ffffff' }).jpeg({ quality: 85, mozjpeg: true }).toBuffer(), ext: '.jpg' };
}

/* ----------------------------------------------------------------- parsing */

function parsePrice(text) {
  const m = text.match(PRICE_RE);
  if (!m) return null;
  const raw = (m[1] || m[2] || m[3] || '').replace(/\s/g, '');
  if (!raw) return null;
  // "12,500" and "12.500" are both thousands in print; "12.50" is a decimal.
  let n;
  if (/[.,]\d{1,2}$/.test(raw) && !/[.,]\d{3}$/.test(raw)) n = Number(raw.replace(/,/g, '.').replace(/\.(?=.*\.)/g, ''));
  else n = Number(raw.replace(/[.,]/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

const looksLikeTitle = (text) => /[A-Za-zÀ-ɏ]{2,}/.test(text) && text.length <= 120 && !PRICE_RE.test(text);

const truncate = (s, max) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(' ');
  return `${at > max * 0.5 ? cut.slice(0, at) : cut}…`;
};

/** Names are usually printed bigger than the body text; find the first such line, if any. */
function pickTitleIndex(ordered) {
  const titleLike = ordered.map((l) => looksLikeTitle(l.text));
  const heights = ordered.filter((_, i) => titleLike[i]).map((l) => l.h).sort((a, b) => a - b);
  if (heights.length >= 2) {
    const median = heights[Math.floor(heights.length / 2)];
    const big = ordered.findIndex((l, i) => titleLike[i] && l.h >= median * 1.15);
    if (big >= 0 && big <= 3) return big;
  }
  return ordered.findIndex((_, i) => titleLike[i]);
}

/** Build one candidate from the ordered lines that belong to an image (or a page). */
function linesToCandidate(lines, page, images) {
  const ordered = [...lines].sort((a, b) => b.y - a.y || a.x0 - b.x0);
  let name = '';
  let price = null;
  let sku = '';
  const rest = [];
  const titleIndex = pickTitleIndex(ordered);
  for (const [index, line] of ordered.entries()) {
    const text = line.text;
    if (price == null) {
      const p = parsePrice(text);
      if (p != null) {
        price = p;
        const leftover = text.replace(PRICE_RE, '').replace(/\b(?:rwf|frw|rf|usd|eur|price|prix|bei|igiciro)\b/gi, '').replace(/[\s:.,=-]/g, '');
        if (leftover.length < 3) continue; // the line was only a price
      }
    }
    if (!sku) {
      const c = text.match(CODE_RE);
      if (c) {
        sku = c[1].toUpperCase();
        if (text.replace(CODE_RE, '').trim().length < 3) continue;
      }
    }
    if (!name && index === titleIndex) {
      name = text;
      continue;
    }
    rest.push(line);
  }

  // Keep paragraph breaks where the vertical gap is clearly more than a line.
  let description = '';
  let prev = null;
  for (const line of rest) {
    if (prev) description += prev.y - line.y > Math.max(prev.h, line.h) * 1.8 ? '\n\n' : ' ';
    description += line.text;
    prev = line;
  }
  description = description.replace(/[ \t]+/g, ' ').trim();
  const flat = description.replace(/\s+/g, ' ');
  const shortDescription = flat ? truncate(flat, 160) : '';

  return {
    page,
    name: truncate(name, 120).replace(/…$/, ''),
    sku,
    price,
    shortDescription,
    description,
    images,
    sourceText: ordered.map((l) => l.text).join('\n'),
  };
}

/**
 * parseCatalogPdf(buffer, { saveImage }) -> { pages, items, warnings }
 * `saveImage({ buffer, filename })` must store the picture and resolve to its public URL.
 */
export async function parseCatalogPdf(buffer, { saveImage, maxPages = 200 }) {
  const pdfjs = await loadPdfjs();
  const { ImageKind } = pdfjs;

  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
    isOffscreenCanvasSupported: false,
    isImageDecoderSupported: false,
    standardFontDataUrl: withSep(path.join(PDFJS_DIR, 'standard_fonts')),
    cMapUrl: withSep(path.join(PDFJS_DIR, 'cmaps')),
    cMapPacked: true,
    wasmUrl: withSep(path.join(PDFJS_DIR, 'wasm')),
    verbosity: 0,
  });
  const doc = await task.promise;

  const warnings = [];
  const pageCount = Math.min(doc.numPages, maxPages);
  if (doc.numPages > maxPages) warnings.push(`Only the first ${maxPages} of ${doc.numPages} pages were read.`);

  const pages = []; // { number, images: [{ filename, buffer, bbox, hash }], lines }
  const hashPages = new Map(); // image hash -> Set of page numbers
  let imageSeq = 0;

  try {
    for (let n = 1; n <= pageCount; n++) {
      const page = await doc.getPage(n);
      const [vx0, vy0, vx1, vy1] = page.view;
      const pageArea = Math.abs((vx1 - vx0) * (vy1 - vy0)) || 1;
      const images = [];
      let lines = [];
      try {
        const found = await collectImages(page, pdfjs);
        for (const { img, bbox } of found) {
          if (img.width < MIN_IMAGE_SIDE || img.height < MIN_IMAGE_SIDE) continue;
          const aspect = Math.max(img.width / img.height, img.height / img.width);
          if (aspect > MAX_ASPECT) continue;
          const area = Math.abs((bbox.x1 - bbox.x0) * (bbox.y1 - bbox.y0));
          if (area / pageArea > FULL_PAGE_RATIO) continue;
          const pixels = rawPixels(img, ImageKind);
          if (!pixels) continue;
          const hash = crypto.createHash('sha1').update(pixels.data).digest('hex');
          if (!hashPages.has(hash)) hashPages.set(hash, new Set());
          hashPages.get(hash).add(n);
          let encoded;
          try {
            encoded = await encodeImage(img, pixels);
          } catch (err) {
            warnings.push(`Page ${n}: an image could not be converted (${err.message}).`);
            continue;
          }
          images.push({ filename: `p${n}-${++imageSeq}${encoded.ext}`, buffer: encoded.buffer, bbox, hash, area });
        }
        lines = buildLines(await page.getTextContent());
      } catch (err) {
        warnings.push(`Page ${n} could not be read (${err.message}).`);
      } finally {
        page.cleanup();
      }
      pages.push({ number: n, images, lines, top: Math.max(vy0, vy1), bottom: Math.min(vy0, vy1), height: Math.abs(vy1 - vy0) || 800 });
    }
  } finally {
    await task.destroy().catch(() => {});
  }

  // Running headers and footers ("Catalogue 2026 - page 3") sit in the top or bottom tenth of
  // the page and repeat on other pages; they are not product text.
  const edgeCounts = new Map();
  const normalise = (t) => t.replace(/\d+/g, '#').toLowerCase();
  const isEdge = (page, line) => line.y > page.top - page.height * 0.1 || line.y < page.bottom + page.height * 0.1;
  for (const page of pages) {
    const seen = new Set();
    for (const line of page.lines) {
      if (!isEdge(page, line)) continue;
      const key = normalise(line.text);
      if (seen.has(key)) continue;
      seen.add(key);
      edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
    }
  }
  if (pageCount >= 2) {
    for (const page of pages) {
      page.lines = page.lines.filter((line) => !(isEdge(page, line) && (edgeCounts.get(normalise(line.text)) || 0) >= 2));
    }
  }

  // Logos and ornaments repeat across pages; real product photos do not.
  const decoration = new Set();
  for (const [hash, set] of hashPages) {
    if (set.size >= 3 || (pageCount >= 2 && set.size === pageCount)) decoration.add(hash);
  }

  const items = [];
  for (const page of pages) {
    const images = page.images.filter((i) => !decoration.has(i.hash));
    if (!images.length) {
      if (page.lines.length) {
        const c = linesToCandidate(page.lines, page.number, []);
        if (c.name) items.push(c);
      }
      continue;
    }
    const buckets = images.map(() => []);
    const maxDistance = page.height * 0.45;
    for (const line of page.lines) {
      let best = -1;
      let bestScore = Infinity;
      images.forEach((img, idx) => {
        let score = lineToRectDistance(line, img.bbox);
        if (line.y > img.bbox.y1) score *= 1.3; // text above a photo is less likely to describe it
        if (score < bestScore) {
          bestScore = score;
          best = idx;
        }
      });
      if (best >= 0 && bestScore <= maxDistance) buckets[best].push(line);
    }
    for (const [idx, img] of images.entries()) {
      let url;
      try {
        // eslint-disable-next-line no-await-in-loop
        url = await saveImage({ buffer: img.buffer, filename: img.filename });
      } catch (err) {
        warnings.push(`Page ${page.number}: a picture could not be stored (${err.message}).`);
        continue;
      }
      items.push(linesToCandidate(buckets[idx], page.number, [url]));
    }
  }
  // Decoration images were never stored, so nothing to clean up; drop the buffers now.
  for (const page of pages) page.images.length = 0;

  // Give every candidate a working name so the admin can find it in the list.
  let unnamed = 0;
  for (const it of items) {
    if (!it.name) {
      unnamed++;
      it.name = `Untitled product (page ${it.page})`;
    }
  }
  if (unnamed) warnings.push(`${unnamed} picture${unnamed === 1 ? ' had' : 's had'} no text nearby; name them before importing.`);

  return { pages: pageCount, items, warnings };
}

export default parseCatalogPdf;
