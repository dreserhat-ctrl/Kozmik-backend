const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || "";
const RAPIDAPI_KEY  = process.env.RAPIDAPI_KEY || "";
const APP_TOKEN     = process.env.APP_TOKEN || "kozmik-secret-2025";
const PORT          = process.env.PORT || 3000;

function auth(req, res, next) {
  if (req.headers["x-app-token"] !== APP_TOKEN) {
    return res.status(401).json({ error: "Yetkisiz" });
  }
  next();
}

app.get("/", (req, res) => {
  const htmlPath = path.join(__dirname, "index.html");
  if (fs.existsSync(htmlPath)) {
    res.sendFile(htmlPath);
  } else {
    res.json({ status: "ok", service: "Kozmik Uyum API" });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/claude", auth, async (req, res) => {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify(req.body)
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: { message: e.message } }); }
});

app.post("/api/natal", auth, async (req, res) => {
  try {
    const { name, year, month, day, hour, minute, lat, lon, tz } = req.body;
    const r = await fetch("https://astrologer.p.rapidapi.com/api/v5/chart-data/birth-chart", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-RapidAPI-Host": "astrologer.p.rapidapi.com", "X-RapidAPI-Key": RAPIDAPI_KEY },
      body: JSON.stringify({ subject: { name: name||"Kisi", year: parseInt(year), month: parseInt(month), day: parseInt(day), hour: parseInt(hour)||12, minute: parseInt(minute)||0, longitude: parseFloat(lon), latitude: parseFloat(lat), timezone: tz||"Europe/Istanbul" } })
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post("/api/synastry", auth, async (req, res) => {
  try {
    const { p1, p2 } = req.body;
    const r = await fetch("https://astrologer.p.rapidapi.com/api/v5/chart-data/synastry", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-RapidAPI-Host": "astrologer.p.rapidapi.com", "X-RapidAPI-Key": RAPIDAPI_KEY },
      body: JSON.stringify({
        first_subject:  { name: p1.name||"K1", year: parseInt(p1.year), month: parseInt(p1.month), day: parseInt(p1.day), hour: parseInt(p1.hour)||12, minute: parseInt(p1.minute)||0, longitude: parseFloat(p1.lon), latitude: parseFloat(p1.lat), timezone: p1.tz||"Europe/Istanbul" },
        second_subject: { name: p2.name||"K2", year: parseInt(p2.year), month: parseInt(p2.month), day: parseInt(p2.day), hour: parseInt(p2.hour)||12, minute: parseInt(p2.minute)||0, longitude: parseFloat(p2.lon), latitude: parseFloat(p2.lat), timezone: p2.tz||"Europe/Istanbul" }
      })
    });
    res.json(await r.json());
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const CITIES = {
  "istanbul":{"lat":41.0082,"lon":28.9784,"tz":"Europe/Istanbul"},
  "ankara":{"lat":39.9334,"lon":32.8597,"tz":"Europe/Istanbul"},
  "izmir":{"lat":38.4189,"lon":27.1287,"tz":"Europe/Istanbul"},
  "bursa":{"lat":40.1885,"lon":29.0610,"tz":"Europe/Istanbul"},
  "antalya":{"lat":36.8969,"lon":30.7133,"tz":"Europe/Istanbul"},
  "adana":{"lat":37.0000,"lon":35.3213,"tz":"Europe/Istanbul"},
  "konya":{"lat":37.8713,"lon":32.4846,"tz":"Europe/Istanbul"},
  "trabzon":{"lat":41.0015,"lon":39.7178,"tz":"Europe/Istanbul"},
  "berlin":{"lat":52.5200,"lon":13.4050,"tz":"Europe/Berlin"},
  "london":{"lat":51.5074,"lon":-0.1278,"tz":"Europe/London"},
  "dubai":{"lat":25.2048,"lon":55.2708,"tz":"Asia/Dubai"}
};

app.post("/api/geocode", auth, async (req, res) => {
  const city = (req.body.city||"").toLowerCase().replace(/[ğüşıöç]/g, c => ({ğ:"g",ü:"u",ş:"s",ı:"i",ö:"o",ç:"c"}[c]||c));
  for (const [k,v] of Object.entries(CITIES)) {
    if (city.includes(k) || k.includes(city)) return res.json({ found:true, ...v, city:k });
  }
  res.json({ found:false, ...CITIES["istanbul"], city:"istanbul" });
});

app.listen(PORT, () => console.log("Kozmik API :" + PORT));
