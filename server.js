const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ── ENV ──────────────────────────────────────────
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY  || "";
const RAPIDAPI_KEY   = process.env.RAPIDAPI_KEY        || "";
const APP_TOKEN      = process.env.APP_TOKEN           || "kozmik-secret-2025";
const PORT           = process.env.PORT                || 3000;

// ── AUTH MIDDLEWARE ──────────────────────────────
function auth(req, res, next) {
  if (req.headers["x-app-token"] !== APP_TOKEN) {
    return res.status(401).json({ error: "Yetkisiz" });
  }
  next();
}

// ── HEALTH CHECK ────────────────────────────────
const path = require("path");
const fs   = require("fs");

// Ana uygulama — HTML'i sun
app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.json({ status: "ok", service: "Kozmik Uyum API" });
  }
});
  const htmlPath = path.join(__dirname, "index.html");
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.json({ status: "ok", service: "Kozmik Uyum API" });
  }
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", service: "Kozmik Uyum API" }));

// ── CLAUDE API PROXY ─────────────────────────────
app.post("/api/claude", auth, async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: { message: e.message } });
  }
});

// ── DOĞUM HARİTASI — Astrologer API (RapidAPI) ──
// Natal chart: gezegen pozisyonları + yükselen + ev sistemleri + açılar
app.post("/api/natal", auth, async (req, res) => {
  const { name, year, month, day, hour, minute, lat, lon, tz } = req.body;
  if (!year || !month || !day || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: "Eksik parametre" });
  }
  try {
    const response = await fetch("https://astrologer.p.rapidapi.com/api/v5/chart-data/birth-chart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "astrologer.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY
      },
      body: JSON.stringify({
        subject: {
          name: name || "Kişi",
          year: parseInt(year),
          month: parseInt(month),
          day: parseInt(day),
          hour: parseInt(hour) || 12,
          minute: parseInt(minute) || 0,
          longitude: parseFloat(lon),
          latitude: parseFloat(lat),
          timezone: tz || "Europe/Istanbul"
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SİNASTRİ — Astrologer API ────────────────────
app.post("/api/synastry", auth, async (req, res) => {
  const { p1, p2 } = req.body;
  if (!p1 || !p2) return res.status(400).json({ error: "Eksik parametre" });
  try {
    const response = await fetch("https://astrologer.p.rapidapi.com/api/v5/chart-data/synastry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "astrologer.p.rapidapi.com",
        "X-RapidAPI-Key": RAPIDAPI_KEY
      },
      body: JSON.stringify({
        first_subject: {
          name: p1.name || "Kişi 1",
          year: parseInt(p1.year), month: parseInt(p1.month), day: parseInt(p1.day),
          hour: parseInt(p1.hour) || 12, minute: parseInt(p1.minute) || 0,
          longitude: parseFloat(p1.lon), latitude: parseFloat(p1.lat),
          timezone: p1.tz || "Europe/Istanbul"
        },
        second_subject: {
          name: p2.name || "Kişi 2",
          year: parseInt(p2.year), month: parseInt(p2.month), day: parseInt(p2.day),
          hour: parseInt(p2.hour) || 12, minute: parseInt(p2.minute) || 0,
          longitude: parseFloat(p2.lon), latitude: parseFloat(p2.lat),
          timezone: p2.tz || "Europe/Istanbul"
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── ŞEHİR → KOORDİNAT (statik Türkiye tablosu) ──
const CITY_COORDS = {
  "istanbul":  { lat: 41.0082, lon: 28.9784, tz: "Europe/Istanbul" },
  "ankara":    { lat: 39.9334, lon: 32.8597, tz: "Europe/Istanbul" },
  "izmir":     { lat: 38.4189, lon: 27.1287, tz: "Europe/Istanbul" },
  "bursa":     { lat: 40.1885, lon: 29.0610, tz: "Europe/Istanbul" },
  "adana":     { lat: 37.0000, lon: 35.3213, tz: "Europe/Istanbul" },
  "gaziantep": { lat: 37.0662, lon: 37.3833, tz: "Europe/Istanbul" },
  "konya":     { lat: 37.8713, lon: 32.4846, tz: "Europe/Istanbul" },
  "antalya":   { lat: 36.8969, lon: 30.7133, tz: "Europe/Istanbul" },
  "kayseri":   { lat: 38.7312, lon: 35.4787, tz: "Europe/Istanbul" },
  "mersin":    { lat: 36.8000, lon: 34.6333, tz: "Europe/Istanbul" },
  "eskişehir": { lat: 39.7767, lon: 30.5206, tz: "Europe/Istanbul" },
  "diyarbakır":{ lat: 37.9144, lon: 40.2306, tz: "Europe/Istanbul" },
  "samsun":    { lat: 41.2867, lon: 36.3300, tz: "Europe/Istanbul" },
  "denizli":   { lat: 37.7765, lon: 29.0864, tz: "Europe/Istanbul" },
  "şanlıurfa": { lat: 37.1674, lon: 38.7955, tz: "Europe/Istanbul" },
  "malatya":   { lat: 38.3552, lon: 38.3095, tz: "Europe/Istanbul" },
  "trabzon":   { lat: 41.0015, lon: 39.7178, tz: "Europe/Istanbul" },
  "erzurum":   { lat: 39.9055, lon: 41.2658, tz: "Europe/Istanbul" },
  "van":       { lat: 38.4891, lon: 43.4089, tz: "Europe/Istanbul" },
  "batman":    { lat: 37.8812, lon: 41.1351, tz: "Europe/Istanbul" },
  "nicosia":   { lat: 35.1856, lon: 33.3823, tz: "Asia/Nicosia" },
  "lefkoşa":   { lat: 35.1856, lon: 33.3823, tz: "Asia/Nicosia" },
  // Dünya şehirleri
  "berlin":    { lat: 52.5200, lon: 13.4050, tz: "Europe/Berlin" },
  "london":    { lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  "paris":     { lat: 48.8566, lon: 2.3522,  tz: "Europe/Paris" },
  "new york":  { lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  "dubai":     { lat: 25.2048, lon: 55.2708, tz: "Asia/Dubai" },
  "amsterdam": { lat: 52.3676, lon: 4.9041,  tz: "Europe/Amsterdam" },
};

app.post("/api/geocode", auth, async (req, res) => {
  const { city } = req.body;
  if (!city) return res.status(400).json({ error: "Şehir gerekli" });
  const key = city.toLowerCase().trim()
    .replace("ğ","g").replace("ü","u").replace("ş","s")
    .replace("ı","i").replace("ö","o").replace("ç","c");
  // Türkiye tablosuna bak
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    const nk = k.replace("ğ","g").replace("ü","u").replace("ş","s")
               .replace("ı","i").replace("ö","o").replace("ç","c");
    if (key.includes(nk) || nk.includes(key)) {
      return res.json({ found: true, ...v, city: k });
    }
  }
  // Bulunamazsa İstanbul varsayımı
  res.json({ found: false, ...CITY_COORDS["istanbul"], city: "istanbul (varsayılan)" });
});

app.listen(PORT, () => console.log(`Kozmik API :${PORT}`));
