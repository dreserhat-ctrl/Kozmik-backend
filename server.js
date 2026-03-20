const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

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

// Ana sayfa - HTML gömülü
const HTML_CONTENT = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>Kozmik Uyum Analizi ✦</title>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Raleway:wght@300;400;600;800&display=swap" rel="stylesheet"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{
  --gold:#d4af6e;--rose:#e8a0c0;--violet:#9b7fd4;--teal:#5ec4b0;
  --deep:#f5ede0;--text:rgba(60,40,20,.88);--muted:rgba(120,90,60,.52)
}
body{min-height:100vh;background:linear-gradient(160deg,#fdf6ec,#f0e2cc);font-family:"Cormorant Garamond",serif;color:var(--text);overflow-x:hidden}
canvas#bg{position:fixed;inset:0;z-index:0;opacity:.5}
.wrap{position:relative;z-index:1;max-width:540px;margin:0 auto;padding:18px 12px 70px}

/* HEADER */
.hdr{text-align:center;padding:26px 0 16px}
.hdr-orn{font-size:30px;display:block;margin-bottom:7px;filter:drop-shadow(0 0 14px var(--gold))}
h1{font-family:"Cinzel",serif;font-size:20px;letter-spacing:3px;color:var(--gold);text-shadow:0 0 20px rgba(212,175,110,.4);margin-bottom:5px}
.hdr-sub{font-size:12px;color:#333;font-weight:700;font-style:italic;letter-spacing:1px}
.hdr-line{width:90px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent);margin:11px auto 0}

/* FORM CARD */
.fcard{background:linear-gradient(135deg,rgba(255,255,255,.72),rgba(255,248,235,.55));border-radius:18px;padding:17px 14px;margin-bottom:13px;position:relative;overflow:hidden}
.fcard.p1{border:1px solid rgba(232,160,192,.22)}
.fcard.p1::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 80% 0%,rgba(210,120,150,.08),transparent 55%);pointer-events:none}
.fcard.p2{border:1px solid rgba(155,127,212,.22)}
.fcard.p2::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 20% 0%,rgba(130,90,200,.08),transparent 55%);pointer-events:none}
.ctitle{font-family:"Cinzel",serif;font-size:12px;letter-spacing:2.5px;text-align:center;margin-bottom:13px}
.p1 .ctitle{color:var(--rose)} .p2 .ctitle{color:var(--violet)}
.prow{display:flex;align-items:center;gap:9px;margin-bottom:5px;font-size:14px;color:#111;font-weight:700}
.lsm{font-size:10px;letter-spacing:1.2px;color:#333;font-weight:700;text-transform:uppercase;margin:11px 0 6px}
.bdgs{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}
.bdg{padding:3px 10px;border-radius:18px;font-size:11px;letter-spacing:.3px;border:1px solid}
.bg{border-color:rgba(212,175,110,.3);color:rgba(212,175,110,.8);background:rgba(212,175,110,.05)}
.br{border-color:rgba(232,160,192,.3);color:rgba(232,160,192,.8);background:rgba(232,160,192,.05)}
.fw{position:relative;height:46px;margin-bottom:7px}
.nf{position:absolute;inset:0;opacity:0;cursor:pointer;z-index:10;font-size:16px;width:100%;height:100%}
.fv{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:100%;border-radius:10px;border:1px dashed rgba(155,127,212,.33);background:rgba(155,127,212,.04);color:rgba(185,165,235,.6);font-size:13px;pointer-events:none;font-family:"Cormorant Garamond",serif}
.prv{width:100%;height:130px;border-radius:10px;background:rgba(200,170,130,.12);border:1px solid rgba(160,120,70,.2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.prv img{max-width:100%;max-height:100%;object-fit:contain}
.prv .nim{color:rgba(120,80,40,.35);font-size:12px;font-style:italic}
.delbtn{position:absolute;top:5px;right:5px;background:rgba(170,30,30,.8);border:none;border-radius:50%;width:22px;height:22px;color:#fff;font-size:10px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.fi{width:100%;padding:10px 13px;border-radius:10px;border:1px solid rgba(160,120,70,.22);background:rgba(255,255,255,.05);color:var(--text);font-size:14px;font-family:"Cormorant Garamond",serif;outline:none;-webkit-appearance:none;transition:border-color .2s;margin-bottom:7px}
.fi:last-child,.fi:focus{margin-bottom:7px;border-color:rgba(155,100,200,.5)}
.fi::placeholder{color:#999;font-weight:600} .fi option{background:#f5ede0}
.dr{display:flex;gap:6px} .dr .fi{flex:1}
.snbdg{display:none;padding:6px 13px;border-radius:9px;background:rgba(155,127,212,.13);border:1px solid rgba(155,127,212,.17);text-align:center;color:rgba(195,175,250,.85);font-size:13px;margin-bottom:7px;letter-spacing:.3px}
.div{text-align:center;margin:3px 0;font-size:19px;filter:drop-shadow(0 0 8px var(--rose));animation:fl 3s ease-in-out infinite}
@keyframes fl{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
.abtn{display:block;width:100%;padding:15px;border-radius:50px;border:1px solid rgba(212,175,110,.37);background:linear-gradient(135deg,rgba(212,175,110,.12),rgba(155,127,212,.12));color:var(--gold);font-size:15px;cursor:pointer;font-family:"Cinzel",serif;letter-spacing:2px;box-shadow:0 0 20px rgba(212,175,110,.12);margin-top:5px;touch-action:manipulation;transition:all .3s}
.abtn:disabled{opacity:.33;cursor:not-allowed}
.err{padding:10px;border-radius:9px;background:rgba(200,50,50,.09);border:1px solid rgba(200,50,50,.2);color:rgba(255,155,155,.88);font-size:13px;text-align:center;margin-bottom:10px;display:none}
@keyframes sp{to{transform:rotate(360deg)}}

/* LOADING */
.lov{display:none;position:fixed;inset:0;z-index:200;background:rgba(245,237,224,.96);flex-direction:column;align-items:center;justify-content:center;gap:13px}
.lov.show{display:flex}
.lorb{width:60px;height:60px;border-radius:50%;border:2px solid transparent;border-top-color:var(--gold);border-right-color:var(--rose);animation:sp 1.2s linear infinite;box-shadow:0 0 26px rgba(212,175,110,.26)}
.ltxt{font-family:"Cinzel",serif;font-size:11px;letter-spacing:2px;color:var(--gold);opacity:.78}
.lstep{font-size:12px;color:#333;font-weight:700;text-align:center;max-width:230px;line-height:1.7}

/* RESULT */
#result{display:none;margin-top:16px;animation:fu .7s ease}
@keyframes fu{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

/* TABS */
.tabs{display:flex;gap:0;border-radius:13px;overflow:hidden;border:1px solid rgba(160,120,70,.18);margin-bottom:14px;background:rgba(255,255,255,.02)}
.tab{flex:1;padding:10px 2px;font-family:"Cinzel",serif;font-size:9px;letter-spacing:.8px;text-align:center;cursor:pointer;color:#333;font-weight:700;border:none;background:transparent;transition:all .25s;border-bottom:2px solid transparent;touch-action:manipulation}
.tab.act{color:var(--gold);border-bottom-color:var(--gold);background:rgba(212,175,110,.06)}
.tpanel{display:none} .tpanel.act{display:block}

/* CARDS */
.rcard{background:linear-gradient(160deg,rgba(255,252,245,.97),rgba(248,238,220,.98));border:1px solid rgba(180,140,80,.2);border-radius:20px;padding:18px 14px;box-shadow:0 0 45px rgba(155,127,212,.07)}
.sec{border:1px solid rgba(170,130,80,.14);border-radius:12px;padding:12px 13px;margin-bottom:10px;background:rgba(255,255,255,.02)}
.st{font-family:"Cinzel",serif;font-size:9px;letter-spacing:2px;color:var(--gold);opacity:.62;margin-bottom:8px;text-transform:uppercase}
.sb{font-size:14px;line-height:1.82;color:#111;font-weight:700}

/* VERSUS */
.vs{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 0 8px}
.vp{text-align:center;flex:1}
.vav{width:66px;height:66px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 7px;font-size:25px;position:relative;overflow:hidden}
.vav img{width:100%;height:100%;object-fit:cover}
.vaura{position:absolute;inset:-3px;border-radius:50%;border:2px solid;animation:ap 2.5s ease-in-out infinite}
@keyframes ap{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:.9;transform:scale(1.06)}}
.vnm{font-family:"Cinzel",serif;font-size:10px;letter-spacing:.8px;margin-bottom:2px}
.vsg{font-size:11px;color:#333;font-weight:700;font-style:italic}
.vhrt{font-size:24px;filter:drop-shadow(0 0 9px var(--rose));flex-shrink:0}

/* SKOR */
.ssec{text-align:center;padding:16px 0 12px}
.rwr{position:relative;width:136px;height:136px;margin:0 auto 12px}
.rsvg{transform:rotate(-90deg)}
.rtk{fill:none;stroke:rgba(255,255,255,.05);stroke-width:8}
.rfl{fill:none;stroke-width:8;stroke-linecap:round;transition:stroke-dasharray 1.6s cubic-bezier(.35,0,.2,1)}
.scc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.snum{font-family:"Cinzel",serif;font-size:34px;font-weight:700;line-height:1}
.sden{font-size:10px;color:#333;font-weight:700;letter-spacing:1px}
.svrd{font-family:"Cinzel",serif;font-size:16px;letter-spacing:1px;margin-bottom:6px}
.stag{display:inline-block;padding:4px 16px;border-radius:18px;border:1px solid;background:rgba(255,255,255,.04);font-size:10px;letter-spacing:.8px;color:#333;font-weight:700}

/* AURA KARTI */
.ac{border-radius:12px;padding:14px;margin-bottom:10px;border:1px solid rgba(180,140,60,.18);background:rgba(212,175,110,.022)}
.ac .st{color:var(--gold)}
.aorbs{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.aorb{display:flex;align-items:center;gap:7px;padding:6px 10px;border-radius:22px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:12px}
.odot{width:10px;height:10px;border-radius:50%;flex-shrink:0}

/* BİREYSEL KART */
.soloC{border-radius:13px;padding:14px;margin-bottom:10px;border:1px solid}
.s1c{border-color:rgba(210,120,150,.22);background:rgba(232,160,192,.05)}
.s1c .st{color:var(--rose)}
.s2c{border-color:rgba(130,90,200,.22);background:rgba(155,127,212,.05)}
.s2c .st{color:var(--violet)}
.shdr{display:flex;align-items:center;gap:10px;margin-bottom:12px}
.sava{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:19px;flex-shrink:0;overflow:hidden;border:2px solid}
.sava img{width:100%;height:100%;object-fit:cover}
.snm{font-family:"Cinzel",serif;font-size:12px;margin-bottom:3px}
.ssg{font-size:11px;color:#333;font-weight:700}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin:8px 0}
.chip{padding:3px 9px;border-radius:12px;font-size:11px;background:rgba(180,130,70,.09);border:1px solid rgba(180,130,70,.1);color:rgba(205,190,248,.8)}
.psub{font-family:"Cinzel",serif;font-size:9px;letter-spacing:1.2px;color:#333;font-weight:700;text-transform:uppercase;margin:9px 0 4px}

/* ÇAKRA */
.chkr{margin-top:4px}
.chrow{display:flex;align-items:flex-start;gap:8px;margin-bottom:9px}
.chdot{width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;margin-top:1px}
.chi{flex:1}
.chnm{font-size:10px;letter-spacing:.5px;color:rgba(255,255,255,.55);margin-bottom:3px;font-family:"Cinzel",serif}
.chbr{display:flex;align-items:center;gap:6px;margin-bottom:3px}
.chbg{flex:1;height:5px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden}
.chfill{height:100%;border-radius:3px;transition:width 1.4s ease}
.chpct{font-size:11px;min-width:27px;text-align:right;font-family:"Cinzel",serif}
.chdsc{font-size:11px;color:#333;font-weight:700;line-height:1.35}
.chsum{margin-top:9px;padding:9px 12px;border-radius:9px;background:rgba(200,160,60,.07);font-size:13px;color:rgba(255,216,135,.7);line-height:1.62}

/* ENERJİ */
.mtrs{display:flex;flex-wrap:wrap;gap:8px;margin-top:5px}
.mtr{flex:1;min-width:110px;padding:10px;border-radius:10px;background:rgba(255,255,255,.5);border:1px solid rgba(160,120,70,.07)}
.mlbl{font-size:9px;letter-spacing:.7px;color:#333;font-weight:700;text-transform:uppercase;margin-bottom:4px}
.mval{font-family:"Cinzel",serif;font-size:18px;margin-bottom:3px}
.mbar{width:100%;height:4px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:3px}
.mfill{height:100%;border-radius:2px;transition:width 1.4s ease}
.mnote{font-size:10px;color:rgba(100,70,30,.6);line-height:1.3}

/* YILDIZ HARİTASI */
.cwrap{position:relative;margin:9px 0;border-radius:12px;overflow:hidden;background:#2d1a08;border:1px solid rgba(255,255,255,.07)}
canvas.achart{display:block;width:100%;margin:0 auto}
.pgrid{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.pchip{padding:4px 9px;border-radius:8px;font-size:11px;background:rgba(180,130,50,.1);border:1px solid rgba(180,130,50,.17);color:rgba(255,225,145,.8)}
.asplist{margin-top:9px;display:flex;flex-direction:column;gap:5px}
.aspitem{display:flex;align-items:flex-start;gap:8px;font-size:12px;padding:7px 10px;border-radius:9px;background:rgba(155,127,212,.03);border:1px solid rgba(255,255,255,.07)}
.aspico{font-size:15px;flex-shrink:0;margin-top:1px}
.aspnm{font-family:"Cinzel",serif;font-size:9px;letter-spacing:.8px;color:#333;font-weight:700;flex-shrink:0;min-width:55px;margin-top:2px}
.asptxt{font-size:12px;color:#111;font-weight:700;line-height:1.4}

/* UYUM GRAFİKLERİ */
canvas.radar{display:block;margin:0 auto}
.cbars{display:flex;flex-direction:column;gap:8px;margin-top:11px}
.cbrow{display:flex;align-items:center;gap:9px}
.cblbl{font-family:"Cinzel",serif;font-size:9px;letter-spacing:.7px;color:#333;font-weight:700;min-width:75px;text-align:right;text-transform:uppercase}
.cbbg{flex:1;height:7px;border-radius:4px;background:rgba(160,120,60,.15);overflow:hidden}
.cbfill{height:100%;border-radius:4px;transition:width 1.5s ease}
.cbpct{font-family:"Cinzel",serif;font-size:11px;min-width:30px}

/* GÜÇLÜ/ZORLUK */
.twocol{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap}
.colg{flex:1;min-width:125px;padding:11px;border-radius:11px;background:rgba(80,180,100,.07);border:1px solid rgba(60,160,120,.11)}
.colb{flex:1;min-width:125px;padding:11px;border-radius:11px;background:rgba(200,60,60,.07);border:1px solid rgba(200,60,80,.11)}
.colg .st{color:rgba(100,220,140,.58)} .colb .st{color:rgba(240,140,140,.58)}
.li{font-size:12px;color:#0d4020;font-weight:700;margin-bottom:5px;line-height:1.5;padding-left:12px;position:relative}
.li::before{content:"·";position:absolute;left:3px;color:var(--gold)}
.colb .li{color:#500;font-weight:700}

/* TAVSİYE/ÖZET */
.advc{border:1px solid rgba(232,160,192,.12);border-radius:12px;padding:14px;margin-bottom:10px;background:linear-gradient(135deg,rgba(232,160,192,.04),rgba(155,127,212,.04))}
.advc .st{color:rgba(232,160,192,.62)} .advc .sb{font-style:italic}
.sumc{border:1px solid rgba(255,255,255,.06);border-radius:12px;padding:14px;background:rgba(255,255,255,.02)}
.sumc .st{color:rgba(170,170,255,.48)} .sumc .sb{color:rgba(50,35,80,.78)}
.rbtn{display:block;width:100%;margin-top:18px;padding:11px;border-radius:50px;border:1px solid rgba(160,100,40,.25);background:rgba(255,255,255,.04);color:rgba(255,210,180,.52);font-size:11px;cursor:pointer;font-family:"Cinzel",serif;letter-spacing:1.5px;touch-action:manipulation}

/* ── GLOBAL OKUNAKLILIK ─────────────────── */
body { color: #111 !important; }
.sb { color: #111 !important; font-weight:700 !important; }
.psub { color: #222 !important; font-weight:800 !important; }
.st { color: #6b3800 !important; font-weight:800 !important; opacity:1 !important; }
h1 { color: #5a3000 !important; font-weight:900 !important; }
.hdr-sub { color: #5c3d10 !important; font-weight:700 !important; }
.ctitle { font-weight:900 !important; }
.tab { color: #333 !important; font-weight:700 !important; }
.tab.act { color: #5a3000 !important; font-weight:900 !important; }
.fi { color: #111 !important; font-weight:700 !important; }
.fi::placeholder { color: #888 !important; font-weight:600 !important; }
.snbdg { color: #333 !important; font-weight:700 !important; }
.stag { color: #333 !important; font-weight:700 !important; }
.abtn { font-weight:900 !important; color:#5a3000 !important; }
.rbtn { color: #333 !important; font-weight:700 !important; }
.ltxt { color: #7a4a00 !important; font-weight:800 !important; }
.lstep { color: #333 !important; font-weight:700 !important; }
.li { color: #1a4d25 !important; font-weight:700 !important; }
.colb .li { color: #6b1010 !important; font-weight:700 !important; }
.sumc .sb { color: #1a1040 !important; font-weight:700 !important; }
.pchip { color: #333 !important; font-weight:700 !important; }
input, select, option { color: #111 !important; font-weight:700 !important; }
*, *::before, *::after { font-weight: 700 !important; }
h1, .ctitle, .st, .psub, .abtn { font-weight: 900 !important; }

/* ─── 2-fotoğraf yükleme alanı ─── */
.foto2wrap{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.fslot-lbl{font-size:10px;font-weight:800;letter-spacing:1px;color:#5a3000;text-transform:uppercase;margin-bottom:4px;display:block}
.fslot-lbl span{font-weight:400;color:#888;font-size:9px;letter-spacing:0}
.prv2{width:100%;height:110px;border-radius:10px;background:rgba(200,170,130,.12);border:1px solid rgba(160,120,70,.2);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;margin-top:4px}
.prv2 img{width:100%;height:100%;object-fit:cover;border-radius:9px}

.cbrow{display:flex;align-items:center;margin-bottom:5px;gap:6px}
.cblbl{font-size:11px;color:#555;min-width:70px;font-weight:600}
.cbbar{height:8px;border-radius:4px;flex:1;background:rgba(0,0,0,.06)}
.cbfill{height:8px;border-radius:4px;transition:width .8s ease}
.cbval{font-size:11px;color:#333;min-width:30px;text-align:right;font-weight:700}
.li{padding:5px 8px;font-size:12px;line-height:1.6;color:#111;border-bottom:1px solid rgba(0,0,0,.05)}
.li:last-child{border-bottom:none}
.aorb{display:flex;gap:10px;margin-bottom:4px}
.odot{width:14px;height:14px;border-radius:50%;display:inline-block;margin-right:4px;vertical-align:middle}
.chips{display:flex;flex-wrap:wrap;gap:5px;margin:4px 0}
.chip{padding:3px 8px;border-radius:12px;font-size:10px;font-weight:700;letter-spacing:.5px}
.aspitem{padding:4px 0;border-bottom:1px solid rgba(0,0,0,.05);font-size:12px}
.aspitem:last-child{border-bottom:none}

/* Toggle */
.tog-wrap{cursor:pointer;flex-shrink:0}
.tog-track{width:44px;height:24px;border-radius:12px;background:rgba(200,170,130,.3);position:relative;transition:background .3s}
.tog-thumb{width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;left:2px;transition:transform .3s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
</style>
</head>
<body>
<canvas id="bg" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:.4"></canvas>

<!-- YÜKLEME EKRANI -->
<div class="lov" id="lov">
  <div class="lorb"></div>
  <div class="ltxt">Kozmik bağlantı kuruluyor...</div>
  <div class="lstep" id="lstep"></div>
</div>

<!-- ANA KART -->
<div class="wrap">

<!-- BAŞLIK -->
<div class="hdr">
  <div style="font-size:28px;margin-bottom:6px">✦</div>
  <h1>KOZMİK UYUM ANALİZİ</h1>
  <div class="hdr-sub">Astroloji · Sinastri · Spiritüel</div>
  <div class="hdr-line"></div>
</div>

<!-- API ANAHTARI -->
<div class="fcard" style="display:none">
  <div class="ctitle" style="color:#b8860b">🔑 CLAUDE API ANAHTARI</div>
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;background:rgba(212,175,110,.08);padding:10px 12px;border-radius:10px">
    <label class="tog-wrap" for="webToggle">
      <input type="checkbox" id="webToggle" onchange="toggleWeb()" style="display:none"/>
      <div class="tog-track" id="webTrack">
        <div class="tog-thumb" id="webThumb"></div>
      </div>
    </label>
    <div>
      <div style="font-size:11px;font-weight:800;letter-spacing:1.2px;color:#3b4f6e">🌐 WEB ARAMASI</div>
      <div id="webToggleLabel" style="font-size:10px;color:#666">Kapalı — Sadece astroloji analizi</div>
    </div>
  </div>
  <div style="position:relative;margin-bottom:6px">
    <input type="password" id="apiKeyInp" placeholder="sk-ant-api... girin (opsiyonel)" class="fi" style="padding-right:40px" oninput="saveKey()"/>
    <span onclick="toggleKey()" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;font-size:16px">👁</span>
  </div>
  <div id="keyStatus" style="font-size:11px;color:#666;min-height:16px"></div>
  <div style="font-size:10px;color:#aaa;margin-top:4px;text-align:right">
    <a href="https://console.anthropic.com" target="_blank" style="color:#b8860b;text-decoration:none">Nasıl alırım?</a>
  </div>
</div>

<!-- BİRİNCİ KİŞİ -->
<div class="fcard p1">
  <div class="ctitle">✦ BİRİNCİ KİŞİ ✦</div>
  <input class="fi" type="text" id="nm1" placeholder="İsim Soyisim (isteğe bağlı)"/>
  <div class="dr">
    <select class="fi" id="dy1" onchange="suUpd1()"><option value="">Gün</option></select>
    <select class="fi" id="mo1" onchange="suUpd1()"><option value="">Ay</option></select>
    <select class="fi" id="yr1"><option value="">Yıl</option></select>
  </div>
  <div id="snbdg1" style="display:none;font-size:11px;font-weight:700;color:#5a3000;margin:4px 0;text-align:center"></div>
  <select class="fi" id="ri1"><option value="">Yükselen Burç (opsiyonel)</option></select>
  <div class="dr" style="margin-top:6px">
    <select class="fi" id="hr1"><option value="">Doğum Saati (opsiyonel)</option></select>
    <select class="fi" id="mn1"><option value="">Dakika</option></select>
  </div>
  <input class="fi" type="text" id="loc1" placeholder="Doğum Şehri (opsiyonel)" style="margin-top:6px"/>
  <div class="lsm" style="margin-top:10px">📷 FOTOĞRAF (Karakter &amp; Spiritüel Analiz)</div>
  <div class="foto2wrap">
    <div class="fslot">
      <span class="fslot-lbl">Portre <span>(Yüz yakın)</span></span>
      <label for="file1a" style="display:block;cursor:pointer">
        <div style="border:2px dashed rgba(212,175,110,.5);border-radius:10px;padding:10px;text-align:center;background:rgba(212,175,110,.06)">
          <input type="file" accept="image/*" id="file1a" onchange="loadPhoto('1a',this)" style="display:none"/>
          <div style="font-size:22px">📷</div>
          <div style="font-size:10px;font-weight:800;color:#5a3000">Portre Seç</div>
        </div>
      </label>
      <div class="prv2" id="prv1a" style="display:none"></div>
    </div>
    <div class="fslot">
      <span class="fslot-lbl">Boydan <span>(opsiyonel)</span></span>
      <label for="file1b" style="display:block;cursor:pointer">
        <div style="border:2px dashed rgba(212,175,110,.3);border-radius:10px;padding:10px;text-align:center;background:rgba(212,175,110,.03)">
          <input type="file" accept="image/*" id="file1b" onchange="loadPhoto('1b',this)" style="display:none"/>
          <div style="font-size:22px">🧍</div>
          <div style="font-size:10px;font-weight:800;color:#5a3000">Boydan Seç</div>
        </div>
      </label>
      <div class="prv2" id="prv1b" style="display:none"></div>
    </div>
  </div>
</div>

<div class="div">💞</div>

<!-- İKİNCİ KİŞİ -->
<div class="fcard p2">
  <div class="ctitle">✦ İKİNCİ KİŞİ ✦</div>
  <input class="fi" type="text" id="nm2" placeholder="İsim Soyisim (isteğe bağlı)"/>
  <div class="dr">
    <select class="fi" id="dy2" onchange="suUpd()"><option value="">Gün</option></select>
    <select class="fi" id="mo2" onchange="suUpd()"><option value="">Ay</option></select>
    <select class="fi" id="yr2"><option value="">Yıl</option></select>
  </div>
  <div class="snbdg" id="snbdg"></div>
  <select class="fi" id="ri2"><option value="">Yükselen Burç (isteğe bağlı)</option></select>
  <div class="dr">
    <select class="fi" id="hr2"><option value="">Doğum Saati (opsiyonel)</option></select>
    <select class="fi" id="mn2"><option value="">Dakika</option></select>
  </div>
  <input class="fi" type="text" id="loc2" placeholder="Doğum Şehri (isteğe bağlı)"/>
  <div class="lsm" style="margin-top:10px">📷 FOTOĞRAF (Karakter &amp; Spiritüel Analiz)</div>
  <div class="foto2wrap">
    <div class="fslot">
      <span class="fslot-lbl">Portre <span>(Yüz yakın)</span></span>
      <label for="file2a" style="display:block;cursor:pointer">
        <div style="border:2px dashed rgba(155,127,212,.5);border-radius:10px;padding:10px;text-align:center;background:rgba(155,127,212,.06)">
          <input type="file" accept="image/*" id="file2a" onchange="loadPhoto('2a',this)" style="display:none"/>
          <div style="font-size:22px">📷</div>
          <div style="font-size:10px;font-weight:800;color:#2d1b69">Portre Seç</div>
        </div>
      </label>
      <div class="prv2" id="prv2a" style="display:none"></div>
    </div>
    <div class="fslot">
      <span class="fslot-lbl">Boydan <span>(opsiyonel)</span></span>
      <label for="file2b" style="display:block;cursor:pointer">
        <div style="border:2px dashed rgba(155,127,212,.3);border-radius:10px;padding:10px;text-align:center;background:rgba(155,127,212,.03)">
          <input type="file" accept="image/*" id="file2b" onchange="loadPhoto('2b',this)" style="display:none"/>
          <div style="font-size:22px">🧍</div>
          <div style="font-size:10px;font-weight:800;color:#2d1b69">Boydan Seç</div>
        </div>
      </label>
      <div class="prv2" id="prv2b" style="display:none"></div>
    </div>
  </div>
</div>

<div class="err" id="err"></div>
<div id="dbgEl" style="display:none;font-size:10px;color:#333;padding:8px;background:#f5f5f5;border-radius:8px;margin:4px 0;max-height:200px;overflow:auto"></div>
<button class="abtn" id="abtn" onclick="analyze()">✦ UYUMU ANALİZ ET ✦</button>

<!-- SONUÇ -->
<div id="result" style="display:none">
<div class="rcard">

  <!-- Versus + Skor -->
  <div class="vs">
    <div class="vp">
      <div class="vav" id="vav1" style="overflow:hidden;background:rgba(212,175,110,.15);position:relative">
        <span style="font-size:25px">♒</span>
        <div class="vaura" id="vaura1" style="border-color:#3b82f6"></div>
      </div>
      <div class="vnm">KOVA ☀️</div>
      <div class="vsg">Oğlak ⬆</div>
    </div>
    <div class="vp" style="text-align:center;flex:0 0 auto">
      <svg width="120" height="120" viewBox="0 0 120 120" style="display:block;margin:0 auto">
        <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(200,170,130,.15)" stroke-width="10"/>
        <circle id="rfl" cx="60" cy="60" r="52" fill="none" stroke="#d4af6e" stroke-width="10"
          stroke-linecap="round" stroke-dasharray="0 327"
          style="transform:rotate(-90deg);transform-origin:60px 60px;transition:stroke-dasharray 1.2s ease"/>
      </svg>
      <div class="snum" id="snum" style="font-family:Cinzel,serif;font-size:28px;font-weight:900;color:#d4af6e;margin-top:-90px;position:relative;z-index:1">0</div>
      <div class="svrd" id="svrd" style="font-size:12px;color:#9b7fd4;font-weight:700;margin-top:58px">/ 100</div>
      <div id="stag" style="font-size:10px;letter-spacing:1px;color:#9b7fd4;font-weight:700;margin-top:2px"></div>
    </div>
    <div class="vp">
      <div class="vav" id="vav2" style="overflow:hidden;background:rgba(155,127,212,.15);position:relative">
        <span style="font-size:25px" id="s2ico-hdr">🌙</span>
        <div class="vaura" id="vaura2" style="border-color:#9b7fd4"></div>
      </div>
      <div class="vnm" id="vnm2">2. Kişi</div>
      <div class="vsg" id="vsg2">—</div>
    </div>
  </div>

  <!-- Sekme Bar -->
  <div class="tabs">
    <div class="tab act" onclick="sw(0)">UYUM</div>
    <div class="tab" onclick="sw(1)">KİŞİ 1</div>
    <div class="tab" onclick="sw(2)">KİŞİ 2</div>
    <div class="tab" onclick="sw(3)">HARİTA</div>
    <div class="tab" onclick="sw(4)">🧠 PROFİL</div>
    <div class="tab" onclick="sw(5)">💘 TAKTİK</div>
  </div>

  <!-- TAB 0: UYUM -->
  <div class="tpanel act" id="tp0">
    <div id="r-web" style="display:none;margin-bottom:8px;padding:10px 12px;border-radius:10px;background:rgba(94,196,176,.06);border:1px solid rgba(94,196,176,.18)"></div>
    <div class="sec" style="background:rgba(255,240,200,.3)">
      <div class="st">🔮 AURA ENERJİ UYUMU</div>
      <div id="r-aura"></div>
      <div id="r-aorbs" style="margin-top:8px"></div>
    </div>
    <div class="sec">
      <div class="st">📊 UYUM RADAR GRAFİĞİ</div>
      <canvas id="radarC" width="300" height="300" style="display:block;margin:0 auto;max-width:100%;height:280px"></canvas>
    </div>
    <div class="sec" style="background:rgba(240,230,255,.3)">
      <div class="st">🌈 ÇAKRA UYUM GRAFİĞİ &amp; ANALİZİ</div>
      <canvas id="chkComp" width="300" height="200" style="display:block;margin:0 auto;max-width:100%;height:180px"></canvas>
      <div id="r-chkr-comp"></div>
      <div id="r-chsum" style="padding:6px 0;font-size:12px;color:#555;line-height:1.6"></div>
    </div>
    <div class="sec">
      <div class="st">⚡ ENERJİ UYUMU</div>
      <div id="r-cbars" style="margin-bottom:8px"></div>
      <div id="r-energy"></div>
    </div>
    <div class="sec" style="background:rgba(230,240,255,.3)">
      <div class="st">🔵 SPİRİTÜEL UYUM</div>
      <div id="r-spir"></div>
      <div id="r-spir-detay" style="margin-top:8px"></div>
    </div>
    <div class="sec" style="background:rgba(245,235,255,.35);border:1px solid rgba(155,127,212,.2)">
      <div class="st">🪐 SİNASTRİ — YILDIZ HARİTASI UYUMU</div>
      <div id="r-harita-yorum"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div class="sec" style="background:rgba(220,255,220,.3)">
        <div class="st">💚 GÜÇLÜ YÖNLER</div>
        <div id="r-str"></div>
      </div>
      <div class="sec" style="background:rgba(255,220,220,.3)">
        <div class="st">⚡ ZORLUKLAR</div>
        <div id="r-cha"></div>
      </div>
    </div>
    <div class="sec" style="background:rgba(255,248,220,.35);border:1px solid rgba(212,175,110,.2)">
      <div class="st">⚠️ KRİTİK UYARI — DİKKAT EDİLMESİ GEREKENLER</div>
      <div id="r-uyari"></div>
    </div>
    <div class="sec" style="background:rgba(255,245,220,.3)">
      <div class="st">🌹 TAVSİYE</div>
      <div id="r-dinamik" style="display:none;font-size:13px;line-height:1.8;color:#111;padding:10px 14px;border-radius:11px;background:rgba(155,127,212,.06);border:1px solid rgba(155,127,212,.15);margin-bottom:10px"></div>
      <div id="r-adv"></div>
    </div>
    <div class="sec">
      <div class="st">✦ ÖZET</div>
      <div id="r-sum"></div>
    </div>
    <div id="r-spir-renk-wrap" style="display:none" class="sec">
      <div class="st">✨ SPİRİTÜEL RENKLER &amp; UYUM</div>
      <div id="r-spir-renk"></div>
    </div>
    <button class="abtn" style="margin-top:8px;background:rgba(180,140,70,.15);color:#5a3000;border:1px solid rgba(180,140,70,.3);font-size:12px" onclick="resetApp()">↩ YENİ ANALİZ</button>
  </div>

  <!-- TAB 1: KİŞİ 1 -->
  <div class="tpanel" id="tp1">
    <div class="soloC s1c">
      <div class="st">✦ BİRİNCİ KİŞİ — DERİN PROFİL</div>
      <div class="shdr">
        <div class="sava" id="s1av" style="background:rgba(212,175,110,.15);border-color:rgba(212,175,110,.4);font-size:28px">♒</div>
        <div>
          <div style="font-weight:800;font-size:16px" id="s1nm">Kova ☀️</div>
          <div style="font-size:12px;color:#666" id="s1sg">Oğlak ⬆ · Hava · Uranüs/Satürn</div>
          <div style="font-size:11px;color:#888">10 Şubat 1967</div>
        </div>
      </div>
      <div id="s1-aura" style="font-size:12px;color:#555;line-height:1.6;margin-bottom:6px;padding:6px 8px;border-radius:8px;background:rgba(212,175,110,.06)"></div>
      <div id="s1-aorbs" style="margin-bottom:8px"></div>
      <div id="s1-char" style="font-size:12px;line-height:1.7;color:#111;margin-bottom:6px;padding:8px;background:rgba(155,127,212,.05);border-radius:8px"></div>
      <div id="s1-chips" style="margin-bottom:6px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div class="sec" style="margin:0"><div class="st" style="font-size:9px">💞 AŞK STİLİ</div><div id="s1-love" style="font-size:11px;line-height:1.5;color:#111"></div></div>
        <div class="sec" style="margin:0"><div class="st" style="font-size:9px">💪 GÜÇ</div><div id="s1-str" style="font-size:11px;line-height:1.5;color:#111"></div></div>
      </div>
      <div id="s1-shd" style="font-size:11px;color:#666;font-style:italic;margin-bottom:8px;padding:6px 8px;border-left:3px solid rgba(155,127,212,.3)"></div>
      <div class="st" style="margin-top:10px">🌈 ÇAKRA GRAFİĞİ</div>
      <canvas id="chk1C" width="300" height="200" style="display:block;margin:0 auto;max-width:100%;height:180px"></canvas>
      <div id="s1-chakra-text"></div>
      <div class="st" style="margin-top:10px">⚡ ENERJİ PROFİLİ</div>
      <div id="s1-mtrs" style="margin-bottom:6px"></div>
      <div id="s1-energy-text"></div>
      <div class="st" style="margin-top:10px">📷 FOTOĞRAF &amp; AURA ANALİZİ</div>
      <div id="s1-foto-aura"></div>
      <div class="st" style="margin-top:10px">🌟 YILDIZ HARİTASI ANALİZİ</div>
      <div id="s1-astro" style="font-size:12px;line-height:1.7;color:#111;margin-bottom:6px"></div>
      <div id="s1-spir-extra" style="margin-top:4px"></div>
    </div>
  </div>

  <!-- TAB 2: KİŞİ 2 -->
  <div class="tpanel" id="tp2">
    <div class="soloC s2c">
      <div class="st">✦ İKİNCİ KİŞİ — DERİN PROFİL</div>
      <div class="shdr">
        <div class="sava" id="s2ico-tab" style="background:rgba(155,127,212,.15);border-color:rgba(155,127,212,.4);font-size:28px">🌙</div>
        <div>
          <div style="font-weight:800;font-size:16px" id="s2nm">—</div>
          <div style="font-size:12px;color:#666" id="s2sg">—</div>
        </div>
      </div>
      <div id="s2-aura" style="font-size:12px;color:#555;line-height:1.6;margin-bottom:6px;padding:6px 8px;border-radius:8px;background:rgba(155,127,212,.06)"></div>
      <div id="s2-aorbs" style="margin-bottom:8px"></div>
      <div id="s2-char" style="font-size:12px;line-height:1.7;color:#111;margin-bottom:6px;padding:8px;background:rgba(155,127,212,.05);border-radius:8px"></div>
      <div id="s2-chips" style="margin-bottom:6px"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
        <div class="sec" style="margin:0"><div class="st" style="font-size:9px">💞 AŞK STİLİ</div><div id="s2-love" style="font-size:11px;line-height:1.5;color:#111"></div></div>
        <div class="sec" style="margin:0"><div class="st" style="font-size:9px">💪 GÜÇ</div><div id="s2-str" style="font-size:11px;line-height:1.5;color:#111"></div></div>
      </div>
      <div id="s2-shd" style="font-size:11px;color:#666;font-style:italic;margin-bottom:8px;padding:6px 8px;border-left:3px solid rgba(155,127,212,.3)"></div>
      <div class="st" style="margin-top:10px">🌈 ÇAKRA GRAFİĞİ</div>
      <canvas id="chk2C" width="300" height="200" style="display:block;margin:0 auto;max-width:100%;height:180px"></canvas>
      <div id="s2-chakra-text"></div>
      <div class="st" style="margin-top:10px">⚡ ENERJİ PROFİLİ</div>
      <div id="s2-mtrs" style="margin-bottom:6px"></div>
      <div id="s2-energy-text"></div>
      <div class="st" style="margin-top:10px">📷 FOTOĞRAF &amp; AURA ANALİZİ</div>
      <div id="s2-foto-aura"></div>
      <div class="st" style="margin-top:10px">🌟 YILDIZ HARİTASI ANALİZİ</div>
      <div id="s2-astro" style="font-size:12px;line-height:1.7;color:#111;margin-bottom:6px"></div>
      <div id="s2-spir-extra" style="margin-top:4px"></div>
      <div id="s2-fotoprofil-wrap" style="display:none;margin-top:10px" class="sec s2c">
        <div class="st" style="color:rgba(130,80,200,.65)">📸 FOTOĞRAF KARAKTERİ &amp; PSİKOLOJİ</div>
        <div id="s2-fotoprofil"></div>
      </div>
    </div>
  </div>

  <!-- TAB 3: HARİTA -->
  <div class="tpanel" id="tp3">
    <div class="soloC s1c" style="margin-bottom:10px">
      <div class="st">⭐ 1. KİŞİ — YILDIZ HARİTASI</div>
      <div class="cwrap"><canvas id="astroC1" width="320" height="320" style="display:block;width:100%"></canvas></div>
      <div id="s1-pchips" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px"></div>
    </div>
    <div class="soloC s2c">
      <div class="st">⭐ 2. KİŞİ — YILDIZ HARİTASI</div>
      <div class="cwrap"><canvas id="astroC2" width="320" height="320" style="display:block;width:100%"></canvas></div>
      <div id="s2-pchips" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px"></div>
    </div>
    <div class="sec" style="margin-top:10px;background:rgba(240,248,255,.4)">
      <div class="st">🌙 GEZEGENLER &amp; YORUMLAR</div>
      <div id="r-astro" style="font-size:12px;line-height:1.7;color:#111;white-space:pre-line"></div>
    </div>
    <div class="sec" style="margin-top:10px">
      <div class="st">⭐ ASPEKTLER</div>
      <div id="r-asps"></div>
    </div>
    <div class="sec" style="margin-top:10px;background:rgba(255,245,220,.4)" id="r-transit-wrap">
      <div class="st">🔄 TRANSİTLER</div>
      <div id="r-transit"></div>
    </div>
    <div class="sec" style="margin-top:10px">
      <div class="st">🔗 SİNASTRİ SKORU</div>
      <div id="syn-score-bar" style="margin-bottom:6px"></div>
      <div id="syn-reltype" style="font-size:12px;font-weight:700;color:#5a3000;margin-bottom:4px"></div>
      <div id="syn-karma" style="font-size:12px;color:#666;margin-bottom:8px"></div>
    </div>
    <div class="sec" style="margin-top:10px;background:rgba(220,255,220,.3)">
      <div class="st">💚 GÜÇLÜ ASPEKTLER</div>
      <div id="syn-strong"></div>
    </div>
    <div class="sec" style="margin-top:10px;background:rgba(255,220,220,.3)">
      <div class="st">⚡ ZOR ASPEKTLER</div>
      <div id="syn-challenges"></div>
    </div>
    <div class="sec" style="margin-top:10px">
      <div class="st">🔗 TÜM SİNASTRİ ASPEKTLER</div>
      <div id="syn-all"></div>
    </div>
    <div class="sec" style="margin-top:10px;background:rgba(245,240,255,.4)">
      <div class="st">✦ SİNASTRİ ÖZET</div>
      <div id="syn-summary"></div>
    </div>
  </div>

  <!-- TAB 4: PROFİL -->
  <div class="tpanel" id="tp4">
    <div class="sec" style="background:#fff0f5;border:2px solid rgba(180,60,120,.15);margin-bottom:10px">
      <div class="st">👁 KARŞI TARAF ANALİZİ</div>
      <div id="p4-karsi" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div class="sec" style="background:#f8f4ff;border:2px solid rgba(155,127,212,.2)">
      <div class="st">🧠 PSİKOLOJİK PROFİL &amp; KARAKTERİSTİKLER</div>
      <div id="p4-psiko" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(240,248,255,.5);border:2px solid rgba(99,149,237,.18)">
      <div class="st">🌈 ÇAKRA & ENERJİ HARİTASI</div>
      <div id="p4-chakra" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(245,235,255,.5);border:2px solid rgba(145,85,253,.15)">
      <div class="st">🪐 ASTROLOJİK DERİN PROFİL</div>
      <div id="p4-astro" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div class="sec" style="background:#fff8f0;border:2px solid rgba(128,64,0,.2)">
      <div class="st">📷 FOTOĞRAF ANALİZİ</div>
      <div id="p4-foto" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div class="sec" style="background:#f0fff4;border:2px solid rgba(0,128,0,.2)">
        <div class="st">💪 GÜÇLÜ YÖNLER</div>
        <div id="p4-guclu" style="font-size:13px;line-height:1.8;color:#111"></div>
      </div>
      <div class="sec" style="background:#fff8f8;border:2px solid rgba(255,0,0,.12)">
        <div class="st">🔮 GİZLİ YÖNLER</div>
        <div id="p4-gizli" style="font-size:13px;line-height:1.8;color:#111"></div>
      </div>
    </div>
    <div class="sec" style="background:#fffbf0;border:2px solid rgba(255,215,0,.2)">
      <div class="st">💞 İLİŞKİ STİLİ</div>
      <div id="p4-iliski" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div class="sec" style="background:#f0f8ff;border:2px solid rgba(65,105,225,.2)">
      <div class="st">✨ KARİZMA &amp; İLK İZLENİM</div>
      <div id="p4-karizma" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(255,245,230,.4);border:2px solid rgba(180,120,40,.15)">
      <div class="st">🔮 KARMİK DERS &amp; RUH MİSYONU</div>
      <div id="p4-karma" style="font-size:13px;line-height:1.8;color:#111"></div>
    </div>
  </div>

  <!-- TAB 5: TAKTİK -->
  <div class="tpanel" id="tp5">
    <div style="padding:10px 14px;border-radius:12px;background:linear-gradient(135deg,rgba(212,175,110,.12),rgba(155,127,212,.08));border:1px solid rgba(212,175,110,.25);margin-bottom:12px;font-size:11px;color:#5a3000;line-height:1.7">
      ✦ Bu taktikler <strong>iki kişinin karşılıklı dinamiğini</strong> esas alır — hem 2. kişinin beklentileri hem de bu ilişkide 1. kişinin güçlü tutması gereken yönler analiz edilmiştir.
    </div>
    <div class="sec" style="background:#fff9f0;border:2px solid rgba(212,175,110,.3)">
      <div class="st">🎯 2. KİŞİYE YAKLAŞIM STRATEJİSİ</div>
      <div id="t5-strateji" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:#f8f4ff;border:2px solid rgba(155,127,212,.2)">
      <div class="st">💬 İLETİŞİM KODU — NE NASIL SÖYLENMELI</div>
      <div id="t5-iletisim" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:#fff0f0;border:2px solid rgba(220,80,80,.2)">
      <div class="st">🚨 KESİN SINIRLAR — YAPILMAMASI GEREKENLER</div>
      <div id="t5-kacin" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:#f0fff8;border:2px solid rgba(50,180,100,.15)">
      <div class="st">🌹 RANDEVU & ORTAM — EN UYGUN SAHNELER</div>
      <div id="t5-randevu" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:#f0f8ff;border:2px solid rgba(65,105,225,.15)">
      <div class="st">⭐ 1. KİŞİNİN GÜÇLÜ TUTMASI GEREKEN YÖNLER</div>
      <div id="t5-guclu" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(255,235,200,.4);border:2px solid rgba(200,120,40,.2)">
      <div class="st">⚡ KRİTİK UYARILAR — İLİŞKİYİ YÖNETİRKEN</div>
      <div id="t5-dikkat" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:#f8f8ff">
      <div class="st">🌠 UZUN VADELİ UYUM HARİTASI</div>
      <div id="t5-uzunvade" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:#fff8ff;border:2px solid rgba(180,100,200,.15)">
      <div class="st">📅 BU HAFTA İÇİN SOMUT ADIMLAR</div>
      <div id="t5-gunluk" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(230,245,255,.4);border:2px solid rgba(100,160,220,.15)">
      <div class="st">💌 İLK MESAJ & AÇILIŞ STRATEJİSİ</div>
      <div id="t5-ilkmesaj" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(255,240,248,.4);border:2px solid rgba(200,80,140,.15)">
      <div class="st">🎁 HEDİYE, JEST & SÜRPRIZ FİKİRLERİ</div>
      <div id="t5-hediye" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
    <div class="sec" style="background:rgba(255,250,235,.4);border:2px solid rgba(180,150,50,.15)">
      <div class="st">🔮 İKİ KİŞİNİN KARŞILIKLİ DİNAMİĞİ</div>
      <div id="t5-dinamik" style="font-size:13px;line-height:1.9;color:#111"></div>
    </div>
  </div>

</div><!-- rcard -->
</div><!-- result -->

</div><!-- wrap -->

<script>
// ═══ ARKAPLAN (tek instance) ════════════════════════
(function(){
  try {
    var c = document.getElementById("bg");
    if(!c) return;
    var x = c.getContext("2d");
    var W, H, S = [];
    function rsz(){
      W = c.width = window.innerWidth || 360;
      H = c.height = window.innerHeight || 800;
      S = [];
      for(var i = 0; i < 85; i++) {
        S.push({x:Math.random()*W, y:Math.random()*H,
                r:Math.random()*1.2+.2, a:Math.random(),
                da:(Math.random()-.5)*.004});
      }
    }
    rsz();
    window.addEventListener("resize", rsz);
    (function drw(){
      x.clearRect(0,0,W,H);
      S.forEach(function(s){
        s.a = Math.max(.04, Math.min(.86, s.a + s.da));
        if(s.a <= .04 || s.a >= .86) s.da *= -1;
        x.beginPath();
        x.arc(s.x, s.y, s.r, 0, Math.PI*2);
        x.fillStyle = "rgba(255,240,210," + s.a + ")";
        x.fill();
      });
      requestAnimationFrame(drw);
    })();
  } catch(e){ console.warn("bg anim err:", e); }
})();

// ═══ VERİ ════════════════════════════════════════════
var SIGNS = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
var MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
var GLYPHS = {Koç:"♈",Boğa:"♉",İkizler:"♊",Yengeç:"♋",Aslan:"♌",Başak:"♍",Terazi:"♎",Akrep:"♏",Yay:"♐",Oğlak:"♑",Kova:"♒",Balık:"♓"};
var ELEM = {Koç:"Ateş",Aslan:"Ateş",Yay:"Ateş",Boğa:"Toprak",Başak:"Toprak",Oğlak:"Toprak",İkizler:"Hava",Terazi:"Hava",Kova:"Hava",Yengeç:"Su",Akrep:"Su",Balık:"Su"};
var ELSC = {"Ateş-Hava":84,"Hava-Ateş":84,"Toprak-Su":84,"Su-Toprak":84,"Ateş-Su":42,"Su-Ateş":42,"Toprak-Hava":46,"Hava-Toprak":46};
var COMPAT = {
  Koç:{i:["Aslan","Yay","İkizler","Kova"],z:["Yengeç","Oğlak"]},
  Boğa:{i:["Başak","Oğlak","Yengeç","Balık"],z:["Aslan","Kova"]},
  İkizler:{i:["Terazi","Kova","Koç","Aslan"],z:["Başak","Balık"]},
  Yengeç:{i:["Akrep","Balık","Boğa","Başak"],z:["Oğlak","Kova"]},
  Aslan:{i:["Koç","Yay","İkizler","Terazi"],z:["Akrep","Kova"]},
  Başak:{i:["Boğa","Oğlak","Yengeç","Akrep"],z:["Yay","İkizler"]},
  Terazi:{i:["İkizler","Kova","Aslan","Yay"],z:["Koç","Yengeç"]},
  Akrep:{i:["Yengeç","Balık","Oğlak","Başak"],z:["Aslan","Kova"]},
  Yay:{i:["Koç","Aslan","Terazi","Kova"],z:["Başak","İkizler"]},
  Oğlak:{i:["Boğa","Başak","Akrep","Balık"],z:["Koç","Yengeç"]},
  Kova:{i:["İkizler","Terazi","Yay","Koç"],z:["Akrep","Aslan"]},
  Balık:{i:["Yengeç","Akrep","Boğa","Oğlak"],z:["İkizler","Başak"]}
};
var AURA = {
  Koç:{r:"Kırmızı",h:"#ef4444",d:"Güçlü, dinamik, ateşli lider enerjisi"},
  Boğa:{r:"Yeşil",h:"#22c55e",d:"Sakin, besleyici, toprakla bağlantılı"},
  İkizler:{r:"Sarı",h:"#eab308",d:"Parlak, zihinsel, iletişimci"},
  Yengeç:{r:"Gümüş",h:"#94a3b8",d:"Sezgisel, koruyucu, ay enerjisi"},
  Aslan:{r:"Altın",h:"#f59e0b",d:"Karizmatik, sıcak, ışıltılı"},
  Başak:{r:"Lime",h:"#84cc16",d:"Analitik, şifacı, topraklı"},
  Terazi:{r:"Pembe",h:"#ec4899",d:"Zarif, dengeli, aşk enerjisi"},
  Akrep:{r:"Bordo",h:"#9f1239",d:"Dönüştürücü, yoğun, gizemli"},
  Yay:{r:"Mor",h:"#8b5cf6",d:"Özgür, felsefi, genişleyici"},
  Oğlak:{r:"Toprak",h:"#78716c",d:"Disiplinli, güçlü, kararlı"},
  Kova:{r:"Elekt.Mavi",h:"#3b82f6",d:"Vizyoner, özgün, insancıl"},
  Balık:{r:"Turkuaz",h:"#06b6d4",d:"Ruhani, empatik, akışkan"}
};
var CHAKRA_D = [
  {n:"Kök",e:"🔴",c:"#ef4444"},
  {n:"Sakral",e:"🟠",c:"#f97316"},
  {n:"Solar Pleksus",e:"🟡",c:"#eab308"},
  {n:"Kalp",e:"💚",c:"#22c55e"},
  {n:"Boğaz",e:"🔵",c:"#3b82f6"},
  {n:"Üçüncü Göz",e:"🟣",c:"#8b5cf6"},
  {n:"Taç",e:"🤍",c:"#d8b4fe"}
];
var CHMAP = {
  Koç:[85,70,90,60,65,55,50],Boğa:[90,85,65,75,60,55,60],
  İkizler:[60,65,70,65,90,80,70],Yengeç:[70,80,65,90,60,65,75],
  Aslan:[80,75,90,70,70,60,65],Başak:[85,70,75,65,80,75,60],
  Terazi:[65,75,70,85,75,70,75],Akrep:[75,90,70,80,65,85,80],
  Yay:[70,65,85,70,75,65,80],Oğlak:[90,70,80,65,70,60,70],
  Kova:[60,65,70,70,80,90,85],Balık:[65,80,60,90,65,80,90]
};

// P2P karakter verisi
var P2P = {
  Koç:{char:"Ateşin ilk kıvılcımı — Koç, varoluşu bir eylem olarak tanımlar. Düşünmeden önce hisseder, hesaplamadan önce hareket eder. İçinden geçen her şeyi dışarıya taşıyan, filtre kullanmayan bir enerji yapısına sahiptir. Hayat onun için beklenecek değil, fethedilecek bir alandır.",psiko:"İçten güçlü görünme zorunluluğu, zaman zaman gerçek kırılganlığını örter. Sevilmek ve onaylanmak ister ama bunu asla itiraf etmez. Duygusal ihtiyaçlarını saldırganlıkla ya da aşırı bağımsızlıkla maskeleyebilir.",shadow:"Öfkesi çabuk alevlenir ve tahribat bırakır. Başladığı işleri tamamlamakta zorlanır; meşaleler yakar ama bakımını başkasına bırakır. Eleştiriyi kişisel saldırı olarak algılar.",traits:["🔥 Öncü","⚔️ Cesur","⚡ Ani","💪 Güçlü","🏃 Dinamik"],love:"Aşkı yavaş yavaş büyütmez — ya tüm ateşiyle yakar ya da yönünü değiştirir. İlişkide ilk adımı atmak onun doğası; beklemek değil.",str:"Başlangıç enerjisi eşsizdir. Tehlike anında ilk koşan, grubu ilk harekete geçiren odur. Cesareti performatif değil, içgüdüseldir.",attach:"Yalnız durmayı tercih eder ama derin bağlandığında beklenmedik bir sadakat ortaya çıkar."},

  Boğa:{char:"Dünya üzerinde köklenen, varlığını somut şeylerle hisseden bir ruh. Boğa için güzellik, lezzet, dokunuş ve güvenlik soyut kavramlar değil — hayatın kendisidir. Yavaş ısınır, sabırla örülmüş bir dünya kurar ve o dünyadan kolay vazgeçmez.",psiko:"Duygusal dünyası dışarıdan göründüğünden çok daha zengindir. Kelimelerle değil eylemlerle, zamanla değil varlığıyla ifade eder hissettiklerini. Değişime direnç gösterir çünkü istikrar onun için sevginin bir biçimidir.",shadow:"İnat ettiğinde geriye dönmek neredeyse imkânsızdır. Sahiplenme içgüdüsü yüksektir — hem nesnelerde hem ilişkilerde. Öfkesi nadir ama yıkıcıdır.",traits:["🌿 Sakin","💎 Kararlı","🎨 Estetik","🏔️ Güçlü","🌸 Duyusal"],love:"Sevmek onun için bir karar değil bir inşa sürecidir. Günlük küçük ritüellerle, güvenli bir alan yaratarak, kaybolmadan yanında durarak sever.",str:"Bir işe elini attığında bitmeden bırakmaz. Güvenilirliği ve tutarlılığı çevresindeki insanlara zemin sunar.",attach:"Bağlandığı kişiyi kale gibi korur — bazen boğucu, ama her zaman samimi."},

  İkizler:{char:"Tek bir zihin yetmez bu enerjiye — İkizler'in içinde sürekli paralel işlem yapan birden fazla ses vardır. Her konuya farklı açıdan yaklaşır, her insanda farklı bir şey bulur, her gün yeni bir ilgiyle uyanır. Çevresini bir laboratuvar, hayatı ise süregelen bir deney gibi yaşar.",psiko:"Duyguları düşüncelere çevirme eğilimi güçlüdür; ne hissettiğini açıklamak yerine analiz eder. Duygusal yoğunluktan uzaklaşmak için zihne sığınır. İlişkide bağlantı kurabilir ama derinleşmek zaman alır.",shadow:"Verilen söz tutulmayabilir, tutum sabah akşam değişebilir. Yüzeysellik ve güven erozyonu en büyük tehlikesidir. Kaçınma mekanizması olarak espriyi kullanır.",traits:["💨 Çok Yönlü","🧠 Zekî","🗣️ İletişimci","✨ Esprili","🦋 Özgür"],love:"Zihninize hitap etmeden kalbine ulaşamazsınız. Sohbet, fikir çatışması ve sürekli gelişen bir dinamik olmazsa ilgi yavaşça solar.",str:"Uyum sağlama hızı, dil ve anlatı gücü, farklı kesimleri bir araya getirme yeteneği.",attach:"Merakı canlı tutulduğu sürece ilgisi kaybolmaz; ama kafes kurarsanız sessizce kaybolur."},

  Yengeç:{char:"İçi dışına nadiren açılan, ama açıldığında sınırsız bir şefkat kaynağı olan ruh. Yengeç hisseder — sadece kendi duygularını değil, odadaki herkesin taşıdığı ağırlığı da. Ev, aile, kök ve hafıza bu enerji için kutsal kavramlardır.",psiko:"Derin bir terk edilme korkusu taşır, ama bunu nadiren dile getirir. Sevilip sevilmediğini sürekli sınar — bazen sözsüz testler, bazen ani çekilmeler aracılığıyla. Geçmiş yaralar uzun süre canlı kalır.",shadow:"Kendini kapatıp içine çekildiğinde dışarıdan ulaşmak güçtür. Koruyuculuk zamanla kontrol ihtiyacına dönüşebilir. Suçluluk ve öfkeyi aynı anda taşır.",traits:["🌊 Duygusal","🏠 Koruyucu","🌙 Sezgisel","💧 Hassas","🦀 Bağlı"],love:"Güven ve güvenlik hissettiği anda kendini tamamen açar. Sevdiğini besler, korur ve sartlanmadan kabul eder — karşılıklılık bekler ama isteyemez.",str:"Empati kapasitesi, sezgisel zeka, hafıza gücü ve insanlara yuva yaratma becerisi.",attach:"Bir kez bağlandığında bu bağı kolay koparmaz — hem bir güç hem de bir yük olabilir bu."},

  Aslan:{char:"Güneş'in çocuğu — var olmak için değil, parlamak için doğmuş bir enerji. Aslan sahneye çıktığında odanın enerjisi değişir; bu fark edilme isteği ego değil, var oluşun doğal bir ifadesidir. Cömertliği ve sıcaklığı gerçektir, performatif değil.",psiko:"Hayranlık görmek bir lüks değil, duygusal bir ihtiyaçtır. Küçümseme veya görmezden gelinme derin bir yaralanmaya yol açar. Eleştiriyi kişilik saldırısı olarak hisseder.",shadow:"Gururun altında beklenmedik bir hassasiyet yatar. Övgüye muhtaç hale geldiğinde karar alma yetisi sarsılır. Drama eğilimi ve abartı zaman zaman ilişkiyi yorar.",traits:["☀️ Karizmatik","🦁 Güçlü","🎭 İfadeci","💛 Cömert","👑 Lider"],love:"İlişkide sahne ışığını paylaşmak ister — ikisi de parlasın ister, ama spotlight tamamen söndürülürse içi karardığını hisseder.",str:"Liderlik doğallığı, yaratıcı güç, sadakat ve etrafına enerji yayma kapasitesi.",attach:"Bağlandığında büyük bir kalp ortaya çıkar — ama karşılıklı takdir yoksa bu kalp kapılarını yavaşça kapatır."},

  Başak:{char:"Dünyayı olduğu gibi değil, olması gerektiği gibi gören bir zihin. Başak'ın gözünden kaçan detay yok gibidir — bir bakışta ne eksik, ne yanlış, ne düzeltilebilir hepsini hesaplar. Bu keskinlik hem armağanı hem de yüküdür.",psiko:"Kendine en yüksek standardı uygular; bu yüzden iç sesi sürekli eleştiren bir editör gibi çalışır. Değersizlik korkusu 'kullanışlı olmak' üzerinden giderilmeye çalışılır. Hizmet ederek sevilmeye alışmıştır.",shadow:"Mükemmeliyetçilik felç edebilir — başlamamak, bitmemiş görünmekten daha güvenli hissettirdiğinde. Eleştiri alırken savunmacılaşır; verirken dozunu kaçırabilir.",traits:["🔬 Analitik","📋 Düzenli","🌿 Hizmetkâr","💡 Zeki","⚕️ Özenli"],love:"Sevgiyi sözcüklerle değil, 'ilaçlarını aldın mı, yemeğini yedin mi, yorgunsun dinlen' gibi cümlelerle gösterir.",str:"Sistematik düşünce, pratik çözüm üretme, titizlik ve kriz anlarında sakin kalabilme gücü.",attach:"Güvenilirliği tartışılmazdır — ama karşılığında da güvenilir olmak ister, görülmek ve takdir edilmek ister."},

  Terazi:{char:"Denge noktasını arayan, güzelliği hem estetikte hem ilişkilerde zorunluluk olarak gören bir ruh. Terazi çatışmayı sevmez çünkü uyumun nasıl bir şey olduğunu bilir ve onun kırılganlığına saygı duyar. Diplomasi onun için bir beceri değil, doğal bir reflekstir.",psiko:"Başkalarının ihtiyaçlarına öncelik verirken kendi sesini zaman zaman bastırır. Onay almak ve sevilmek çok önemlidir — reddedilme ihtimalinde kararlarını değiştirebilir. Çatışmadan kaçınmak uzun vadede birikmiş öfkeye dönüşebilir.",shadow:"Kararsızlık can sıkıcı boyuta ulaşabilir. Karşısındakini memnun etmek adına gerçek fikirlerini söylemeyebilir. Pasif-agresif örüntüler bazen doğrudan çatışmanın yerini alır.",traits:["⚖️ Dengeli","🌸 Zarif","🕊️ Diplomatik","✨ Estetik","🤝 Uyumlu"],love:"İlişkiyi bir ortaklık olarak görür — adil olmak, güzel anlar yaratmak ve uyumu korumak sevginin temelidir.",str:"Arabuluculuk yeteneği, estetik zekâ, sosyal zekânın yüksekliği ve her iki tarafı da görebilme kapasitesi.",attach:"İlişkiye kendini tam verir; ama kendini kaybetme riski taşır — kim olduğunu koruyarak sevmeyi öğrenmek büyümesidir."},

  Akrep:{char:"Yüzeyin altında akan derin bir nehir. Akrep ne düşündüğünü nadiren ele verir; gözlemler, ölçer, değerlendirir — sonra hareket eder. Gizem onun için bir maske değil, varoluşun kendisidir. Dönüşüm bu enerjinin orta noktasıdır: külden doğmayı bilir.",psiko:"Terk edilme ve ihanet korkusu çok derindir — bu yüzden yakın ilişkilerde sürekli bilinçsiz testler yapar. Güvenildiğinde sınırsız sadakat gösterir; güven kırıldığında kapılar sonsuza kapanabilir.",shadow:"İntikam güdüsü uzun süre yaşar. Takıntı ve kontrol ihtiyacı ilişkileri zehirleyebilir. Öfkesini içinde biriktirerek daha sonra patlar.",traits:["🦂 Yoğun","🌊 Derin","🔮 Gizemli","🔥 Tutkulu","🧲 Magnetik"],love:"Severse ruhunu verir — ama bunu kolay kazanamazsınız. Yüzeysel ilgiye kapıları kapalıdır; ya her şeyi ya da hiçbir şeyi.",str:"Psikolojik keskinlik, dönüşüm kapasitesi, kriz anlarındaki soğukkanlılık ve derin bağ kurma gücü.",attach:"En derin ve en sadık bağlanma biçimini taşır — ama bu bağı korumak da bir sorumluluktur."},

  Yay:{char:"Ufuk her zaman biraz daha uzaktadır — Yay'ın gözleri zaten bir sonraki maceradadır. Özgürlük, anlam ve genişleme bu enerji için oksijen gibidir; bunlar olmadan nefes almak güçleşir. Hayata derin bir merakla, felsefenin ve deneyimin kesişim noktasından bakar.",psiko:"Bağlanmak ister ama 'sıkışmış' hissetmek onun için varoluşsal bir tehdit gibidir. Derinleşmek yerine genişlemeyi tercih eder; bu yüzden ilişkilerde kritik anlar atlanabilir.",shadow:"Taahhütleri gevşek tutma eğilimi güven sorunlarına yol açabilir. Acıyı humor ile geçiştirme refleksi var. Aşırı iyimserlik bazen gerçekçilikten kaçışa dönüşür.",traits:["🏹 Özgür","🌍 Maceraperest","☀️ İyimser","📚 Felsefi","🎯 Odaklı"],love:"Büyüyebileceği, keşfedebileceği ve entelektüel olarak beslenebileceği bir ilişki arar. Kısıtlama hissettiği anda içgüdüsel olarak uzaklaşır.",str:"Vizyon gücü, ilham verme kapasitesi, pozitif enerji ve anlam arayışındaki yorulmaz coşku.",attach:"Özgürlüğüne saygı gösteren, dünyayı onunla birlikte keşfetmek isteyen biriyle derin ve kalıcı bir bağ kurabilir."},

  Oğlak:{char:"Zirveyi hayal etmez — oraya giden yolu hesaplar. Oğlak sabrın, disiplinin ve uzun vadeli düşüncenin somutlaşmış hâlidir. Güç onun için gösteriş değil; güvenilirlik, sorumluluk ve inşa etme kapasitesidir.",psiko:"Duygusal bağımlılığı içten içe reddeder — zayıflık olarak algılar. Başarı ve kontrol duygusal güvensizliği örtmeye yarar. Sevgiyi hak etmek gerektiğine inanır, karşılıksız verilmez.",shadow:"Soğuk görünebilir, ama bu bir maske. İş ve hedef odaklılık ilişkileri ikincil konuma iterek yalnızlaştırabilir. Mükemmeliyetçilik ve katılık değişimi engelleyebilir.",traits:["🏔️ Hırslı","💼 Disiplinli","⏳ Sabırlı","🏗️ İnşacı","🎯 Odaklı"],love:"Sevgiyi söz değil eylemle kanıtlar: orada olur, çözüm üretir, güvenli bir dünya kurar. Romantizm onun için istikrardır.",str:"Uzun vadeli vizyon, kriz anında sabitlik, güvenilirlik ve zorluklara dayanma kapasitesi.",attach:"Bağlandığında bu bağa sonuna kadar sahip çıkar — ama erken aşamada duvarları yıkmak zaman ister."},

  Kova:{char:"Sistemi içinden gözlemler, kalıpları çok öncesinden fark eder ve herkesten farklı bir yol çizer. Kova ne trendy'e ne de norma teslim olur; özgünlük onun için seçim değil, varoluş koşuludur. Bireysel olmakla kolektife ait olmak arasında sürekli dans eder.",psiko:"Duygularını düşünce süzgecinden geçirir — ne hissettiğini analiz eder, ama tam anlamıyla yaşamakta güçlük çekebilir. Yakınlık hem çekici hem de ürkütücüdür; çok yaklaşıldığında geri çekilme refleksi devreye girer.",shadow:"Duygusal mesafeyi özgürlük olarak sunar; ama bu bazen yalnızlığın rasyonalizasyonudur. Alışılmış kalıplara karşı durmak bir noktada karşı durmak için karşı durmaya dönüşebilir.",traits:["🌊 Vizyoner","⚡ Özgün","🤝 İnsancıl","🧊 Bağımsız","🔭 İlerici"],love:"Önce zihne ulaşmak gerekir — kalbi ancak oradan açılır. Özgürlüğüne saygı duyan, zihnini uyarabilecek, büyümesine alan tanıyan biriyle derin bağ mümkündür.",str:"Sistematik ve bağımsız düşünce, geleceği okuma kapasitesi, insanlığa duyduğu içten ilgi ve özgün vizyon.",attach:"Mesafeyi koruyarak bağlanır — ama bu bağ, önyargısız ve özgür bırakıldığında çok sağlam bir hal alır."},

  Balık:{char:"İki dünya arasında — görünür olan ve görünmeyenin arasında — yaşayan bir ruh. Balık'ın sezgisi kelimelerle değil imgelerle, rüyalarla ve hislerle gelir. Empati kapasitesi o kadar geniştir ki bazen kimin hissini taşıdığını kendisi de bilmez.",psiko:"Sınır koymak varoluşsal bir çatışma gibi hissettirdiğinden hep biraz geride durur. Kurtarmak ve iyileştirmek bir sevgi dili haline gelir; ama bu rol uzun vadede tükenmişliğe taşır.",shadow:"Gerçeklikten kaçış eğilimi güçlüdür — hayal dünyası bir sığınak olabilir. Kurban rolüne bürünme ve sorumluluktan kaçmak gölge tarafındaki temalar arasındadır.",traits:["🌊 Empatik","🎨 Yaratıcı","🔮 Sezgisel","🐠 Hassas","✨ Ruhani"],love:"Aşkı sonsuz ve koşulsuz yaşar — ama bu sefer kendi ihtiyaçlarını da görmesi gerekir. Ruhsal bağlantı olmadan yüzeysel ilişki onu beslemez.",str:"Empati ve sezgi derinliği, sanatsal yaratıcılık, şefkat kapasitesi ve spiritüel açıklık.",attach:"Kendini tamamen verir; ama karşılıksız aşkta çözülebileceğini de bilmesi gerekir."}
};

// Global değişkenler
var GH1 = "#3b82f6", GH2 = "#9b7fd4";
var chartsDrawn = false, pendingCharts = null;
var photos = {};

// ═══ YARDIMCI FONKSİYONLAR ════════════════════════
function getSun(d, m) {
  d = +d; m = +m;
  var t = [
    ["Koç",3,21,4,19],["Boğa",4,20,5,20],["İkizler",5,21,6,20],
    ["Yengeç",6,21,7,22],["Aslan",7,23,8,22],["Başak",8,23,9,22],
    ["Terazi",9,23,10,22],["Akrep",10,23,11,21],["Yay",11,22,12,21],
    ["Oğlak",12,22,1,19],["Kova",1,20,2,18],["Balık",2,19,3,20]
  ];
  for(var i=0; i<t.length; i++){
    var s=t[i][0],sm=t[i][1],sd=t[i][2],em=t[i][3],ed=t[i][4];
    if(sm===em){ if(m===sm&&d>=sd&&d<=ed) return s; }
    else if(m===sm&&d>=sd) return s;
    else if(m===em&&d<=ed) return s;
  }
  return "Kova";
}

function toggleWeb() {
  var cb = document.getElementById("webToggle");
  var tr = document.getElementById("webTrack");
  var th = document.getElementById("webThumb");
  var lb = document.getElementById("webToggleLabel");
  if(cb.checked) {
    tr.style.background = "#d4af6e";
    th.style.transform = "translateX(20px)";
    lb.textContent = "Açık — Web profil araştırması aktif";
  } else {
    tr.style.background = "rgba(200,170,130,.3)";
    th.style.transform = "translateX(0)";
    lb.textContent = "Kapalı — Sadece astroloji analizi";
  }
}

function isWebEnabled() {
  return document.getElementById("webToggle").checked;
}

// ── BACKEND MODU — kullanıcıdan API key istenmez ──
var BACKEND_URL = (window.location.hostname === "kozmik-backend.onrender.com" || window.location.hostname === "localhost") ? "" : "https://kozmik-backend.onrender.com";
var APP_TOKEN   = "kozmik-secret-2025";

function saveKey(){}
function toggleKey(){}
function getKey(){ return "backend"; }

async function geocodeCity(city) {
  try {
    const r = await fetch(BACKEND_URL+"/api/geocode",{
      method:"POST",headers:{"Content-Type":"application/json","x-app-token":APP_TOKEN},
      body:JSON.stringify({city})
    });
    return await r.json();
  } catch(e){ return {found:false,lat:41.0082,lon:28.9784,tz:"Europe/Istanbul"}; }
}

async function getNatalChart(params) {
  try {
    const r = await fetch(BACKEND_URL+"/api/natal",{
      method:"POST",headers:{"Content-Type":"application/json","x-app-token":APP_TOKEN},
      body:JSON.stringify(params)
    });
    return await r.json();
  } catch(e){ return null; }
}

async function getSynastryData(p1, p2) {
  try {
    const r = await fetch(BACKEND_URL+"/api/synastry",{
      method:"POST",headers:{"Content-Type":"application/json","x-app-token":APP_TOKEN},
      body:JSON.stringify({p1,p2})
    });
    return await r.json();
  } catch(e){ return null; }
}

// ── RGB Histogram → Aura Rengi ──────────────────────────
function rgbToHex(r,g,b){return "#"+[r,g,b].map(function(x){return Math.round(x).toString(16).padStart(2,"0");}).join("");}
function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h2,s2,l2=(mx+mn)/2;if(mx===mn){h2=s2=0;}else{var d=mx-mn;s2=l2>0.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h2=(g-b)/d+(g<b?6:0);break;case g:h2=(b-r)/d+2;break;default:h2=(r-g)/d+4;}h2/=6;}return[Math.round(h2*360),Math.round(s2*100),Math.round(l2*100)];}
function hslToRgb(h2,s2,l2){s2/=100;l2/=100;var k=function(n){return(n+h2/30)%12;};var a=s2*Math.min(l2,1-l2);var f=function(n){return l2-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));};return[Math.round(f(0)*255),Math.round(f(8)*255),Math.round(f(4)*255)];}

function getAuraFromPixels(imageData) {
  var data=imageData.data,n=data.length/4,rSum=0,gSum=0,bSum=0,cnt=0;
  for(var i=0;i<n;i++){
    var r=data[i*4],g=data[i*4+1],b=data[i*4+2],br=(r+g+b)/3;
    if(br>230||br<15) continue;
    rSum+=r;gSum+=g;bSum+=b;cnt++;
  }
  if(cnt<50) return null;
  var hsl=rgbToHsl(rSum/cnt,gSum/cnt,bSum/cnt);
  var h2=hsl[0],s2=hsl[1],l2=hsl[2];
  var aRGB=hslToRgb(h2,Math.min(100,s2+30),Math.min(72,Math.max(42,l2)));
  var hex=rgbToHex(aRGB[0],aRGB[1],aRGB[2]);
  var renk=h2<15||h2>=345?"Kırmızı":h2<45?"Turuncu":h2<70?"Sarı":h2<150?"Yeşil":h2<195?"Turkuaz":h2<260?"Mavi":h2<290?"Mor":h2<325?"Pembe":"Kırmızı";
  var titresim=s2>70?"Yüksek":s2>45?"Orta-Yüksek":s2>25?"Orta":"Düşük-Orta";
  return {hex:hex,renk:renk,titresim:titresim};
}

var photoAura={};

function loadPhoto(slot, inp) {
  var f = inp.files && inp.files[0];
  if(!f) return;
  var prvEl = document.getElementById("prv" + slot);
  if(prvEl) prvEl.style.display = "block";
  var img = new Image(), url = URL.createObjectURL(f);
  img.onload = function() {
    var MAX=600,w=img.width,hh=img.height;
    if(w>MAX||hh>MAX){if(w>hh){hh=Math.round(hh*MAX/w);w=MAX;}else{w=Math.round(w*MAX/hh);hh=MAX;}}
    var cv=document.createElement("canvas");
    cv.width=w;cv.height=hh;
    var ctx2=cv.getContext("2d");
    ctx2.drawImage(img,0,0,w,hh);
    photos[slot]=cv.toDataURL("image/jpeg",0.85);
    URL.revokeObjectURL(url);
    // RGB Histogram aura analizi
    var aura=null;
    try{
      var mx=Math.round(w*0.2),my=Math.round(hh*0.1),mw=Math.round(w*0.6),mhh=Math.round(hh*0.8);
      aura=getAuraFromPixels(ctx2.getImageData(mx,my,mw,mhh));
      if(aura) photoAura[slot]=aura;
    }catch(e){}
    var auraBadge=aura?'<div style="position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,.65);border-radius:8px;padding:3px 7px;display:flex;align-items:center;gap:5px"><div style="width:10px;height:10px;border-radius:50%;background:'+aura.hex+';box-shadow:0 0 6px '+aura.hex+'"></div><span style="font-size:10px;color:#fff;font-weight:700">'+aura.renk+' Aura</span></div>':"";
    if(prvEl){
      prvEl.innerHTML='<img src="'+photos[slot]+'" style="width:100%;height:100%;object-fit:cover;border-radius:9px"/>'+
        '<button onclick="delPhoto(\\''+slot+'\\')" style="position:absolute;top:3px;right:3px;background:#c00;color:#fff;border:none;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:12px;line-height:1">×</button>'+
        auraBadge;
    }
  };
  img.src = url;
}

function delPhoto(slot) {
  photos[slot] = null;
  delete photoAura[slot];
  var prvEl = document.getElementById("prv" + slot);
  if(prvEl) { prvEl.innerHTML = ""; prvEl.style.display = "none"; }
}

function suUpd1() {
  var d=document.getElementById("dy1"),m=document.getElementById("mo1");
  if(!d||!m||!d.value||!m.value) return;
  var sun1=getSun(d.value,m.value);
  var el=document.getElementById("snbdg1");
  if(el){el.textContent="☀️ "+sun1;el.style.display="block";}
}
function suUpd() {
  var d = document.getElementById("dy2").value;
  var m = document.getElementById("mo2").value;
  var el = document.getElementById("snbdg");
  if(d && m) { el.style.display = "block"; el.textContent = "☀️ " + getSun(d, m); }
  else el.style.display = "none";
}

function elSc(a, b) {
  if(a === b) return 88;
  return ELSC[a + "-" + b] || 62;
}

function srd(s, a, b) {
  var x = Math.sin(s + 1.618) * 9999;
  return a + Math.floor((x - Math.floor(x)) * (b - a + 1));
}

function sw(i) {
  document.querySelectorAll(".tab").forEach(function(t, j){ t.classList.toggle("act", i===j); });
  document.querySelectorAll(".tpanel").forEach(function(p, j){ p.classList.toggle("act", i===j); });
  if(i === 3 && !chartsDrawn && pendingCharts) {
    setTimeout(function(){
      drawAstroChart("astroC1", pendingCharts.c1);
      drawAstroChart("astroC2", pendingCharts.c2);
      chartsDrawn = true;
    }, 100);
  }
  // Chart.js grafiklerini tab açılışında yeniden çiz
  if(pendingCharts) {
    setTimeout(function(){
      if(typeof Chart==='undefined') return;
      if(i===0) drawRadar("radarC", pendingCharts.radar||{lbl:[],v1:[],v2:[]});
      if(i===0) drawChakraComp("chkComp", pendingCharts.c1||[], pendingCharts.c2||[], pendingCharts.cComp||[]);
      if(i===1) drawChakraSolo("chk1C", pendingCharts.c1||[], GH1);
      if(i===2) drawChakraSolo("chk2C", pendingCharts.c2||[], GH2);
    }, 150);
  }
}

function safe(id, prop, val) {
  var el = document.getElementById(id);
  if(!el) return;
  if(Array.isArray(val)) val = val.join("");
  if(prop === "text") el.textContent = val;
  else if(prop === "html") el.innerHTML = val;
  else if(prop === "display") el.style.display = val;
  else el[prop] = val;
}

function dbg(m) {
  console.log("[KUA]", m);
  var de = document.getElementById("dbgEl");
  if(de) { de.innerHTML += "<div style='margin:2px 0'>" + String(m) + "</div>"; de.style.display = "block"; de.scrollTop = de.scrollHeight; }
}

// ═══ JULIAN DAY & GEZEGEN HESAPLARI ══════════════
function julianDay(year, month, day, hour) {
  if(month <= 2) { year -= 1; month += 12; }
  var A = Math.floor(year/100);
  var B = 2 - A + Math.floor(A/4);
  return Math.floor(365.25*(year+4716)) + Math.floor(30.6001*(month+1)) + day + hour/24 + B - 1524.5;
}

function jd2sign(lon) {
  var deg = ((lon % 360) + 360) % 360;
  return SIGNS[Math.floor(deg/30)];
}

function calcPlanets(year, month, day, hour) {
  var jd = julianDay(year, month, day, hour || 12);
  var T = (jd - 2451545.0) / 36525.0;
  var L0 = 280.46646 + 36000.76983*T;
  var M = 357.52911 + 35999.05029*T - 0.0001537*T*T;
  var Mrad = M * Math.PI/180;
  var C = (1.914602-0.004817*T-0.000014*T*T)*Math.sin(Mrad)
        + (0.019993-0.000101*T)*Math.sin(2*Mrad)
        + 0.000289*Math.sin(3*Mrad);
  var sunLon = ((L0+C) % 360 + 360) % 360;
  var Lm = 218.3164477 + 481267.88123421*T;
  var D = 297.8501921 + 445267.1114034*T;
  var Mm = 134.9633964 + 477198.8675055*T;
  var F = 93.2720950 + 483202.0175233*T;
  var moonLon = ((Lm
    + 6.288774*Math.sin(Mm*Math.PI/180)
    + 1.274027*Math.sin((2*D-Mm)*Math.PI/180)
    + 0.658314*Math.sin(2*D*Math.PI/180)
    + 0.213618*Math.sin(2*Mm*Math.PI/180)
    - 0.185116*Math.sin(M*Math.PI/180)
    - 0.114332*Math.sin(2*F*Math.PI/180)) % 360 + 360) % 360;
  var mercLon = (((252.250906 + 149474.0722491*T) % 360) + 360) % 360;
  var venLon  = (((181.979801 + 58519.2130302*T) % 360) + 360) % 360;
  var marLon  = (((355.433275 + 19141.6964746*T) % 360) + 360) % 360;
  var jupLon  = (((34.351519  + 3036.3027748*T)  % 360) + 360) % 360;
  var satLon  = (((50.077444  + 1223.5110686*T)  % 360) + 360) % 360;
  var uraLon  = (((314.055005 + 429.8640561*T)   % 360) + 360) % 360;
  var nepLon  = (((304.348665 + 219.8997012*T)   % 360) + 360) % 360;
  return {
    sun:     jd2sign(sunLon),  moon:    jd2sign(moonLon),
    mercury: jd2sign(mercLon), venus:   jd2sign(venLon),
    mars:    jd2sign(marLon),  jupiter: jd2sign(jupLon),
    saturn:  jd2sign(satLon),  uranus:  jd2sign(uraLon),
    neptune: jd2sign(nepLon),
    rawLons: {sun:sunLon,moon:moonLon,mercury:mercLon,venus:venLon,
              mars:marLon,jupiter:jupLon,saturn:satLon,uranus:uraLon,neptune:nepLon}
  };
}

function getTodayPlanets() {
  var now = new Date();
  return calcPlanets(now.getFullYear(), now.getMonth()+1, now.getDate(), now.getHours());
}

function calcTransitAspects(natal, transit) {
  var planets = ['sun','moon','mercury','venus','mars','jupiter','saturn'];
  var aspects = [];
  var ASPECT_TYPES = [
    {name:'Kavuşum',deg:0,orb:8,symbol:'☌',type:'güçlü'},
    {name:'Sextil',deg:60,orb:5,symbol:'⚹',type:'uyumlu'},
    {name:'Kare',deg:90,orb:7,symbol:'□',type:'zorlu'},
    {name:'Üçgen',deg:120,orb:7,symbol:'△',type:'uyumlu'},
    {name:'Karşıt',deg:180,orb:8,symbol:'☍',type:'gerilim'}
  ];
  planets.forEach(function(tp){
    planets.forEach(function(np){
      if(!transit.rawLons || !natal.rawLons) return;
      var tlon = transit.rawLons[tp], nlon = natal.rawLons[np];
      if(tlon===undefined || nlon===undefined) return;
      var diff = Math.abs(tlon-nlon) % 360;
      if(diff > 180) diff = 360-diff;
      ASPECT_TYPES.forEach(function(asp){
        if(Math.abs(diff-asp.deg) <= asp.orb) {
          aspects.push({transit:tp,natal:np,aspect:asp.name,
            symbol:asp.symbol,type:asp.type,orb:Math.abs(diff-asp.deg).toFixed(1)});
        }
      });
    });
  });
  return aspects.slice(0,8);
}

// ═══ HESAP ════════════════════════════════════════
function compute(d2, m2, y2, ri2, sun2, hour1, hour2, k1y, k1m, k1d, k1rising, k1sun) {
  var el1 = ELEM[k1sun||"Kova"]||"Hava", el2 = ELEM[sun2] || "Hava";
  var re1 = ELEM[k1rising||"Oğlak"]||"Toprak", re2 = ELEM[ri2||sun2] || el2;
  var seed = 10*2 + (+d2)*(+m2) + 23;
  var cp = COMPAT[k1sun||"Kova"] || {i:[],z:[]};
  var sunSc;
  if(cp.i.includes(sun2)) sunSc = srd(seed, 76, 92);
  else if(cp.z.includes(sun2)) sunSc = srd(seed+1, 34, 52);
  else sunSc = srd(seed+2, 54, 72);
  var eS = elSc(el1, el2), rS = elSc(re1, re2);
  var score = Math.min(99, Math.max(22, Math.round(sunSc*.38 + eS*.28 + rS*.22 + srd(seed+5,-2,4)*.12)));
  var c1 = CHMAP[k1sun||"Kova"]||CHMAP["Kova"], c2 = CHMAP[sun2] || CHMAP["Kova"];
  var cComp = c1.map(function(v,i){ return Math.min(99,Math.max(25,Math.round((v+c2[i])/2+srd(seed+i*7,-9,9)))); });
  var e1 = {freq:c1[5],vib:c1[2],mag:c1[3],bal:c1[0]};
  var e2 = {freq:c2[5],vib:c2[2],mag:c2[3],bal:c2[0]};
  var eC = {
    freq:Math.min(99,Math.round((eS+sunSc)/2+srd(seed+10,-5,5))),
    vib:Math.min(99,Math.round((eS+rS)/2+srd(seed+11,-5,5))),
    mag:Math.min(99,Math.round(score+srd(seed+12,-8,8))),
    bal:Math.min(99,Math.round((rS+eS)/2+srd(seed+13,-5,5)))
  };
  function ap(s, off){ return SIGNS[(SIGNS.indexOf(s)+off+12)%12]; }
  var today = new Date();
  var todayP = getTodayPlanets();
  var birthP1 = calcPlanets(k1y||1967, k1m||2, k1d||10, (typeof hour1!=="undefined"&&hour1!=="")?hour1:12);
  var birthY2 = parseInt(y2)||1990;
  var birthP2 = calcPlanets(birthY2, parseInt(m2)||6, parseInt(d2)||15, (typeof hour2!=="undefined"&&hour2!=="")?hour2:12);
  var cd1 = {
    sun:k1sun||"Kova", rising:k1rising||"Oğlak",
    moon:birthP1.moon, mercury:birthP1.mercury, venus:birthP1.venus,
    mars:birthP1.mars, jupiter:birthP1.jupiter, saturn:birthP1.saturn,
    elem:el1, rawLons:birthP1.rawLons
  };
  var cd2 = {
    sun:sun2, rising:ri2||sun2,
    moon:birthP2.moon, mercury:birthP2.mercury, venus:birthP2.venus,
    mars:birthP2.mars, jupiter:birthP2.jupiter, saturn:birthP2.saturn,
    elem:el2, rawLons:birthP2.rawLons
  };
  var radar = {
    lbl:["Aşk","Ruh","Zihin","Tutku","Güven","İletişim"],
    v1:[sunSc,Math.round(eS*.9+5),Math.round(rS*.8+10),c1[2],c1[0],c1[4]].map(function(v){ return Math.min(99,v); }),
    v2:[sunSc,Math.round(eS*.85+8),Math.round(rS*.75+12),c2[2],c2[0],c2[4]].map(function(v){ return Math.min(99,v); })
  };
  var transitAsp1 = calcTransitAspects(birthP1, todayP);
  var transitAsp2 = calcTransitAspects(birthP2, todayP);
  var todayDate = today.toLocaleDateString("tr-TR",{day:"numeric",month:"long",year:"numeric"});
  return {
    score, sun2, el1, el2, c1, c2, cComp, e1, e2, eC, sunSc, eS, rS,
    cd1, cd2, radar, todayP, transitAsp1, transitAsp2, todayDate, birthP1, birthP2,
    synastry: calcSynastry(birthP1, birthP2, cd1, cd2, sun2, ri2, el1, el2)
  };
}

// ═══ API ÇAĞRISI ═════════════════════════════════
function apiCall(bodyStr, key) {
  return fetch(BACKEND_URL+"/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json","x-app-token":APP_TOKEN},
    body: bodyStr
  }).then(function(r){ return r.text(); });
}

// ═══ ANA ANALİZ ══════════════════════════════════
async function analyze() {
  var err = document.getElementById("err");
  var d2 = document.getElementById("dy2").value;
  var m2 = document.getElementById("mo2").value;
  if(!d2 || !m2) {
    err.textContent = "⚠ Lütfen 2. kişinin doğum gün ve ayını girin.";
    err.style.display = "block";
    return;
  }
  err.style.display = "none"; err.textContent = "";
  var dbgEl=document.getElementById("dbgEl"); if(dbgEl){dbgEl.innerHTML="";dbgEl.style.display="block";}
  dbg("▶ Analiz başladı — backend: "+BACKEND_URL);
  dbg("_hasKey: "+_hasKey);

  var _key = "backend";
  var _hasKey = true;
  dbg("_hasKey: "+_hasKey+" | sun1: "+(typeof sun1 !== "undefined" ? sun1 : "TANIMSIZ"));

  document.getElementById("abtn").disabled = true;

  var nm1 = (document.getElementById("nm1").value || "").trim() || "";
  // K1 form verileri
  var dy1v = document.getElementById("dy1") ? document.getElementById("dy1").value : "";
  var mo1v = document.getElementById("mo1") ? document.getElementById("mo1").value : "";
  var yr1v = document.getElementById("yr1") ? document.getElementById("yr1").value : "";
  var ri1v = document.getElementById("ri1") ? document.getElementById("ri1").value : "Oğlak";
  // K1 güneş burcu hesapla
  var sun1 = (dy1v && mo1v) ? getSun(dy1v, mo1v) : "Kova";
  // K1 doğum yılı/ay/gün
  var k1BirthY = parseInt(yr1v)||1967, k1BirthM = parseInt(mo1v)||2, k1BirthD = parseInt(dy1v)||10;
  var nm2 = (document.getElementById("nm2").value || "").trim() || "2. Kişi";
  var ri2  = document.getElementById("ri2").value;
  var y2   = document.getElementById("yr2").value;
  var h2   = document.getElementById("hr2").value;
  var mn2v = document.getElementById("mn2").value;
  var h1   = document.getElementById("hr1") ? document.getElementById("hr1").value : "";
  var mn1v = document.getElementById("mn1") ? document.getElementById("mn1").value : "";
  var loc2 = document.getElementById("loc2").value.trim();
  var loc1 = document.getElementById("loc1") ? document.getElementById("loc1").value.trim() : "";
  var sun2 = getSun(d2, m2);
  // Saat hesapla (girilmemişse 12:00 varsayımı)
  var hour1 = h1 !== "" ? (parseInt(h1) + (mn1v !== "" ? parseInt(mn1v)/60 : 0)) : 12;
  var hour2 = h2 !== "" ? (parseInt(h2) + (mn2v !== "" ? parseInt(mn2v)/60 : 0)) : 12;

  showLov(true, "Kozmik bağlantı kuruluyor...");

  var loc;
  try { loc = compute(d2, m2, y2, ri2, sun2, hour1, hour2, k1BirthY, k1BirthM, k1BirthD, ri1v||"Oğlak", sun1); }
  catch(ce) {
    err.textContent = "Hesaplama hatası: " + ce.message;
    err.style.display = "block";
    showLov(false); document.getElementById("abtn").disabled = false; return;
  }

  var ai = {};
  photoAura = {}; // Yeni analiz — önceki aura verilerini sıfırla

  // ── Astrologer API — Gerçek doğum haritası verileri ──
  if(loc1 || loc2 || h1 !== "" || h2 !== "") {
    updStep("Doğum haritaları hesaplanıyor...");
    try {
      // Koordinatları al
      var geo1 = loc1 ? await geocodeCity(loc1) : {lat:41.0082,lon:28.9784,tz:"Europe/Istanbul"};
      var geo2 = loc2 ? await geocodeCity(loc2) : {lat:41.0082,lon:28.9784,tz:"Europe/Istanbul"};

      // K1 natal harita (sabit: 10 Şubat 1967)
      var k1hr = Math.floor(hour1), k1mn = Math.round((hour1%1)*60);
      // K1 form değerlerini oku (eğer varsa)
      var k1y = 1967, k1m = 2, k1d = 10; // Varsayılan
      var k1YrEl = document.getElementById("yr1");
      var k1MoEl = document.getElementById("mo1"); 
      var k1DyEl = document.getElementById("dy1");
      if(k1YrEl && k1YrEl.value) k1y = parseInt(k1YrEl.value);
      if(k1MoEl && k1MoEl.value) k1m = parseInt(k1MoEl.value);
      if(k1DyEl && k1DyEl.value) k1d = parseInt(k1DyEl.value);
      
      var natal1Data = await getNatalChart({
        name: nm1||"Kişi 1",
        year:k1y, month:k1m, day:k1d,
        hour:k1hr, minute:k1mn,
        lat:geo1.lat, lon:geo1.lon, tz:geo1.tz
      });

      // K2 natal harita
      var k2hr = Math.floor(hour2), k2mn = Math.round((hour2%1)*60);
      var natal2Data = await getNatalChart({
        name: nm2||"Kişi 2",
        year:parseInt(y2)||1990, month:parseInt(m2)||6, day:parseInt(d2)||15,
        hour:k2hr, minute:k2mn,
        lat:geo2.lat, lon:geo2.lon, tz:geo2.tz
      });

      // Verileri loc'a entegre et
      if(natal1Data && natal1Data.chart_data && natal1Data.chart_data.subject) {
        var s1 = natal1Data.chart_data.subject;
        var SIGN_MAP = {"Ari":"Koç","Tau":"Boğa","Gem":"İkizler","Can":"Yengeç",
          "Leo":"Aslan","Vir":"Başak","Lib":"Terazi","Sco":"Akrep",
          "Sag":"Yay","Cap":"Oğlak","Aqu":"Kova","Pis":"Balık"};
        function mapSign(s){ return SIGN_MAP[s] || SIGN_MAP[(s||"").substring(0,3)] || s; }
        // Gezegen override
        if(s1.moon) loc.cd1.moon = mapSign(s1.moon.sign);
        if(s1.mercury) loc.cd1.mercury = mapSign(s1.mercury.sign);
        if(s1.venus) loc.cd1.venus = mapSign(s1.venus.sign);
        if(s1.mars) loc.cd1.mars = mapSign(s1.mars.sign);
        if(s1.jupiter) loc.cd1.jupiter = mapSign(s1.jupiter.sign);
        if(s1.saturn) loc.cd1.saturn = mapSign(s1.saturn.sign);
        // Yükselen
        if(s1.ascendant && h1 !== "") {
          var calcRising = mapSign(s1.ascendant.sign);
          loc.cd1.rising = calcRising;
          dbg("K1 Yükselen hesaplandı: " + calcRising);
        }
        dbg("K1 natal güncellendi: Ay="+loc.cd1.moon+" Venüs="+loc.cd1.venus);
      }

      if(natal2Data && natal2Data.chart_data && natal2Data.chart_data.subject) {
        var s2 = natal2Data.chart_data.subject;
        function mapSign2(s){ return SIGN_MAP[s] || SIGN_MAP[(s||"").substring(0,3)] || s; }
        if(s2.moon) loc.cd2.moon = mapSign2(s2.moon.sign);
        if(s2.mercury) loc.cd2.mercury = mapSign2(s2.mercury.sign);
        if(s2.venus) loc.cd2.venus = mapSign2(s2.venus.sign);
        if(s2.mars) loc.cd2.mars = mapSign2(s2.mars.sign);
        if(s2.jupiter) loc.cd2.jupiter = mapSign2(s2.jupiter.sign);
        if(s2.saturn) loc.cd2.saturn = mapSign2(s2.saturn.sign);
        // Yükselen otomatik hesapla
        if(s2.ascendant && h2 !== "") {
          var calcRising2 = mapSign2(s2.ascendant.sign);
          loc.cd2.rising = calcRising2;
          // ri2 display güncelle
          ri2 = calcRising2;
          var riEl = document.getElementById("ri2");
          if(riEl) riEl.value = calcRising2;
          dbg("K2 Yükselen otomatik: " + calcRising2);
        }
        dbg("K2 natal güncellendi: Ay="+loc.cd2.moon+" Venüs="+loc.cd2.venus);
      }

      // Natal açıları ve sinastri yeniden hesapla
      if(natal1Data || natal2Data) {
        updStep("Sinastri açıları hesaplanıyor...");
      }
    } catch(astroErr) {
      dbg("Astrologer API hatası: " + astroErr.message + " — dahili hesaplama devam ediyor");
    }
  }

  // ── Foto analizi: key gerekli, fotoğraf varsa çalışır ──
  var hasFoto1 = !!(photos["1a"] || photos["1b"]);
  var hasFoto2 = !!(photos["2a"] || photos["2b"]);

  if(_hasKey && (hasFoto1 || hasFoto2)) {
    updStep("Fotoğraflar analiz ediliyor...");
    try {
      function buildFotoMsgs(slots, kisiAciklama) {
        var msgs = [];
        slots.forEach(function(slot){
          if(!photos[slot]) return;
          var b = photos[slot], idx = b.indexOf(","), b64 = idx>=0?b.substring(idx+1):b;
          var mime = (b.match(/^data:([^;]+);/)||[])[1]||"image/jpeg";
          msgs.push({type:"image",source:{type:"base64",media_type:mime,data:b64}});
        });
        msgs.push({type:"text", text:
          "SADECE JSON yanıt ver — markdown veya kod bloğu kullanma.\\n\\n"+
          "Fotoğraftaki kişi: "+kisiAciklama+"\\n\\n"+
          "Yüz hatları, göz ifadesi, beden dili, enerji alanı, çakra durumu ve spiritüel seviyeyi oku.\\n"+
          "Her metin alanı 3-4 cümle olsun. Türkçe. Spesifik ve derin ol.\\n\\n"+
          '{"karakter":"","psikoloji":"","chakra_aura":"","spirituel":"","guclu":"","gizli":"",'+
          '"iliski_stili":"","aura_renk":"","aura_hex":"","titresim_seviye":"",'+
          '"en_aktif_chakra":"","bloke_chakra":"","karizma_notu":""}'
        });
        return msgs;
      }

      function parseFotoRaw(raw) {
        try {
          var d = JSON.parse(raw);
          if(d.error) { dbg("Foto API err: "+(d.error.message||"")); return null; }
          var t = (d.content||[]).map(function(x){return x.text||"";}).join("").trim();
          t = t.replace(/^\`\`\`[a-z]*\\n?/,"").replace(/\\n?\`\`\`$/,"").trim();
          var s = t.indexOf("{"), e = t.lastIndexOf("}");
          if(s<0||e<=s) { dbg("Foto JSON sınır yok: "+t.substring(0,100)); return null; }
          var p = JSON.parse(t.substring(s,e+1));
          return (p && typeof p.karakter!=="undefined") ? p : null;
        } catch(ex) { dbg("Foto parse ex: "+ex.message); return null; }
      }

      var FOTO_SYS = "Sen ileri düzey spiritüel analist, aura okuyucusu ve psikolog-astrologsun. Fotoğraftaki kişiyi çok detaylı analiz ediyorsun: yüz hatları, göz ifadesi, duruş, beden dili, enerji alanı, çakra durumu, aura rengi ve spiritüel seviye. Her alanı derinlemesine ve özgün biçimde yorumluyorsun. SADECE geçerli JSON döndürüyorsun — başka hiçbir açıklama veya markdown kullanmıyorsun.";

      function buildFotoPrompt(kisiAciklama) {
        return "SADECE JSON yanıt ver — başka hiçbir şey yazma.\\n\\n"+
          "Fotoğraftaki kişi: "+kisiAciklama+"\\n\\n"+
          "Bu kişiyi şu açılardan analiz et:\\n"+
          "- Yüz hatları, göz ifadesi, bakış derinliği, çene/alın yapısı\\n"+
          "- Beden dili: omuz pozisyonu, duruş, açıklık/kapalılık\\n"+
          "- Enerji alanı: genel titreşim, canlılık, güç merkezi\\n"+
          "- Aura rengi ve yoğunluğu\\n"+
          "- Çakra durumu: hangileri aktif, hangisi kısıtlı\\n"+
          "- Spiritüel seviye: farkındalık, ruhsal derinlik\\n\\n"+
          "Her metin alanını 3-4 özgün, spesifik cümle ile doldur. Türkçe.\\n\\n"+
          '{"karakter":"","psikoloji":"","chakra_aura":"","spirituel":"","guclu":"","gizli":"","iliski_stili":"","aura_renk":"","aura_hex":"","titresim_seviye":"","en_aktif_chakra":"","bloke_chakra":"","karizma_notu":""}';
      }

      var fotoPromises = [];

      if(hasFoto1) {
        var p1Aciklama = "1. kişi — Kova güneş, Oğlak yükselen"+(nm1?", "+nm1:"");
        var p1Msgs = buildFotoMsgs(["1a","1b"], p1Aciklama);
        p1Msgs[p1Msgs.length-1] = {type:"text", text: buildFotoPrompt(p1Aciklama)};
        var p1Body = JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:2500,
          system:FOTO_SYS, messages:[{role:"user",content:p1Msgs}]});
        fotoPromises.push(apiCall(p1Body, _key).then(parseFotoRaw).catch(function(e){ dbg("P1 foto err:"+e.message); return null; }));
      } else {
        fotoPromises.push(Promise.resolve(null));
      }

      if(hasFoto2) {
        var p2Aciklama = "2. kişi — "+sun2+" güneş"+(ri2?", "+ri2+" yükselen":"")+(nm2&&nm2!=="2. Kişi"?", "+nm2:"");
        var p2Msgs = buildFotoMsgs(["2a","2b"], p2Aciklama);
        p2Msgs[p2Msgs.length-1] = {type:"text", text: buildFotoPrompt(p2Aciklama)};
        var p2Body = JSON.stringify({model:"claude-sonnet-4-20250514", max_tokens:2500,
          system:FOTO_SYS, messages:[{role:"user",content:p2Msgs}]});
        fotoPromises.push(apiCall(p2Body, _key).then(parseFotoRaw).catch(function(e){ dbg("P2 foto err:"+e.message); return null; }));
      } else {
        fotoPromises.push(Promise.resolve(null));
      }

      var fotoResults = await Promise.all(fotoPromises);
      var r1 = fotoResults[0], r2 = fotoResults[1];

      if(r1||r2) {
        ai.foto = { k1: r1||{}, k2: r2||{} };
        dbg("Foto OK. k1="+(r1?"✓ karakter="+((r1.karakter||"").substring(0,60)):"—")+" | k2="+(r2?"✓ karakter="+((r2.karakter||"").substring(0,60)):"—"));
        updStep("✅ Fotoğraf analizi tamamlandı");
      } else {
        dbg("Foto: her iki kişi null döndü — API yanıtı parse edilemedi");
        updStep("⚠ Fotoğraf analizi yanıt vermedi — astroloji analizi devam ediyor");
      }
    } catch(fe){ dbg("Foto err: "+fe.message); }
  }

  if(_hasKey) {
    updStep("Yıldız haritaları okunuyor...");
    try {
      var cd1 = loc.cd1, cd2 = loc.cd2;
      var bp1 = loc.birthP1, bp2 = loc.birthP2;
      var r1 = bp1.rawLons, r2 = bp2.rawLons;

      // Açı hesapla
      function calcAsp(a,b){var d=Math.abs(a-b)%360;if(d>180)d=360-d;if(d<=8)return"Kavuşum";if(Math.abs(d-60)<=6)return"Sekstil";if(Math.abs(d-90)<=7)return"Kare";if(Math.abs(d-120)<=7)return"Trigon";if(Math.abs(d-180)<=8)return"Karşıtlık";return null;}
      function natalAsps(r){var ps=[["Güneş","sun"],["Ay","moon"],["Merkür","mercury"],["Venüs","venus"],["Mars","mars"],["Jüpiter","jupiter"],["Satürn","saturn"]];var res=[];for(var i=0;i<ps.length;i++)for(var j=i+1;j<ps.length;j++){var a=calcAsp(r[ps[i][1]],r[ps[j][1]]);if(a)res.push(ps[i][0]+"-"+ps[j][0]+":"+a);}return res.join(", ")||"Belirgin açı yok";}
      function synAsps(r1,r2){var p1=[["Güneş","sun"],["Ay","moon"],["Venüs","venus"],["Mars","mars"],["Merkür","mercury"]];var p2=[["Güneş","sun"],["Ay","moon"],["Venüs","venus"],["Mars","mars"]];var res=[];p1.forEach(function(a){p2.forEach(function(b){var asp=calcAsp(r1[a[1]],r2[b[1]]);if(asp)res.push("K1-"+a[0]+"→K2-"+b[0]+":"+asp);});});return res.join(" | ")||"Hesaplanamadı";}

      var natal1=natalAsps(r1), natal2=natalAsps(r2), syn=synAsps(r1,r2);
      dbg("K1 açılar: "+natal1);
      dbg("K2 açılar: "+natal2);
      dbg("Sinastri: "+syn);

      var p1full = "KİŞİ 1: "+(sun1||"Kova")+" güneş, "+(ri1v||"Oğlak")+" yükselen, Ay:"+cd1.moon+", Venüs:"+cd1.venus+", Mars:"+cd1.mars+", Merkür:"+cd1.mercury+", Jüpiter:"+cd1.jupiter+", Satürn:"+cd1.saturn+" | Natal açılar: "+natal1;
      var p2full = "KİŞİ 2: "+sun2+" güneş, "+(ri2||"bilinmiyor")+" yükselen, Ay:"+cd2.moon+", Venüs:"+cd2.venus+", Mars:"+cd2.mars+", Merkür:"+cd2.mercury+", Jüpiter:"+cd2.jupiter+", Satürn:"+cd2.saturn+" | Natal açılar: "+natal2;
      var p1SaatTxt = hour1!==12?(Math.floor(hour1)+":"+String(Math.round((hour1%1)*60)).padStart(2,"0")):"Bilinmiyor";
      var p2SaatTxt = hour2!==12?(Math.floor(hour2)+":"+String(Math.round((hour2%1)*60)).padStart(2,"0")):"Bilinmiyor";
      p1full += " | Doğum: "+(k1d||10)+" "+(MONTHS[(k1m||2)-1]||"Şubat")+" "+(k1y||1967)+" Saat:"+p1SaatTxt+(loc1?" Şehir:"+loc1:"");
      p2full += " | Doğum: "+d2+" "+MONTHS[+m2-1]+" "+(y2||"")+" Saat:"+p2SaatTxt+(loc2?" Şehir:"+loc2:"");

      var prompt = "SADECE JSON döndür. Başka hiçbir şey yazma.\\n\\n"+p1full+"\\n"+p2full+"\\nSİNASTRİ AÇILARI: "+syn+"\\n\\n"+
        "Her kişiyi SADECE bu haritanın gezegenlerine göre analiz et. Genel burç tanımı kullanma.\\n\\n"+
        "JSON formatı (tüm alanlar Türkçe, her alan min 4 cümle):\\n"+
        "{\\"a1\\":{\\"aciklama\\":\\"[K1 tam harita analizi — gezegen pozisyonları ve natal açılara göre]\\",\\"iliski\\":\\"[K1 Venüs "+cd1.venus+" ve Mars "+cd1.mars+" aşk stili]\\",\\"gucler\\":\\"[K1 güçlü natal açılar ve kazandırdıkları]\\",\\"zorluklar\\":\\"[K1 zorlu açılar ve büyüme alanları]\\"},"+
        "\\"a2\\":{\\"aciklama\\":\\"[K2 tam harita analizi — "+sun2+" güneş, Ay "+cd2.moon+", Venüs "+cd2.venus+", Mars "+cd2.mars+" — gezegen açılarına göre]\\",\\"iliski\\":\\"[K2 Venüs "+cd2.venus+" ve Mars "+cd2.mars+" aşk ve arzu stili]\\",\\"gucler\\":\\"[K2 güçlü natal açılar]\\",\\"zorluklar\\":\\"[K2 zorlu açılar]\\"},"+
        "\\"uyum\\":{\\"ozet\\":\\"[İki haritanın sinastri özeti — en önemli "+syn.split(" | ")[0]+" teması dahil]\\",\\"guclu\\":\\"[En uyumlu 2-3 sinastri açısı ve anlamları]\\",\\"zorluk\\":\\"[Zorlayıcı açılar ve dikkat edilmesi gerekenler]\\",\\"tavsiye\\":\\"[Bu iki haritaya özgü ilişki tavsiyeleri]\\"},"+
        "\\"spir\\":\\"[İki haritanın spiritüel uyumu]\\",\\"uyari\\":\\"[Kritik risk noktaları]\\",\\"ozet\\":\\"[Genel özet]\\"}";

      dbg("🚀 API çağrısı başlıyor...");
      var aRaw = await apiCall(JSON.stringify({
        model:"claude-sonnet-4-20250514", max_tokens:8000,
        system:"Sen profesyonel bir astrologsun. Verilen doğum haritası verilerine göre KİŞİYE ÖZEL analiz yapıyorsun. Genel burç tanımları kullanmıyorsun. Her yorumda somut gezegen adı ve açı bilgisi var. SADECE JSON döndürüyorsun.",
        messages:[{role:"user",content:prompt}]
      }), _key);

      dbg("API yanıtı alındı, parse ediliyor...");
      var aD; try{aD=JSON.parse(aRaw);}catch(e){aD={error:{message:"Ham parse hatası: "+e.message}};}
      if(!aD.error){
        var aT=(aD.content||[]).map(function(x){return x.text||"";}).join("").trim();
        dbg("Yanıt uzunluğu: "+aT.length+" karakter");
        var aS=aT.indexOf("{"), aE=aT.lastIndexOf("}");
        if(aS>=0&&aE>aS){
          try{
            var parsed=JSON.parse(aT.substring(aS,aE+1));
            Object.assign(ai,parsed);
            dbg("✅ Parse OK — alanlar: "+Object.keys(parsed).join(", "));
          }catch(pe){
            dbg("❌ JSON parse hatası: "+pe.message);
            dbg("İlk 300 kar: "+aT.substring(0,300));
          }
        }else{
          dbg("❌ JSON bulunamadı — yanıt: "+aT.substring(0,200));
        }
      }else{
        var em=(aD.error&&aD.error.message)||JSON.stringify(aD.error);
        dbg("❌ API hatası: "+em);
        err.textContent="⚠ "+em.substring(0,200);
        err.style.display="block";
      }
    } catch(ae){ dbg("Genel hata: "+ae.message); }
  }

  updStep("Sonuçlar hazırlanıyor...");
  await new Promise(function(r){ setTimeout(r, 200); });
  showLov(false);

  chartsDrawn = false;
  pendingCharts = {c1:loc.c1, c2:loc.c2, cd1:loc.cd1, cd2:loc.cd2, radar:loc.radar, cComp:loc.cComp};

  var rEl = document.getElementById("result");
  if(rEl) rEl.style.display = "block";
  document.getElementById("abtn").disabled = false;

  setTimeout(function(){
    try { render(loc, ai, {sun2:sun2, nm1:nm1, nm2:nm2, ri2:ri2, d2:d2, m2:m2, y2:y2}); }
    catch(re) {
      console.error("render err:", re);
      try{ document.getElementById("snum").textContent = loc.score; }catch(e){}
      err.textContent = "⚠ Görüntüleme hatası: " + re.message;
      err.style.display = "block";
    }
  }, 150);
}

// ═══ RENDER ══════════════════════════════════════
function render(loc, ai, meta) {
  var sun2 = meta.sun2, nm1 = meta.nm1||"", nm2 = meta.nm2||"2. Kişi";
  var ri2 = meta.ri2, d2 = meta.d2, m2 = meta.m2;
  var score = loc.score;

  var ac1 = AURA["Kova"], ac2 = AURA[sun2] || AURA["Kova"];
  GH1 = (ai&&ai.a1&&ai.a1.hex) ? ai.a1.hex : ac1.h;
  GH2 = (ai&&ai.a2&&ai.a2.hex) ? ai.a2.hex : ac2.h;

  // RGB Histogram → GH1/GH2 (API'siz çalışır, fotoğraf yüklendiyse)
  if(photoAura["1a"]||photoAura["1b"]){var rA1=photoAura["1a"]||photoAura["1b"];GH1=rA1.hex;}
  if(photoAura["2a"]||photoAura["2b"]){var rA2=photoAura["2a"]||photoAura["2b"];GH2=rA2.hex;}
  // API foto analizi varsa önceliklendir
  if(ai&&ai.foto){
    if(ai.foto.k1&&ai.foto.k1.aura_hex&&/^#[0-9a-fA-F]{3,6}$/.test(ai.foto.k1.aura_hex)) GH1=ai.foto.k1.aura_hex;
    if(ai.foto.k2&&ai.foto.k2.aura_hex&&/^#[0-9a-fA-F]{3,6}$/.test(ai.foto.k2.aura_hex)) GH2=ai.foto.k2.aura_hex;
  }
  var p2 = P2P[sun2] || P2P["Kova"];
  var p1data = P2P["Kova"];

  // Skor ring
  var col = score>=70 ? "#d4af6e" : score>=50 ? "#9b7fd4" : "#e87070";
  var C = 2*Math.PI*52;
  var ring = document.getElementById("rfl");
  if(ring) {
    ring.setAttribute("stroke", col);
    ring.setAttribute("stroke-dasharray", "0 " + C);
    setTimeout(function(){ ring.setAttribute("stroke-dasharray", (score/100*C) + " " + C); }, 300);
  }
  safe("snum", "text", score);
  var snEl = document.getElementById("snum"); if(snEl) snEl.style.color = col;
  safe("svrd", "text", score>=70 ? "Yüksek Uyum" : score>=50 ? "Orta Uyum" : "Düşük Uyum");
  var svEl = document.getElementById("svrd"); if(svEl) svEl.style.color = col;
  safe("stag", "text", score>=70 ? "💫 Uyumlu Bağ" : score>=50 ? "🌙 Potansiyel Var" : "✦ Dönüştürücü Yolculuk");

  // Avatarlar
  var vav1 = document.getElementById("vav1");
  if(photos["1a"] && vav1) {
    vav1.innerHTML = '<img src="'+photos["1a"]+'" style="width:100%;height:100%;object-fit:cover"/>' +
      '<div class="vaura" style="border-color:'+GH1+'"></div>';
  } else {
    var aura1El = document.getElementById("vaura1"); if(aura1El) aura1El.style.borderColor = GH1;
  }
  var vav2 = document.getElementById("vav2");
  var s2icoHdr = document.getElementById("s2ico-hdr");
  if(photos["2a"] && vav2) {
    vav2.innerHTML = '<img src="'+photos["2a"]+'" style="width:100%;height:100%;object-fit:cover"/>' +
      '<div class="vaura" style="border-color:'+GH2+'"></div>';
    if(s2icoHdr) s2icoHdr.style.display = "none";
  } else {
    var aura2El = document.getElementById("vaura2"); if(aura2El) aura2El.style.borderColor = GH2;
    if(s2icoHdr) s2icoHdr.textContent = GLYPHS[sun2] || "🌙";
  }
  safe("vnm2", "text", (nm2||sun2) + " ☀️");
  safe("vsg2", "text", sun2 + (ri2 ? " · "+ri2+" ⬆️" : ""));

  // GH1/GH2 foto güncellemesi yukarıda yapıldı

  var astroTip = cp2.i.includes(sun2) ? "Üçgen (120°) — uyumlu akış, doğal anlayış" :
                 cp2.z.includes(sun2) ? "Kare (90°) — güçlü gerilim ve dönüştürücü büyüme" :
                 "Sekstil (60°) — fırsatlar ve dikkatli yaklaşım gerektiren ilişki";

  // ─── TAB 0: UYUM ───
  var auraMain = (ai&&ai.spir) ? ai.spir :
    ac1.r + " (Kova) ile " + ac2.r + " (" + sun2 + ") auralarının buluşması; " +
    loc.el1 + " ve " + loc.el2 + " elementlerinin " +
    (loc.el1===loc.el2 ? "aynı frekansta titreşen" : "birbirini tamamlayan") + " bir alan oluşturuyor.";

  // Aura ana metin + foto analizi varsa karizma notlarını göster
  var fotoUyumEk = "";
  if(ai&&ai.foto) {
    var k1kn = ai.foto.k1&&ai.foto.k1.karizma_notu ? ai.foto.k1.karizma_notu : "";
    var k2kn = ai.foto.k2&&ai.foto.k2.karizma_notu ? ai.foto.k2.karizma_notu : "";
    if(k1kn||k2kn) {
      fotoUyumEk = '<div style="margin-top:10px;padding:11px 14px;border-radius:11px;background:rgba(212,175,110,.07);border:1px solid rgba(212,175,110,.2)">';
      fotoUyumEk += '<div style="font-size:9px;font-weight:900;color:#5a3000;letter-spacing:1.3px;margin-bottom:8px">📸 FOTOĞRAFTAN AURA OKUMA</div>';
      if(k1kn) fotoUyumEk += '<div style="font-size:12px;color:#111;margin-bottom:5px"><span style="font-weight:900;color:#5a3000">'+(nm1||"1. Kişi")+':</span> '+k1kn+'</div>';
      if(k2kn) fotoUyumEk += '<div style="font-size:12px;color:#111"><span style="font-weight:900;color:#2d1b69">'+(nm2&&nm2!=="2. Kişi"?nm2:"2. Kişi")+':</span> '+k2kn+'</div>';
      fotoUyumEk += '</div>';
    }
  }
  safe("r-aura","html",'<div style="font-size:13px;line-height:1.9;color:#111">'+auraMain+'</div>'+fotoUyumEk);
  safe("r-aorbs", "html",
    [{k:"1. Kişi",r:(ai&&ai.a1)?ai.a1.renk:ac1.r,h:GH1,d:(ai&&ai.a1)?ai.a1.enerji:ac1.d},
     {k:"2. Kişi",r:(ai&&ai.a2)?ai.a2.renk:ac2.r,h:GH2,d:(ai&&ai.a2)?ai.a2.enerji:ac2.d}]
    .map(function(a){
      return '<div class="aorb"><div class="odot" style="background:'+a.h+';box-shadow:0 0 8px '+a.h+'"></div>'+
        '<div><div style="font-size:12px"><strong>'+a.k+':</strong> '+a.r+' Aura</div>'+
        '<div style="font-size:11px;color:#333;font-weight:700">'+a.d+'</div></div></div>';
    }).join("")
  );
  // Web profil bölümü
  if(nm1 || (nm2 && nm2!=="2. Kişi")) {
    var webHtml = '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:1.5px;color:#5a3000;margin-bottom:6px">✦ KİŞİ BİLGİSİ</div>';
    if(nm1) webHtml += '<div style="font-size:12px;color:#111;margin-bottom:4px"><strong>'+nm1+'</strong> — Kova, Oğlak yükselen</div>';
    if(nm2&&nm2!=="2. Kişi") webHtml += '<div style="font-size:12px;color:#111"><strong>'+nm2+'</strong> — '+sun2+(ri2?", "+ri2+" yükselen":"")+'</div>';
    safe("r-web", "html", webHtml);
    document.getElementById("r-web").style.display = "block";
  }

  // Radar
  setTimeout(function(){ if(typeof Chart!=='undefined') drawRadar("radarC", loc.radar); }, 300);

  // Uyum barları — 0'dan animate et
  var cbarData=[{l:"Güneş Burcu",v:loc.sunSc,c:"#d4af6e"},{l:"Element",v:loc.eS,c:"#9b7fd4"},{l:"Yükselen",v:loc.rS,c:"#e8a0c0"},{l:"Çakra Ort.",v:Math.round(loc.cComp.reduce(function(a,b){return a+b;},0)/7),c:"#5ec4b0"},{l:"Enerji",v:loc.eC.freq,c:"#818cf8"},{l:"Genel",v:score,c:col}];
  safe("r-cbars","html",cbarData.map(function(c,i){return '<div class="cbrow"><div class="cblbl">'+c.l+'</div><div class="cbbg"><div class="cbfill" id="cbf'+i+'" style="width:0%;background:'+c.c+'"></div></div><div class="cbpct" style="color:'+c.c+'">'+c.v+'</div></div>';}).join(""));
  setTimeout(function(){cbarData.forEach(function(c,i){var el=document.getElementById("cbf"+i);if(el)el.style.width=c.v+"%";});},80);

  // Çakra uyum grafiği
  setTimeout(function(){ if(typeof Chart!=='undefined') drawChakraComp("chkComp", loc.c1, loc.c2, loc.cComp); }, 400);
  safe("r-chkr-comp", "html", buildChakraHTML(loc.cComp, "comp"));
  var avgCh = loc.cComp.reduce(function(a,b){return a+b;},0)/7;
  safe("r-chsum", "text", avgCh>=65 ?
    "Çakra uyumunuz genel olarak güçlü ve besleyici. İki enerji alanı birbirini yükseltici titreşimde buluşuyor." :
    "Bazı çakralarda güçlü bağlar, bazılarında birlikte çalışma alanı var — bu büyüme için bir davet.");

  // Enerji
  safe("r-energy", "html", buildEnergyHTML(loc.eC, ["#818cf8","#c084fc","#e8a0c0","#34d399"]));

  // ─── UYUM TAB GEZEGENSELLERİ ───
  var uyumAI = (ai&&ai.uyum) ? ai.uyum : null;

  // Spiritüel rezonans
  safe("r-spir", "text", (ai&&ai.spir) ? ai.spir :
    "Kova ve "+sun2+" spiritüel düzlemde " + loc.el1 + " ve " + loc.el2 + " elementleri aracılığıyla buluşuyor. "+
    "Bu haritaların Ay-Ay ve Venüs-Mars temasları ruhsal bağın derinliğini belirliyor.");
  if(ai&&ai.spir_detay) safe("r-spir-detay","text",ai.spir_detay);

  // Sinastri harita yorumu — derin analiz
  var haritaYorumTxt = (ai&&ai.harita_yorum) ? ai.harita_yorum : (ai&&ai.uyum&&ai.uyum.ozet) ? ai.uyum.ozet :
    (uyumAI && uyumAI.sinastri_ozet) ? uyumAI.sinastri_ozet :
    "Kova–"+sun2+" açısal ilişkisi "+astroTip+" olarak şekilleniyor. Venüs ("+loc.cd1.venus+")–Mars ("+loc.cd2.mars+") "+
    "ve Ay ("+loc.cd1.moon+")–Ay ("+loc.cd2.moon+") temasları bu ilişkinin duygusal dokusunu belirliyor.";
  safe("r-harita-yorum","html",
    '<div style="font-size:13px;line-height:1.9;color:#111;padding:4px 0">'+haritaYorumTxt+'</div>');

  // Güçlü yönler — AI'dan veya hesaplamadan
  if(ai && ai.uyum && ai.uyum.guclu) {
    safe("r-str","html",'<div class="li">'+ai.uyum.guclu+'</div>');
  } else if(uyumAI && uyumAI.guc_noktalari) {
    safe("r-str","html",'<div class="li">'+uyumAI.guc_noktalari+'</div>');
  } else {
    var seed = 10*2 + (+d2)*(+m2) + 23;
    var STR = ["Zihinsel bağ güçlü — fikir alışverişi kendiliğinden akar","Birbirini tamamlayan enerji dinamiği; biri topraklar, diğeri kanatlandırır","Ortak büyüme vizyonu bu ikiliği zamana taşıyabilir","Spiritüel rezonans yüksek — aynı frekansı seziyorlar","Güçlü karşılıklı çekim, başlangıç enerjisi olağanüstü","Farklılıklar çatışma değil, birbirini zenginleştirme aracına dönüşebilir","Uzun vadeli bağlılık için sağlam bir zemin mevcut"];
    (function(){var si=[],i=seed%7;while(si.length<3){if(si.indexOf(i)<0)si.push(i);i=(i+3)%7;}safe("r-str","html",si.map(function(x){return '<div class="li">'+STR[x]+'</div>';}).join(""));})();
  }

  // Zorluklar — AI'dan veya hesaplamadan
  if(ai && ai.uyum && ai.uyum.zorluk) {
    safe("r-cha","html",'<div class="li" style="color:#8b2a00">'+ai.uyum.zorluk+'</div>');
  } else if(uyumAI && uyumAI.zorluk_noktalari) {
    safe("r-cha","html",'<div class="li" style="color:#8b2a00">'+uyumAI.zorluk_noktalari+'</div>');
  } else {
    var seed2 = 10*2 + (+d2)*(+m2) + 23;
    var CHA = ["⚠ İletişim tarzlarındaki fark zamanla sessiz kırılmalara yol açabilir","⚠ Duygusal ifade biçimleri farklı — yanlış anlaşılmalar birikmeden konuşulmalı","⚠ Özgürlük ve yakınlık dengesini bulmak bu ikinin ana sınavı","⚠ Enerji seviyelerindeki fark uzun vadede yorgunluğa dönüşebilir","⚠ Beklentilerin söylenmemesi ilişkide görünmez duvarlar örüyor"];
    (function(){var ci=[],j=(seed2+1)%5;while(ci.length<2){if(ci.indexOf(j)<0)ci.push(j);j=(j+2)%5;}safe("r-cha","html",ci.map(function(x){return '<div class="li" style="color:#8b2a00">'+CHA[x]+'</div>';}).join(""));})();
  }

  // Özgün dinamik (yeni alan)
  if(uyumAI && uyumAI.ozgun_dinamik) {
    var dinamikEl = document.getElementById("r-dinamik");
    if(dinamikEl) { dinamikEl.textContent = uyumAI.ozgun_dinamik; dinamikEl.style.display="block"; }
  }

  // Uyum skoru güncelle (AI'dan geliyorsa)
  if(uyumAI && uyumAI.genel_skor) {
    var aiScore = parseInt(uyumAI.genel_skor);
    if(aiScore>=1 && aiScore<=100) {
      score = aiScore;
      col = score>=70?"#d4af6e":score>=50?"#9b7fd4":"#e87070";
      safe("snum","text",score);
      var snEl=document.getElementById("snum"); if(snEl) snEl.style.color=col;
      safe("svrd","text",score>=70?"Yüksek Uyum":score>=50?"Orta Uyum":"Düşük Uyum");
      var svEl=document.getElementById("svrd"); if(svEl) svEl.style.color=col;
    }
  }

  // Kritik uyarı
  var uyariTxt = (ai&&ai.uyari) ? ai.uyari :
    "Bu iki haritanın en kritik gerilim noktası: "+loc.cd1.moon+" ayı ile "+loc.cd2.moon+" ayının uyum dinamiği, "+
    "ve Kova'nın Venüs ("+loc.cd1.venus+") ile "+sun2+"'ın Mars ("+loc.cd2.mars+") arasındaki enerji farkıdır. "+
    "Sinastri açıları konuşulmadan bırakılırsa bu gerilim sessizce birikir.";
  safe("r-uyari","html",
    '<div style="font-size:13px;line-height:1.9;color:#7a2a00;padding:4px 0;border-left:3px solid rgba(220,80,40,.4);padding-left:12px">'+uyariTxt+'</div>');

  safe("r-adv","text",(ai&&ai.uyum&&ai.uyum.tavsiye)?ai.uyum.tavsiye:(ai&&ai.tavsiye)?ai.tavsiye:"Bu iki haritanın en uyumlu noktaları olan Merkür ("+loc.cd1.mercury+"-"+loc.cd2.mercury+") iletişim eksenini ve Venüs ("+loc.cd1.venus+"-"+loc.cd2.venus+") güzellik dilini bilinçli besleyin.");
  safe("r-sum","text",(ai&&ai.ozet)?ai.ozet:(ai&&ai.uyum&&ai.uyum.ozet)?ai.uyum.ozet:(uyumAI&&uyumAI.sinastri_ozet)?uyumAI.sinastri_ozet:"Kova (Güneş)+Oğlak (Yükselen)+"+loc.cd1.moon+" (Ay) ile "+sun2+" (Güneş)+"+(ri2||"Yükselen bilinmiyor")+"+"+loc.cd2.moon+" (Ay) haritaları "+(score>=70?"güçlü bir sinastri rezonansıyla":score>=50?"potansiyel dolu bir dinamikle":"dönüştürücü bir gerilimle")+" buluşuyor.");

  // Spiritüel renk uyumu
  if(ai && (ai.spir_renk1||ai.spir_renk2)) {
    var srHtml = '<div style="display:flex;gap:10px;margin-bottom:10px">';
    if(ai.spir_renk1) srHtml += '<div style="flex:1;padding:8px;border-radius:9px;background:'+GH1+'22;text-align:center"><div style="font-size:9px;color:#5a3000;font-weight:800">'+(nm1||"KİŞİ 1")+'</div><div style="font-size:12px;font-weight:800;color:#111">'+ai.spir_renk1+'</div></div>';
    if(ai.spir_renk2) srHtml += '<div style="flex:1;padding:8px;border-radius:9px;background:'+GH2+'22;text-align:center"><div style="font-size:9px;color:#5a3000;font-weight:800">'+(nm2||"KİŞİ 2")+'</div><div style="font-size:12px;font-weight:800;color:#111">'+ai.spir_renk2+'</div></div>';
    srHtml += '</div>';
    safe("r-spir-renk","html",srHtml);
    document.getElementById("r-spir-renk-wrap").style.display = "block";
  }

  // ─── TAB 1: 1. KİŞİ ───
  var s1av = document.getElementById("s1av");
  if(photos["1a"] && s1av) {
    s1av.innerHTML = '<img src="'+photos["1a"]+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
    s1av.style.border = "2px solid " + GH1;
  }
  safe("s1nm","text",(nm1||"Birinci Kişi") + " — Kova ☀️");
  safe("s1-aura","text",(ai&&ai.a1&&ai.a1.aciklama)?ai.a1.aciklama:"Kova burcunun aura rengi "+ac1.r+"'dir. "+ac1.d+". Uranüs enerjisi bu auraya özgün, elektriksel bir titreşim katarken Oğlak yükselen onu topraklı güçle dengeler.");
  safe("s1-aorbs","html",'<div class="aorb"><div class="odot" style="background:'+GH1+';box-shadow:0 0 8px '+GH1+'"></div><span>'+ac1.r+' Aura · '+((ai&&ai.a1&&ai.a1.enerji)?ai.a1.enerji:ac1.d)+'</span></div>');
  safe("s1-char","text",p1data.char);
  safe("s1-chips","html",p1data.traits.map(function(t){return '<span class="chip">'+t+'</span>';}).join(""));
  safe("s1-love","text",p1data.love);
  safe("s1-str","text",p1data.str);
  safe("s1-shd","text",p1data.shadow||"");

  // Kişi 1 foto & aura analizi — HER ZAMAN RENDER ET
  (function(){
    var k1x = (ai&&ai.foto&&ai.foto.k1&&(ai.foto.k1.karakter||ai.foto.k1.spirituel||ai.foto.k1.chakra_aura||ai.foto.k1.psikoloji)) ? ai.foto.k1 : null;
    var hasPhoto1 = !!(photos["1a"] || photos["1b"]);
    var k1xhtml = "";
    function fb1(bg,border,tc,ikon,baslik,icerik){
      if(!icerik||String(icerik).length<3) return "";
      return '<div style="margin-bottom:12px;padding:12px 14px;border-radius:11px;background:'+bg+';border:1px solid '+border+'">'+
        '<div style="font-size:10px;font-weight:900;letter-spacing:1.2px;color:'+tc+';margin-bottom:7px">'+ikon+' '+baslik+'</div>'+
        '<div style="font-size:13px;line-height:1.85;color:#111">'+String(icerik)+'</div></div>';
    }
    if(k1x) {
      // Fotoğraf + API analizi mevcut
      k1xhtml += fb1("rgba(212,175,110,.08)","rgba(212,175,110,.25)","#5a3000","📸","KARAKTER & BEDEN DİLİ",k1x.karakter);
      k1xhtml += fb1("rgba(155,127,212,.08)","rgba(155,127,212,.25)","#2d1b69","🧠","PSİKOLOJİK YAPI",k1x.psikoloji);
      k1xhtml += fb1("rgba(99,179,237,.08)","rgba(99,179,237,.25)","#1a365d","🌈","ÇAKRA & AURA DURUMU",k1x.chakra_aura);
      k1xhtml += fb1("rgba(145,85,253,.08)","rgba(145,85,253,.25)","#553c9a","✨","SPİRİTÜEL ENERJİ & BİLİNÇ",k1x.spirituel);
      k1xhtml += fb1("rgba(60,160,80,.07)","rgba(60,160,80,.2)","#1a5c2a","💪","GÜÇLÜ YÖNLER",k1x.guclu);
      k1xhtml += fb1("rgba(100,50,150,.06)","rgba(100,50,150,.15)","#4a1a7a","🔮","GİZLİ & GÖLGE YÖNLER",k1x.gizli);
      k1xhtml += fb1("rgba(232,160,192,.08)","rgba(232,160,192,.3)","#7a1040","💞","İLİŞKİ & BAĞLANMA STİLİ",k1x.iliski_stili);
      if(k1x.aura_renk||k1x.titresim_seviye||k1x.en_aktif_chakra||k1x.bloke_chakra){
        k1xhtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
        if(k1x.aura_renk) k1xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(212,175,110,.1);border:1px solid rgba(212,175,110,.25);text-align:center"><div style="font-size:9px;font-weight:900;color:#5a3000;margin-bottom:4px">🎨 AURA RENGİ</div><div style="font-size:13px;font-weight:800;color:#111">'+k1x.aura_renk+'</div></div>';
        if(k1x.titresim_seviye) k1xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(155,127,212,.07);border:1px solid rgba(155,127,212,.2);text-align:center"><div style="font-size:9px;font-weight:900;color:#2d1b69;margin-bottom:4px">⚡ TİTREŞİM</div><div style="font-size:13px;font-weight:800;color:#111">'+k1x.titresim_seviye+'</div></div>';
        if(k1x.en_aktif_chakra) k1xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(60,160,80,.06);border:1px solid rgba(60,160,80,.2);text-align:center"><div style="font-size:9px;font-weight:900;color:#1a5c2a;margin-bottom:4px">🌟 AKTİF ÇAKRA</div><div style="font-size:13px;font-weight:800;color:#111">'+k1x.en_aktif_chakra+'</div></div>';
        if(k1x.bloke_chakra&&k1x.bloke_chakra.toLowerCase()!=="yok") k1xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(200,50,50,.05);border:1px solid rgba(200,50,50,.15);text-align:center"><div style="font-size:9px;font-weight:900;color:#8b1a1a;margin-bottom:4px">🔒 BLOKE ÇAKRA</div><div style="font-size:13px;font-weight:800;color:#111">'+k1x.bloke_chakra+'</div></div>';
        k1xhtml += '</div>';
      }
      if(k1x.karizma_notu) k1xhtml += '<div style="padding:10px 14px;border-radius:10px;background:linear-gradient(135deg,rgba(212,175,110,.1),rgba(155,127,212,.1));border:1px solid rgba(180,140,80,.2);font-size:13px;font-style:italic;color:#5a3000;font-weight:700">✦ '+k1x.karizma_notu+'</div>';
    } else {
      // API analizi yok → astroloji temelli spiritüel içerik göster
      var ac1fb = AURA["Kova"];
      var a1ai = (ai&&ai.a1) ? ai.a1 : null;
      k1xhtml += fb1("rgba(99,179,237,.08)","rgba(99,179,237,.2)","#1a365d","🌈","ÇAKRA & AURA",
        (a1ai&&a1ai.aciklama) ? a1ai.aciklama :
        "Kova burcunun aura rengi "+ac1fb.r+"'dir. "+ac1fb.d+" Uranüs'ün etkisiyle bu enerji alanı elektriksel ve dinamiktir, ani sezgisel açılımlara ve kolektif bilinçle güçlü bir bağa sahiptir.");
      k1xhtml += fb1("rgba(145,85,253,.08)","rgba(145,85,253,.2)","#553c9a","✨","SPİRİTÜEL ENERJİ",
        (a1ai&&a1ai.spirituel_seviye) ? a1ai.spirituel_seviye :
        "Kova, spiritüel zincirlerden özgürleşme ve kolektif bilince uyanış sürecini yaşayan bir burçtur. Oğlak yükselen bu spiritüel enerjiyi pratik ve yapılandırılmış bir şekilde dünyaya taşır. Sezgisel algı güçlü, ancak duygusal ifade zaman zaman entelektüel bir filtreyle geçirilir.");
      k1xhtml += fb1("rgba(60,160,80,.07)","rgba(60,160,80,.18)","#1a5c2a","💪","GÜÇLÜ YÖNLER",
        "Vizyoner düşünce, insancıl değerler ve güçlü bir bireysellik. Sistemleri ve kalıpları sorgulamak doğasında var. Özgün fikirleri ve geniş perspektifi çevresini etkiler ve ilham verir.");
      k1xhtml += fb1("rgba(232,160,192,.08)","rgba(232,160,192,.25)","#7a1040","💞","İLİŞKİ & BAĞLANMA",
        "İlişkilerde önce zihinsel bağ, sonra duygusal yakınlık gelir. Özgürlük ve bağlılık arasındaki dengeyi kurmak bu kişi için önemli bir tema. Arkadaşlık temelli, derin ve entelektüel bir sevgi anlayışı benimser.");
    }
    // RGB aura (API yoksa)
    var rgbAura1 = photoAura["1a"]||photoAura["1b"];
    if(rgbAura1 && !k1x) {
      k1xhtml += '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:11px;background:rgba(212,175,110,.07);border:1px solid rgba(212,175,110,.2);margin-bottom:11px">'+
        '<div style="width:36px;height:36px;border-radius:50%;background:'+rgbAura1.hex+';box-shadow:0 0 12px '+rgbAura1.hex+'88;flex-shrink:0"></div>'+
        '<div><div style="font-size:9px;font-weight:900;color:#5a3000;letter-spacing:1.2px">📸 FOTOĞRAFTAN AURA</div>'+
        '<div style="font-size:13px;font-weight:800;color:#111;margin-top:2px">'+rgbAura1.renk+' Aura</div>'+
        '<div style="font-size:11px;color:#666;margin-top:1px">Titreşim: '+rgbAura1.titresim+'</div></div>'+
      '</div>';
    }
    safe("s1-foto-aura","html",k1xhtml);
  })();

  setTimeout(function(){ if(typeof Chart!=='undefined') drawChakraSolo("chk1C", loc.c1, GH1); }, 500);
  safe("s1-chakra-text","html",buildSoloChakraText(loc.c1,"Kova"));
  safe("s1-mtrs","html",buildEnergyHTML(loc.e1,[GH1,GH1+"99",GH1+"66",GH1+"44"]));
  safe("s1-energy-text","html",buildEnergyText(loc.e1,"Kova"));
  var s1AstroText = "Kova güneşi (Uranüs/Satürn yönetimli) + Oğlak yükselen: dışarıya disiplinli ve güvenilir bir yüz sunarken içten içe devrimci fikirler besler.";
  if(ai&&ai.a1&&ai.a1.aciklama) s1AstroText = ai.a1.aciklama;
  if(ai&&ai.a1&&ai.a1.spirituel_seviye) s1AstroText += " "+ai.a1.spirituel_seviye;
  safe("s1-astro","text",s1AstroText);

  // 1. kişi için ekstra spiritüel/astrolojik detay blokları
  (function(){
    var a1x = (ai&&ai.a1) ? ai.a1 : null;
    if(!a1x) return;
    var s1ExtraEl = document.getElementById("s1-spir-extra");
    if(!s1ExtraEl) return;
    var html = "";
    function exBlok1(bg,border,tc,ikon,baslik,icerik){
      if(!icerik||String(icerik).length<3) return "";
      return '<div style="margin-bottom:11px;padding:12px 14px;border-radius:11px;background:'+bg+';border:1px solid '+border+'">'+
        '<div style="font-size:10px;font-weight:900;letter-spacing:1.2px;color:'+tc+';margin-bottom:7px">'+ikon+' '+baslik+'</div>'+
        '<div style="font-size:13px;line-height:1.85;color:#111">'+String(icerik)+'</div></div>';
    }
    if(a1x.chakra_dominant) html += exBlok1("rgba(60,160,80,.06)","rgba(60,160,80,.18)","#1a5c2a","🌟","DOMINANT ÇAKRA",a1x.chakra_dominant);
    if(a1x.kisisel_gucler) html += exBlok1("rgba(40,120,80,.06)","rgba(40,120,80,.18)","#1a5c2a","💪","NATAL AÇILARDAN GELEN GÜÇLER",a1x.kisisel_gucler);
    if(a1x.kisisel_zorluklar) html += exBlok1("rgba(150,60,60,.06)","rgba(150,60,60,.18)","#6b1a1a","⚡","İÇSEL GERİLİMLER & BÜYÜME ALANLARI",a1x.kisisel_zorluklar);
    if(a1x.iliski_patern) html += exBlok1("rgba(200,64,106,.06)","rgba(200,64,106,.18)","#7a1040","💞","VENÜS-MARS EKSENİ & İLİŞKİ DİNAMİĞİ",a1x.iliski_patern);
    if(a1x.spirituel_seviye) html += exBlok1("rgba(80,40,160,.06)","rgba(80,40,160,.18)","#2d1b69","✨","SPİRİTÜEL FARKINDALIK",a1x.spirituel_seviye);
    if(html) s1ExtraEl.innerHTML = html;
  })();

  // ─── TAB 2: 2. KİŞİ ───
  var s2tabEl = document.getElementById("s2ico-tab");
  if(photos["2a"] && s2tabEl) {
    s2tabEl.innerHTML = '<img src="'+photos["2a"]+'" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>';
    s2tabEl.style.border = "2px solid " + GH2;
  } else if(s2tabEl) {
    s2tabEl.textContent = GLYPHS[sun2] || "🌙";
  }
  safe("s2nm","text",(nm2||"İkinci Kişi") + " — "+sun2+" ☀️");
  safe("s2sg","text",sun2+(ri2?" · "+ri2+" ⬆️":"")+" · "+(ELEM[sun2]||"")+" Elementi");
  safe("s2-aura","text",(ai&&ai.a2&&ai.a2.aciklama)?ai.a2.aciklama:sun2+" burcunun aura rengi "+ac2.r+"'dir. "+ac2.d+".");
  safe("s2-aorbs","html",'<div class="aorb"><div class="odot" style="background:'+GH2+';box-shadow:0 0 8px '+GH2+'"></div><span>'+ac2.r+' Aura · '+((ai&&ai.a2&&ai.a2.enerji)?ai.a2.enerji:ac2.d)+'</span></div>');
  safe("s2-char","text",p2.char);
  safe("s2-chips","html",p2.traits.map(function(t){return '<span class="chip">'+t+'</span>';}).join(""));
  safe("s2-love","text",p2.love);
  safe("s2-str","text",p2.str);
  safe("s2-shd","text",p2.shadow||"");

  // Kişi 2 foto & aura analizi — HER ZAMAN RENDER ET
  (function(){
    var k2x = (ai&&ai.foto&&ai.foto.k2&&(ai.foto.k2.karakter||ai.foto.k2.spirituel||ai.foto.k2.chakra_aura||ai.foto.k2.psikoloji)) ? ai.foto.k2 : null;
    var hasPhoto2 = !!(photos["2a"] || photos["2b"]);
    var k2xhtml = "";
    function fb2(bg,border,tc,ikon,baslik,icerik){
      if(!icerik||String(icerik).length<3) return "";
      return '<div style="margin-bottom:12px;padding:12px 14px;border-radius:11px;background:'+bg+';border:1px solid '+border+'">'+
        '<div style="font-size:10px;font-weight:900;letter-spacing:1.2px;color:'+tc+';margin-bottom:7px">'+ikon+' '+baslik+'</div>'+
        '<div style="font-size:13px;line-height:1.85;color:#111">'+String(icerik)+'</div></div>';
    }
    if(k2x) {
      // Fotoğraf + API analizi mevcut
      k2xhtml += fb2("rgba(155,127,212,.08)","rgba(155,127,212,.25)","#2d1b69","📸","KARAKTER & BEDEN DİLİ",k2x.karakter);
      k2xhtml += fb2("rgba(212,175,110,.08)","rgba(212,175,110,.25)","#5a3000","🧠","PSİKOLOJİK YAPI",k2x.psikoloji);
      k2xhtml += fb2("rgba(99,179,237,.08)","rgba(99,179,237,.25)","#1a365d","🌈","ÇAKRA & AURA DURUMU",k2x.chakra_aura);
      k2xhtml += fb2("rgba(145,85,253,.08)","rgba(145,85,253,.25)","#553c9a","✨","SPİRİTÜEL ENERJİ & BİLİNÇ",k2x.spirituel);
      k2xhtml += fb2("rgba(60,160,80,.07)","rgba(60,160,80,.2)","#1a5c2a","💪","GÜÇLÜ YÖNLER",k2x.guclu);
      k2xhtml += fb2("rgba(100,50,150,.06)","rgba(100,50,150,.15)","#4a1a7a","🔮","GİZLİ & GÖLGE YÖNLER",k2x.gizli);
      k2xhtml += fb2("rgba(232,160,192,.08)","rgba(232,160,192,.3)","#7a1040","💞","İLİŞKİ & BAĞLANMA STİLİ",k2x.iliski_stili);
      if(k2x.aura_renk||k2x.titresim_seviye||k2x.en_aktif_chakra||k2x.bloke_chakra){
        k2xhtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
        if(k2x.aura_renk) k2xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(155,127,212,.1);border:1px solid rgba(155,127,212,.25);text-align:center"><div style="font-size:9px;font-weight:900;color:#553c9a;margin-bottom:4px">🎨 AURA RENGİ</div><div style="font-size:13px;font-weight:800;color:#111">'+k2x.aura_renk+'</div></div>';
        if(k2x.titresim_seviye) k2xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(212,175,110,.07);border:1px solid rgba(212,175,110,.2);text-align:center"><div style="font-size:9px;font-weight:900;color:#5a3000;margin-bottom:4px">⚡ TİTREŞİM</div><div style="font-size:13px;font-weight:800;color:#111">'+k2x.titresim_seviye+'</div></div>';
        if(k2x.en_aktif_chakra) k2xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(60,160,80,.06);border:1px solid rgba(60,160,80,.2);text-align:center"><div style="font-size:9px;font-weight:900;color:#1a5c2a;margin-bottom:4px">🌟 AKTİF ÇAKRA</div><div style="font-size:13px;font-weight:800;color:#111">'+k2x.en_aktif_chakra+'</div></div>';
        if(k2x.bloke_chakra&&k2x.bloke_chakra.toLowerCase()!=="yok") k2xhtml += '<div style="padding:10px;border-radius:10px;background:rgba(200,50,50,.05);border:1px solid rgba(200,50,50,.15);text-align:center"><div style="font-size:9px;font-weight:900;color:#8b1a1a;margin-bottom:4px">🔒 BLOKE ÇAKRA</div><div style="font-size:13px;font-weight:800;color:#111">'+k2x.bloke_chakra+'</div></div>';
        k2xhtml += '</div>';
      }
      if(k2x.karizma_notu) k2xhtml += '<div style="padding:10px 14px;border-radius:10px;background:linear-gradient(135deg,rgba(155,127,212,.1),rgba(212,175,110,.1));border:1px solid rgba(155,127,212,.2);font-size:13px;font-style:italic;color:#2d1b69;font-weight:700">✦ '+k2x.karizma_notu+'</div>';
    } else {
      // Fotoğraf var ama API sonucu gelmedi → astroloji + spiritüel temelli içerik göster
      var ac2fb = AURA[sun2] || AURA["Kova"];
      var a2ai = (ai&&ai.a2) ? ai.a2 : null;
      var p2fb = P2P[sun2] || P2P["Kova"];
      k2xhtml += fb2("rgba(99,179,237,.08)","rgba(99,179,237,.2)","#1a365d","🌈","ÇAKRA & AURA",
        (a2ai&&a2ai.aciklama) ? a2ai.aciklama :
        sun2+" burcunun aura rengi "+ac2fb.r+"'dir. "+ac2fb.d+" "+(ELEM[sun2]||"")+" elementinin titreşimi bu enerji alanına özgün bir frekans katar.");
      k2xhtml += fb2("rgba(145,85,253,.08)","rgba(145,85,253,.2)","#553c9a","✨","SPİRİTÜEL ENERJİ",
        (a2ai&&a2ai.spirituel_seviye) ? a2ai.spirituel_seviye :
        sun2+" burcunun spiritüel yolculuğu "+(ELEM[sun2]||"")+" elementinin doğasıyla şekillenir. "+(p2fb.char||"Bu burç güçlü bir içgüdüsel zeka ve derin bir ruhsal farkındalık taşır.")+" Kendi potansiyelini ancak içe döndüğünde ve dürüstçe yüzleştiğinde tam anlamıyla keşfeder.");
      if(a2ai&&a2ai.chakra_dominant) k2xhtml += fb2("rgba(60,160,80,.07)","rgba(60,160,80,.18)","#1a5c2a","🌟","DOMINANT ÇAKRA", a2ai.chakra_dominant);
      if(a2ai&&a2ai.astro_derin) k2xhtml += fb2("rgba(212,175,110,.07)","rgba(212,175,110,.2)","#5a3000","🪐","ASTROLOJİK DERİN ANALİZ", a2ai.astro_derin);
      if(a2ai&&a2ai.karma_misyon) k2xhtml += fb2("rgba(100,50,150,.06)","rgba(100,50,150,.15)","#4a1a7a","🔮","KARMİK MISYON", a2ai.karma_misyon);
      k2xhtml += fb2("rgba(232,160,192,.08)","rgba(232,160,192,.25)","#7a1040","💞","İLİŞKİ ENERJİSİ", p2fb.love||"");
    }
    safe("s2-foto-aura","html",k2xhtml);
  })();

  setTimeout(function(){ if(typeof Chart!=='undefined') drawChakraSolo("chk2C", loc.c2, GH2); }, 600);
  safe("s2-chakra-text","html",buildSoloChakraText(loc.c2,sun2));
  safe("s2-mtrs","html",buildEnergyHTML(loc.e2,[GH2,GH2+"99",GH2+"66",GH2+"44"]));
  safe("s2-energy-text","html",buildEnergyText(loc.e2,sun2));
  var s2AstroText = sun2+" güneşi"+(ri2?" ve "+ri2+" yükselen":"")+": "+ELEM[sun2]+" elementinin güçlü özellikleri öne çıkıyor.";
  if(ai&&ai.a2&&ai.a2.aciklama) s2AstroText += " "+ai.a2.aciklama;
  if(ai&&ai.a2&&ai.a2.spirituel_seviye) s2AstroText += " "+ai.a2.spirituel_seviye;
  safe("s2-astro","text",s2AstroText);

  // 2. kişi için ekstra spiritüel/astrolojik detay blokları
  (function(){
    var a2x = (ai&&ai.a2) ? ai.a2 : null;
    if(!a2x) return;
    var s2ExtraEl = document.getElementById("s2-spir-extra");
    if(!s2ExtraEl) return;
    var html = "";
    function exBlok(bg,border,tc,ikon,baslik,icerik){
      if(!icerik||String(icerik).length<3) return "";
      return '<div style="margin-bottom:11px;padding:12px 14px;border-radius:11px;background:'+bg+';border:1px solid '+border+'">'+
        '<div style="font-size:10px;font-weight:900;letter-spacing:1.2px;color:'+tc+';margin-bottom:7px">'+ikon+' '+baslik+'</div>'+
        '<div style="font-size:13px;line-height:1.85;color:#111">'+String(icerik)+'</div></div>';
    }
    if(a2x.astro_derin) html += exBlok("rgba(212,175,110,.07)","rgba(212,175,110,.2)","#5a3000","🪐","ASTROLOJİK DERİN ANALİZ — "+sun2+" HAKKI SINDAKİ ÖZGÜN YORUM",a2x.astro_derin);
    if(a2x.gezegen_yorumu) html += exBlok("rgba(155,127,212,.07)","rgba(155,127,212,.2)","#2d1b69","🌠","VENÜS-MARS-AY EKSENİ & DUYGU DİNAMİĞİ",a2x.gezegen_yorumu);
    if(a2x.kisisel_gucler) html += exBlok("rgba(40,120,80,.06)","rgba(40,120,80,.18)","#1a5c2a","💪","NATAL AÇILARDAN GELEN GÜÇLER",a2x.kisisel_gucler);
    if(a2x.kisisel_zorluklar) html += exBlok("rgba(150,60,60,.06)","rgba(150,60,60,.18)","#6b1a1a","⚡","İÇSEL GERİLİMLER & BÜYÜME ALANLARI",a2x.kisisel_zorluklar);
    if(a2x.karma_misyon) html += exBlok("rgba(100,50,150,.06)","rgba(100,50,150,.15)","#4a1a7a","🔮","KARMİK DERS — SATÜRN & JÜPİTER'E GÖRE",a2x.karma_misyon);
    if(a2x.enerji_titresim) html += exBlok("rgba(99,179,237,.07)","rgba(99,179,237,.18)","#1a365d","⚡","ENERJİ FREKANSI & SPİRİTÜEL PRATİKLER",a2x.enerji_titresim);
    if(html) s2ExtraEl.innerHTML = html;
  })();

  // ─── TAB 3: HARİTA — GENİŞLETİLMİŞ ───
  safe("s1-pchips","html",buildPlanetChips(loc.cd1));
  safe("s2-pchips","html",buildPlanetChips(loc.cd2));
  var cp2 = COMPAT["Kova"]||{i:[],z:[]};
  var haritaYorum = (ai&&ai.harita_yorum) ? ai.harita_yorum :
    "Kova–"+sun2+" açısal ilişkisi "+astroTip+" olarak şekilleniyor. Bu açı, iki kişinin enerji alanlarının birbirini nasıl etkilediğini ve hangi koşullarda rezonans kurduğunu belirliyor. Kova'nın Uranüs yönetimli özgün enerjisi, "+sun2+"'ın temel özelliğiyle buluştuğunda hem tamamlayıcı hem zorlayıcı bir dinamik doğabilir. Sinastride güçlü noktalar: Venüs–Mars teması tutku ve çekim ekseninde, Güneş–Ay dinamiği kimlik ve duygu arasındaki köprüde şekilleniyor. Bu iki haritanın birbirini en çok etkilediği alan ise iletişim ve duygusal güvenlik zeminidir — bu noktayı güçlü tutmak ilişkinin uzun vadeli potansiyelini açar.";
  safe("r-astro","text", haritaYorum);

  // Ayrıntılı gezegen aspektleri
  var aspPairs = [
    {ico:"☉",ad:"Güneş–Güneş",gez:"Kova–"+sun2,txt:"İki kişinin temel kimliği ve yaşam amacının birbiriyle nasıl rezonans kurduğunu gösterir. Kova'nın kolektif vizyonu ve "+sun2+"'ın özü aynı yönde mi ilerliyorlar, yoksa farklı yollardan mı gidiyorlar? Bu temas, ilişkinin can suyunu ve uzun vadeli anlam zeminini belirler."},
    {ico:"☽",ad:"Ay–Ay",gez:loc.cd1.moon+"–"+loc.cd2.moon,txt:"Duygusal içgüdüler ve güvenlik ihtiyaçları bu eksenle değerlendiriliyor. Biri stres altında içe çekilirken diğeri dışa mı açılıyor? Aynı anda dinginlik mi hissediyorlar, yoksa duygusal ritimleri farklı mı çalışıyor? Ay uyumu, iki kişinin birlikte huzur bulup bulamayacağını doğrudan etkiler."},
    {ico:"♀",ad:"Venüs–Venüs",gez:loc.cd1.venus+"–"+loc.cd2.venus,txt:"Sevgi dili ve estetik değerler bu eksende okunuyor. Aynı tür ortamlardan, aynı jestlerden keyif alıyorlar mı? Biri sözel ifadeyle, diğeri dokunuşla mı sevildiğini hissediyor? Venüs uyumu, ilişkideki günlük sıcaklık ve armoni seviyesini doğrudan şekillendirir."},
    {ico:"♂",ad:"Mars–Mars",gez:loc.cd1.mars+"–"+loc.cd2.mars,txt:"Harekete geçme biçimi, karar alma tarzı ve fiziksel enerji bu eksende değerlendiriliyor. Benzer hızlarda mı hareket ediyorlar? Biri spontane ve hızlı, diğeri stratejik ve yavaş ise bu fark hem sürtüşme hem tamamlayıcılık kaynağı olabilir. Çatışma da bu eksende şekillenir."},
    {ico:"☿",ad:"Merkür–Merkür",gez:loc.cd1.mercury+"–"+loc.cd2.mercury,txt:"İletişim tarzı ve zihinsel işleyiş bu eksende okunuyor. Biri hızlı ve sezgisel düşünürken diğeri yavaş ve sistematik mi? Mizah anlayışları örtüşüyor mu? Merkür uyumu, günlük konuşmaların enerjisini ve birbirini anlama kolaylığını doğrudan belirler."},
    {ico:"♃",ad:"Jüpiter–Güneş",gez:loc.cd1.jupiter+"–"+sun2,txt:"Jüpiter'in genişletici enerjisi "+sun2+"'ın özüne değiyor — bu temas ilişkiye büyüme, anlam arayışı ve ilham getirir. Birliktelik içinde kim neyi öğretiyor, kim neyi öğreniyor? Bu eksen güçlüyse ilişki her iki kişiyi de daha iyi sürümlere taşıyabilir."},
    {ico:"♄",ad:"Satürn–Ay",gez:loc.cd1.saturn+"–"+loc.cd2.moon,txt:"Güvenilirlik, sorumluluk ve uzun vadeli bağlılık bu eksende şekilleniyor. Satürn'ün yapılandırıcı enerjisi Ay'ın duygusal ihtiyaçlarını karşılıyor mu, yoksa kısıtlıyor mu? Bu temas hem güçlü zemin hem de mesafe kaynağı olabilir — nasıl yaşandığı ilişkinin uzun vadeli karakterini belirler."},
    {ico:"♀",ad:"Venüs–Mars Çapraz",gez:loc.cd1.venus+"–"+loc.cd2.mars,txt:"2. kişinin Mars enerjisi 1. kişinin Venüs alanına doğrudan değiyor — bu, manyetik ve fiziksel çekimin en güçlü kaynağıdır. Arzu ve sevgi bir arada akıyor; biri tutuşturuyor, diğeri yanıt veriyor. Bu eksendeki enerji dengeli yönetildiğinde ilişkiye sürekli taze bir ateş katar."}
  ];
  safe("r-asps","html", aspPairs.map(function(a){
    return '<div class="aspitem" style="margin-bottom:8px;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.04);border:1px solid rgba(180,140,80,.12)">'+
      '<span class="aspico" style="font-size:16px">'+a.ico+'</span>'+
      '<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:.8px;color:#7a4a00;font-weight:900;margin-bottom:2px">'+a.ad+' — <span style="color:#9b7fd4">'+a.gez+'</span></div>'+
      '<div style="font-size:12px;color:#111;line-height:1.6">'+a.txt+'</div></div></div>';
  }).join(""));

  // Transit bilgileri
  if(loc.todayP) {
    var tp = loc.todayP, td = loc.todayDate||"Bugün";
    var transitHtml = '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:1.5px;color:rgba(212,175,110,.7);margin-bottom:10px">🌍 BUGÜNKÜ GÖKYÜZÜ — '+td+'</div>';
    transitHtml += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:12px">';
    [{ico:'☉',nm:'Güneş',val:tp.sun},{ico:'☽',nm:'Ay',val:tp.moon},{ico:'♀',nm:'Venüs',val:tp.venus},
     {ico:'♂',nm:'Mars',val:tp.mars},{ico:'☿',nm:'Merkür',val:tp.mercury},{ico:'♃',nm:'Jüpiter',val:tp.jupiter},
     {ico:'♄',nm:'Satürn',val:tp.saturn},{ico:'⛢',nm:'Uranüs',val:tp.uranus},{ico:'♆',nm:'Neptün',val:tp.neptune}
    ].forEach(function(p){
      transitHtml += '<div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:7px 8px;text-align:center">'+
        '<div style="font-size:14px">'+p.ico+'</div>'+
        '<div style="font-size:9px;color:#555;margin:2px 0">'+p.nm+'</div>'+
        '<div style="font-size:11px;color:rgba(212,175,110,.85);font-weight:700">'+p.val+'</div></div>';
    });
    transitHtml += '</div>';
    if(loc.transitAsp1&&loc.transitAsp1.length) {
      transitHtml += '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:1px;color:rgba(94,196,176,.7);margin:10px 0 6px">⚡ KİŞİ 1 TRANSİT AÇILARI</div>';
      loc.transitAsp1.slice(0,5).forEach(function(a){
        var acol = a.type==='uyumlu'?'rgba(94,196,176,.9)':a.type==='zorlu'?'rgba(240,100,100,.9)':'rgba(212,175,110,.9)';
        transitHtml += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(0,0,0,.06)">'+
          '<span style="font-size:14px">'+a.symbol+'</span>'+
          '<span style="font-size:11px;color:'+acol+';font-weight:700">'+a.transit+' '+a.aspect+' '+a.natal+'</span>'+
          '<span style="font-size:9px;color:#666;margin-left:auto">±'+a.orb+'°</span></div>';
      });
    }
    if(loc.transitAsp2&&loc.transitAsp2.length) {
      transitHtml += '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:1px;color:rgba(155,127,212,.7);margin:10px 0 6px">⚡ KİŞİ 2 TRANSİT AÇILARI</div>';
      loc.transitAsp2.slice(0,5).forEach(function(a){
        var acol = a.type==='uyumlu'?'rgba(94,196,176,.9)':a.type==='zorlu'?'rgba(240,100,100,.9)':'rgba(212,175,110,.9)';
        transitHtml += '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(0,0,0,.06)">'+
          '<span style="font-size:14px">'+a.symbol+'</span>'+
          '<span style="font-size:11px;color:'+acol+';font-weight:700">'+a.transit+' '+a.aspect+' '+a.natal+'</span>'+
          '<span style="font-size:9px;color:#666;margin-left:auto">±'+a.orb+'°</span></div>';
      });
    }
    safe("r-transit","html",transitHtml);
  }

  // Sinastri
  if(loc.synastry) {
    var syn = loc.synastry;
    var sCol = syn.score>=80?"#c8800a":syn.score>=65?"#9b6fd4":"#e8a0c0";
    safe("syn-score-bar","html",
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px">'+
      '<div style="font-family:Cinzel,serif;font-size:28px;font-weight:900;color:'+sCol+'">'+syn.score+'</div>'+
      '<div style="flex:1"><div style="background:rgba(0,0,0,.1);border-radius:4px;height:8px;overflow:hidden">'+
      '<div style="width:'+syn.score+'%;height:100%;background:'+sCol+';border-radius:4px;transition:width 1s"></div>'+
      '</div><div style="font-size:11px;color:#555;margin-top:3px">/ 100 Sinastri Puanı</div></div></div>');
    safe("syn-reltype","text",syn.relType||"");
    safe("syn-karma","text","🔮 "+(syn.karmaMsg||""));
    var strongHtml = "";
    (syn.strongBonds||[]).forEach(function(a){
      strongHtml += '<div style="padding:12px 14px;border-radius:12px;background:rgba(60,160,80,.07);border:1px solid rgba(50,150,70,.2);margin-bottom:10px">'+
        '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
        '<span style="font-size:24px">'+a.icon+'</span>'+
        '<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:11px;letter-spacing:.8px;color:#1a5c2a;font-weight:900">'+a.shortName+'</div>'+
        '<div style="font-size:10px;color:#555;font-style:italic">'+a.aspect+'</div></div>'+
        '<div style="background:#2a8a3a;color:#fff;font-size:12px;font-weight:900;padding:3px 8px;border-radius:8px">'+a.score+'</div></div>'+
        '<div style="font-size:13px;color:#111;line-height:1.75;margin-bottom:6px">'+a.desc+'</div>'+
        '<div style="font-size:11px;color:#666;font-style:italic">'+a.meta+'</div></div>';
    });
    safe("syn-strong","html",strongHtml||"<p>Analiz tamamlandı.</p>");
    var challengeHtml = "";
    (syn.challenges||[]).forEach(function(a){
      challengeHtml += '<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;background:rgba(200,100,50,.06);border:1px solid rgba(180,80,30,.15);margin-bottom:8px">'+
        '<div style="font-size:22px;flex-shrink:0">'+a.icon+'</div>'+
        '<div><div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:.8px;color:#7a2a00;margin-bottom:4px">'+a.name+'</div>'+
        '<div style="font-size:12px;color:#111;line-height:1.7">'+a.desc+'</div></div></div>';
    });
    safe("syn-challenges","html",challengeHtml||"<p>Büyük zorluk aspekti bulunmadı.</p>");
    var allHtml = "";
    (syn.aspects||[]).forEach(function(a){
      allHtml += '<div style="padding:10px 12px;border-radius:10px;background:'+a.bg+';border:1px solid rgba(0,0,0,.07);margin-bottom:8px">'+
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">'+
        '<span style="font-size:20px">'+a.icon+'</span>'+
        '<div style="flex:1"><div style="font-size:11px;color:'+a.color+';font-weight:900;letter-spacing:.5px">'+a.shortName+'</div>'+
        '<div style="font-size:10px;color:#555;font-style:italic">'+a.aspect+'</div></div>'+
        '<div style="font-size:14px;font-weight:900;color:'+a.color+'">'+a.score+'</div></div>'+
        '<div style="font-size:12px;color:#222;line-height:1.65;margin-bottom:5px">'+a.desc+'</div>'+
        '<div style="font-size:10px;color:#777;font-style:italic">'+a.meta+'</div></div>';
    });
    safe("syn-all","html",allHtml);
    safe("syn-summary","text",syn.summary||"");
  }

  // ─── TAB 4: PROFİL — ÖZGÜN BAKIŞ AÇISI ───
  var fp1r = (ai&&ai.foto&&ai.foto.k1) ? ai.foto.k1 : {};
  var fp2r = (ai&&ai.foto&&ai.foto.k2) ? ai.foto.k2 : {};
  var pr   = (ai&&ai.profil) ? ai.profil : {};
  function secBlok(ikon,baslik,icerik,renk,bg){
    if(!icerik||icerik.length<3) return "";
    return '<div style="padding:13px 15px;border-radius:12px;background:'+bg+';border:1px solid '+renk+'44;margin-bottom:11px">'+
      '<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:1.3px;color:'+renk+';font-weight:900;margin-bottom:8px">'+ikon+' '+baslik+'</div>'+
      '<div style="font-size:13px;color:#111;line-height:1.9">'+icerik+'</div></div>';
  }

  // Karşı taraf — ÖZÜN ÖZÜ (char) + BAĞLANMA PSİKOLOJİSİ (pr.iliski veya p2.love)
  safe("p4-karsi","html",
    secBlok("🔍","ÖZÜNE DOĞRUDAN BAKIŞ",pr.oz||p2.char,"#c8406a","rgba(200,64,106,.05)")+
    secBlok("💞","BAĞLANMADA GERÇEKTE ARANAN",pr.iliski_psikolojisi||p2.love||p2.attach||"","#7a1040","rgba(232,160,192,.06)"));

  // Psikoloji bölümü — her alan farklı kaynak
  var psikoHtml = "";
  // İç dünya → psiko alanı (char değil)
  psikoHtml += secBlok("🌌","İÇ DÜNYANIN HARİTASI",pr.ic_dunya||fp2r.psikoloji||p2.psiko||"","#2d1b69","rgba(80,40,160,.06)");
  // Gölge → shadow alanı (fp2r.gizli değil — o ayrı kullanılacak)
  psikoHtml += secBlok("🌑","GÖLGE — GERÇEĞİN ÖRTÜSÜ",pr.golge_derinlik||p2.shadow||"","#6b1a1a","rgba(180,40,40,.05)");
  // Dönüşüm → donusum (spirituel değil — o çakra bölümünde)
  psikoHtml += secBlok("🦋","DÖNÜŞÜM & OLGUNLAŞMA YOLU",pr.donusum||"","#1a4a2a","rgba(40,130,70,.05)");
  if(p2.traits&&p2.traits.length){
    psikoHtml += '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:11px">';
    p2.traits.forEach(function(t){ psikoHtml += '<span style="padding:5px 11px;border-radius:20px;background:rgba(212,175,110,.1);border:1px solid rgba(212,175,110,.25);font-size:12px;font-weight:700;color:#7a4a00">'+t+'</span>'; });
    psikoHtml += '</div>';
  }
  safe("p4-psiko","html",psikoHtml);

  // Foto analizi — fotoğraftan okunan, farklı başlıklar
  var fotoText = "";
  if(fp2r.karakter) fotoText += secBlok("👁","YÜZDEN OKUNAN ENERJİ DOKUSU",fp2r.karakter,"#5a3000","rgba(212,175,110,.06)");
  if(fp2r.chakra_aura) fotoText += secBlok("🌀","ENERJİ ALANI & ÇAKRA AKIŞI",fp2r.chakra_aura,"#1a365d","rgba(99,179,237,.06)");
  if(fp2r.spirituel) fotoText += secBlok("🔆","IŞIK KATMANLARI & FREKANS",fp2r.spirituel,"#553c9a","rgba(145,85,253,.05)");
  if(fp2r.aura_renk||fp2r.titresim_seviye){
    fotoText += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px">';
    if(fp2r.aura_renk) fotoText += '<div style="padding:10px;border-radius:10px;background:rgba(155,127,212,.08);text-align:center;border:1px solid rgba(155,127,212,.2)"><div style="font-size:9px;font-weight:900;color:#553c9a">🎨 AURA</div><div style="font-size:13px;font-weight:800;color:#111;margin-top:3px">'+fp2r.aura_renk+'</div></div>';
    if(fp2r.titresim_seviye) fotoText += '<div style="padding:10px;border-radius:10px;background:rgba(212,175,110,.07);text-align:center;border:1px solid rgba(212,175,110,.2)"><div style="font-size:9px;font-weight:900;color:#5a3000">⚡ TİTREŞİM</div><div style="font-size:13px;font-weight:800;color:#111;margin-top:3px">'+fp2r.titresim_seviye+'</div></div>';
    if(fp2r.en_aktif_chakra) fotoText += '<div style="padding:10px;border-radius:10px;background:rgba(60,160,80,.06);text-align:center;border:1px solid rgba(60,160,80,.2)"><div style="font-size:9px;font-weight:900;color:#1a5c2a">🌟 AKTİF ÇAKRA</div><div style="font-size:13px;font-weight:800;color:#111;margin-top:3px">'+fp2r.en_aktif_chakra+'</div></div>';
    if(fp2r.bloke_chakra&&fp2r.bloke_chakra.toLowerCase()!=="yok") fotoText += '<div style="padding:10px;border-radius:10px;background:rgba(200,50,50,.05);text-align:center;border:1px solid rgba(200,50,50,.15)"><div style="font-size:9px;font-weight:900;color:#8b1a1a">🔒 BLOKE ÇAKRA</div><div style="font-size:13px;font-weight:800;color:#111;margin-top:3px">'+fp2r.bloke_chakra+'</div></div>';
    fotoText += '</div>';
  }
  // RGB Histogram aura (API'siz, fotoğraftan)
  var rgbAura2 = photoAura["2a"]||photoAura["2b"];
  if(rgbAura2 && !fp2r.aura_renk) {
    fotoText += '<div style="display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:11px;background:rgba(212,175,110,.07);border:1px solid rgba(212,175,110,.2);margin-bottom:11px">'+
      '<div style="width:36px;height:36px;border-radius:50%;background:'+rgbAura2.hex+';box-shadow:0 0 12px '+rgbAura2.hex+'88;flex-shrink:0"></div>'+
      '<div><div style="font-size:9px;font-weight:900;color:#5a3000;letter-spacing:1.2px">📸 FOTOĞRAFTAN AURA ANALİZİ</div>'+
      '<div style="font-size:13px;font-weight:800;color:#111;margin-top:2px">'+rgbAura2.renk+' Aura</div>'+
      '<div style="font-size:11px;color:#666;margin-top:1px">Titreşim: '+rgbAura2.titresim+'</div></div>'+
    '</div>';
  }
  if(!fotoText && pr.enerji_imzasi) fotoText = secBlok("✦","ENERJİ İZİ",pr.enerji_imzasi,"#b8860b","rgba(212,175,110,.05)");
  safe("p4-foto","html",fotoText);

  // Çakra detay bölümü — 7 çakra tam analiz
  // ── Çakra statik fallback içerikleri ──
  var CHAKRA_STATIK = {
    Koç:"Bu kişinin enerji bedeni en çok alt merkezlerden beslenir. Kök ve Güç Pleksusu sürekli yüksek voltajda çalışır — adeta vücudun içinde sürekli bir motor var gibi. Hareketsiz kaldığında bu enerji sinirselliğe, tükenişe ya da patlayıcı bir öfkeye dönüşür. Kalp merkezi tutku taşır ama o yüksek duvarlar olmasa daha güçlü bir kanal açılabilir. Boğaz çakrası sansürsüz ve cesurca ifade eder; bu bir güçtür ama zaman zaman aşırılığa kaçabilir. Sezgi parlak ama anlıktır — Üçüncü Göz ışıldar, söner, tekrar ışıldar. Spiritüel bağlantı için önce bedenin enerjisini yatıştırmak gerekir; zemin sakinleşince yukarı doğru akış başlar.",
    Boğa:"Toprak enerjisi bu bedende çok derin köklenmiştir — Kök çakra neredeyse kayalık bir zemin gibi sağlamdır. Duyusal zevk ve yaratıcılık, Sakral merkezi besleyen birincil kaynaklardır; güzellik olmadan bu kişinin içi sönükleşir. Kalp merkezine ulaşmak sabır ister — ama bir kez açıldığında o kapı çok nadiren kapanır. İfade yavaştır, kelimeler dikkatle seçilir; Boğaz çakrası tutarlı ve güvenilirdir, ama asla hızlı değil. Sezgisel alan pratik ve somuttur — soyut kehanetler değil, güçlü içgüdüler konuşur. Spiritüel bağ, doğanın ritmine uyum sağladıkça, yavaş ama son derece derin biçimde oluşur.",
    İkizler:"Bu kişinin enerji yapısı yukarıdan aşağıya akar — Boğaz ve Üçüncü Göz her zaman meşgul, her zaman aktif. Zihin o kadar hızlı işler ki bazen duygusal sinyal gecikmeli gelir. Sakral merkez yaratıcı kanallarla beslenir — sanat, yazı, müzik, performans. Alt merkezlerde zaman zaman bir kararsızlık görünür; kim olduğuna dair net bir his kurulamaması Solar Pleksus'u dalgalandırır. Kalp açılmak ister ama zihin her şeyi analiz ettiğinden duygu bazen gecikir. Spiritüel yolculuk için sessizlik pratikleri kritiktir — o iç sesi susturmadan derin farkındalık zor ulaşır.",
    Yengeç:"Bu kişinin kalbi enerji bedeninin merkezi değil — kalbi enerji bedeninin kendisidir. Her şey oradan akar, her şey oraya döner. Ev ve aile temelli güvenlik hissi Kök çakranın kalibratörüdür; bu alan sarsıldığında tüm sistem sallanır. Sezgisel yetenek olağanüstüdür — özellikle yakınlarının iç dünyasını okumada adeta bir radar gibi çalışır. Boğaz çakrası güvende hissettiğinde coşar, hissetmediğinde içe katlanır. Spiritüel pratikler için ay döngüleriyle uyum, atıflar ve aile geçmişinin iyileştirilmesi çok güçlü kapılar açar. En büyük enerjetik blok, bırakmayı öğrenmemekten gelir.",
    Aslan:"İki büyük merkez yan yana yanar: Solar Pleksus ve Kalp. Biri kimliği, diğeri sevgiyi besler — ikisi birlikte muhteşem bir ışık yaratır, ama biri söndüğünde diğeri de zayıflar. Yaratıcı ifade bu kişi için enerji kanalı değil, yaşamsal bir ihtiyaçtır; sahnesi olmayan Aslan solarken sahnesi olan Aslan parlar. Boğaz çakrası güçlü ve etkileyicidir — ses tonu, performans enerjisi, kitlelerle kurduğu bağ bu merkezden beslenir. Kök çakra onura ve statüye bağlıdır; aşağılandığında topraklanma yerini kaybeder. Spiritüel büyüme, egonun ışıkla, gölgenin kabul görmesiyle başlar.",
    Başak:"Bu kişinin enerji yapısı analitik ve titiz bir hassasiyetle işler — bir hatayı anında fark eden, sistemi sürekli tararayan bir iç kontrol mekanizması var. Solar Pleksus hem güç hem de kaygı merkezi olarak çalışır; mükemmeliyetçilik bazen bu alanı sürekli gerilmiş halde tutar. Boğaz düşünceli ve ölçülüdür — sözler söylenmeden önce elemeden geçer. Kalp, hizmet aracılığıyla açılır; 'seni iyileştireyim' yaklaşımı sevginin dilidir. Kök çakra rutin ve düzenle topraklanır. Spiritüel büyüme için 'yeterince iyiyim' ifadesini içselleştirmek, Solar Pleksus'taki kronik gerilimi çözer.",
    Terazi:"Bu kişinin enerji bedeni ilişkisel bir zemin üzerinde şekillenir — yalnız hissedildiğinde bile başkasıyla bağlantının hayali bu alanı ayakta tutar. Kalp merkezi ilişkisel uyum ve estetik güzellikle beslenirken, Solar Pleksus karar anlarda zayıflayabilir; 'ne istiyorum?' sorusu cevapsız kalabilir. Boğaz sanatsal, zarif ve diplomatik bir ifade kanalı olarak çalışır — ama asıl söylenmesi gereken söylenmeyebilir. Kök çakra ortak bir alana, bir partnere, bir aidiyete dayanır. Spiritüel büyüme için 'ben olmadan da tamamım' deneyimi, bu enerjinin en derin kapısını açar.",
    Akrep:"Bu kişinin enerji bedeni yüzeyde sakin, derinlerde volkanik bir yapıya sahiptir. Sakral merkez bu burçta ölüm-yeniden doğuş döngüsünü yaşatır; dönüşüm kaçınılmazdır. Kök çakra hayatta kalma içgüdüsüyle bağlantılıdır — çok güçlüdür, ama zaman zaman savunmacıdır. Güç Pleksusu kontrol ihtiyacını besler; bırakmak bu merkezin en büyük sınavıdır. Kalp korunaklıdır ama içinde devasa bir kapasite yatar — güven kazanıldığında o kapının ardındaki enerji mucizevi olabilir. Üçüncü Göz olağanüstü keskindir. Spiritüel büyüme affetmeyi, kontrolü bırakmayı ve dönüşüme teslim olmayı öğrendikçe gerçekleşir.",
    Yay:"Bu kişinin enerjisi yukarı ve dışa doğru akar — Taç ve Üçüncü Göz sürekli büyük resmi arar, anlam ve vizyon peşindedir. Solar Pleksus iyimserlikle doldurulmuştur; 'bir yolu vardır' inancı burada yaşar. Sakral merkez özgürlük ve macera temasıyla canlı kalır — sıkışmışlık hissi bu alanı doğrudan söndürür. Boğaz dürüst, ilham verici ve direkt konuşur — ama zaman zaman hassas alanlarda patavatsızlığa kayabilir. Kök çakra toprağa basmayı öğrenmekte zorlanır; 'şimdi ve burada' bu enerjinin en büyük spiritüel dersidir.",
    Oğlak:"Bu kişinin enerji yapısı altta güçlü, üstte gelişmekte olan bir piramide benzer. Kök çakra olağanüstü sağlamdır; güvenlik inşa üzerine, yavaş ama kalıcı biçimde kurulur. Güç Pleksusu hırs ve irade enerjisiyle sürekli aktiftir. Ama bu güçlü alt merkezler tüm enerjiyi kendine çektiğinde Kalp ve üst merkezlere akış azalabilir. Boğaz otoriteyle, güvenilir kelimelerle konuşur; söz verdiğinde tutar. Kalp zamanla, güven kazanılarak açılır — romantizm onun için eylem ve sorumluluktur. Spiritüel büyüme, başarının ötesinde 'var olmanın' yeterliliğini keşfetmekle başlar.",
    Kova:"Bu kişinin enerji bedeni en üst merkezden beslenir — Taç çakrası kolektif bilince, insanlığın geleceğine, evrensel fikirlere açık bir anten gibi çalışır. Boğaz yenilikçi, cesur ve özgündür; söylemediği şeyleri söyleme cesareti vardır. Üçüncü Göz sistematik ve sezgisel bir düşünce mimarisi sunar. Ama alt merkezlerde farklı bir tablo var: Kök çakra özgürlük ihtiyacıyla çatışır, Solar Pleksus kolektif kimlikte bireysel kimliği zaman zaman kaybeder. Kalp herkesi sever ama bir kişiyi yakına almak için ekstra alan gerekir. Spiritüel büyüme bedende yaşamayı öğrenmekle — yukarıdan aşağıya inmeyle — gerçekleşir.",
    Balık:"Bu kişinin enerji bedeni filtreden yoksundur — her şeyi, herkesi hisseder. Kalp ve Taç çakraları duvarı olmayan pencereler gibi açıktır; bu hem mucizevi bir empati kapasitesi hem de duygusal tükenmenin kaynağıdır. Üçüncü Göz sezgisel imgelerle, rüyalarla ve sessiz bilgiyle çalışır. Sakral merkez sanatsal yaratıcılığın kaynağıdır. Ama Kök ve Solar Pleksus — topraklanma ve sınır koyma merkezleri — en kırılgan noktalardır. Enerji sızıntısı bu iki merkezden gerçekleşir. Spiritüel büyüme için hayır diyebilmeyi öğrenmek, kendi enerjisini diğerlerinden ayırt edebilmek ve bedende kalmayı öğrenmek kritik gelişim alanlarıdır."
  };

  var ASTRO_STATIK = {
    Koç:{derin:"Mars'ın elinden doğan bu enerji, sabahın ilk ışığı gibi erken gelir ve yakıcıdır. Başlamak bir refleks, tamamlamak ise öğrenilmesi gereken bir beceridir. Kardinal Ateş, onu dünyayı ateşlemeye yönlendirir — ama yaktığı ateşi sürdürme görevi genellikle başkasına kalır. Gölge tarafı sabırsız, dürtüsel ve incindiğinde sert olabilir. Ama bu enerjinin gerçek potansiyeli, cesaretini bilinçle kullandığında ortaya çıkar — o zaman başkalarının göremediği yere ilk adımı atan biri olur.",gezegen:"Venüs bu burçta ateşle birleşir — aşk bir rekabet gibi hissedilebilir, fethedilmesi gereken bir ülke gibi. Ama duygusal olgunluk kazanıldığında, o yoğunluk derin bir sadakate dönüşür. Mars-Ay etkileşimi ani duygusal patlamalara zemin hazırlar; hisseder, söyler, geçer — ama yaralar kalabilir. Cinsellik bu burç için doğrudan ve yüksek enerjilidir; sürpriz sever, pasifliği sevmez.",titresim:"Kırmızı ve turuncu frekanslar titreşir bu bedende. Hareketsiz kaldığında bu enerji içeriden yakar; spor, dans, yürüyüş, fiziksel ifade zorunlu bir boşaltım kanalıdır. Meditasyon için oturup bekleme değil, aktif pratikler önerilir — nefes çalışması, hareket meditasyonu. Güç sözcükleri ve kısa, net niyetler bu enerjiye rezonans kurar."},
    Boğa:{derin:"Venüs'ün bahçesinde yetişmiş, toprağa köklü bir varlık. Boğa için değer sadece elde etmek değil — korumak, büyütmek ve güzelleştirmektir. Sabit Toprak modu ona inanılmaz bir kararlılık verir; ama bu aynı zamanda 'beni değiştiramazsınız' ilanıdır. Gerçek potansiyeli sabır gerektiren şeylerde — uzun vadeli inşalarda, derin sadakatte, yaşamı güzel kılma becerisinde — parlar.",gezegen:"Venüs bu burçta evindedir. Aşkı duyusal ve somut yaşar — yemek paylaşımı, dokunuş, güzel müzik, sıcak bir ortam sevginin dilidir. Ay, duygusal yapıya istikrar katar; hisler derin ama ifadesi yavaştır, çabuk açılmaz. Mars bu burçta ağır ama kararlı hareket eder — hazır olmadan başlamaz, başladığında da bitirmeden bırakmaz.",titresim:"Yeşil ve toprak tonlarının titreşimi. Bu enerji için en güçlü pratik doğayla fiziksel temas — çıplak ayak, toprak, su. Güzellik spiritüel bir eylemdir; müzik, yemek pişirmek, el sanatları meditasyonun yerini tutabilir. Beden farkındalığı pratikleri, mindfulness ve yavaşlamak bu enerjiyi besler."},
    İkizler:{derin:"Merkür'ün çift kanatlı elçisi — bu enerji ne durur ne susar ne de tek bir bakış açısına hapsedilir. Değişken Hava modi onu sürekli hareket ettirirken, her konuya birden fazla perspektiften bakabilmesi hem armağanı hem de yorgunluk kaynağıdır. Gölgesinde kararsızlık, güven erozyonu ve yüzeysellik yatar. Ama en parlak haliyle köprü kurar — farklı dünyaları, insanları, fikirleri birleştirir.",gezegen:"Venüs bu burçta flört dolu ve zeki bir aşk enerjisi sunar — sizi güldürür, şaşırtır, zihinsel olarak uyarır. Ama derinleşmek için biraz direnç gösterebilir; sıkılırsa ilgisi başka yöne kayar. Ay-İkizler bileşimi duygusal tutarsızlık üretir — ne hissettiği sabah akşam değişir, bu onu yorar ama çevresini de şaşırtır.",titresim:"Sarı ve elektrik mavisi frekanslar. Yazma, sesli düşünme, podcast dinleme, tartışma bu enerjiyi besler ve dengeler. Ama zihin sürekliliğini zaman zaman kaybeder; meditasyon ve tek bir şeye odaklanma pratiği çok değerlidir. Sessizlik bu enerji için nadir ve iyileştirici bir ilaçtır."},
    Yengeç:{derin:"Ay'ın çocuğu — bu enerji kabarır, alçalır, kabarır. Kardinal Su onu başlatmaya yönlendirirken bu başlangıçlar genellikle dışa değil içe dönüktür; bir ev kurmak, bir bağ oluşturmak, bir alan korumak. Geçmişin hafızasında yaşar — hem bu onun armağanıdır hem de bırakmayı öğrenmesi gereken şey. Gerçek potansiyeli güvenli, besleyici alanlar yaratmakta ve insanları koşulsuz kabul etmekte yatar.",gezegen:"Ay yönetiminde bu burç, sevgiyi besleyerek ifade eder. Venüs bu enerjiyle birleşince ev ortamında, aile ritüellerinde, özel anlarda çiçeklenir. Mars-Yengeç bileşimi öfkenin altında genellikle bir incinme yatar — saldırganlık çoğunlukla kırılganlığın maskesidir. Cinsellik güven ve duygusal bağlılık kurulduktan sonra tam açılır.",titresim:"Gümüş, bej ve deniz mavisi frekanslarda titreşir. Ay döngüleriyle uyum bu enerji için doğal bir spiritüel takvimdir. Su ile temas — deniz, yağmur, banyo ritüelleri — derin bir iyileşme kanalıdır. Aile geçmişinin iyileştirilmesi ve hafıza çalışması spiritüel büyümede kritik bir kapı açar."},
    Aslan:{derin:"Güneş bu burçta tam merkezde durur — kendi etrafında dönen ve ışığıyla çevresini aydınlatan bir yıldız. Sabit Ateş onu inançlarına ve değerlerine sadık kılar; ama bu aynı zamanda eleştiriye ve değişime direncin kaynağıdır. Gölge tarafında onay bağımlılığı ve kırılgan ego yatar. Gerçek büyüklüğü, sahneyi paylaşabildiğinde, başkasının ışığını söndürmeden kendi ışığını yaktığında ortaya çıkar.",gezegen:"Venüs bu enerjiyle birleştiğinde aşk dramatik, coşkulu ve görkemlidir. Takdir edilmek ve hayran olunmak temel duygusal ihtiyaçtır — bu karşılanmazsa bağ zayıflar. Ay bu burçta güçlü bir duygusal ifade yaratır; hisseder ve gösterir, saklayamaz. Mars ise parlak, iddialı ve rekabetçi bir tutku enerjisi sunar.",titresim:"Altın sarısı ve kor turuncu. Güneş enerjisiyle çalışmak — gündüzün ışığında vakit geçirmek, güneş selamlama — bu burç için spiritüel bir ritüeldir. Yaratıcı ifade; sahne, müzik, resim, performans hem kanallaştırma hem de iyileşme aracıdır. Kalp merkezli meditasyon ve 'ben yeterliyim' temelli çalışmalar dönüştürücüdür."},
    Başak:{derin:"Merkür'ün ince dişli tarakından geçirilmiş, Toprak elementinin titizliğiyle işlenmiş bir enerji. Değişken Toprak modu onu hem esnek hem de detaylara takılı kılar. Dünyanın işleyişindeki hataları ve eksiklikleri fark eder — ve düzeltmek için içten bir çekim hisseder. Gölgesinde ise yorulmayan iç eleştirmen, mükemmeliyetçilik tuzağı ve 'yeterince iyi değilim' korkusu yatar.",gezegen:"Venüs bu burçta özenli, titiz ve hizmet odaklı bir sevgi dili konuşur — sever ve bunu sizi iyi hissettiren küçük eylemlerle gösterir. Ay analitik bir duygusal yapı üretir; hisleri düşüncelerle işler, doğrudan duygusal ifade zaman zaman güçleşir. Mars bu burçta dikkatli ve verimli hareket eder; enerjiyi israf etmez ama spontane olmakta zorlanır.",titresim:"Yeşil ve bej, saf ve temiz titreşimler. Beden ve sağlık ritüelleri bu enerji için spiritüel eylemdir — ne yediği, nasıl uyuduğu, bedenine nasıl baktığı bir bilinç yansımasıdır. Yazma, günlük tutma ve nefes pratiği zihni arındırır. 'Yeterince iyiyim' affirmasyonu bu enerjinin en güçlü dönüşüm aracıdır."},
    Terazi:{derin:"Venüs'ün ikinci evi — bu enerji güzelliği, dengeyi ve ilişkiyi bir gereksinim olarak yaşar. Kardinal Hava onu ilişkilerde inisiyatif almaya iter; ama bu inisiyatif genellikle çatışmayı önlemek, uyumu sürdürmek yönündedir. Gölgesinde kendi sesini bastırmak, kararsızlık ve onay bağımlılığı yatar. Gerçek potansiyeli adalet ve zarafeti bir arada taşıyabilmesinde — hem kendine hem karşısındakine dürüst olabildiğinde açılır.",gezegen:"Venüs bu enerjiyle tam uyum içindedir; aşkı estetik, romantik ve ilişkisel olarak yaşar. Eşitlik ve karşılıklılık vazgeçilmezdir. Ay-Terazi bileşimi duygusal dengeyi arar ama çatışmadan kaçınmak için gerçek hisleri bastırabilir. Mars bu burçta yavaş ama zarif adımlar atar; romantik bir gerginlik sevdiği söylenebilir.",titresim:"Pembe ve açık yeşil, uyumlu frekanslar. Sanat, müzik ve güzellik bu enerji için spiritüel gıdadır. Partner yoga, uyumlu dans ve karşılıklı meditasyon pratikleri özellikle güçlüdür. 'Başkalarını onaylamadan önce kendimi onaylıyorum' temelli çalışmalar derin dönüşüm başlatır."},
    Akrep:{derin:"Mars ve Plüton'un ortak mirasçısı — bu enerji ne hafif ne kolay ne de yüzeyseldir. Sabit Su modu onu kararlarında ve bağlarında sarsılmaz kılar. Dönüşüm bu burç için bir seçenek değil, kaçınılmaz bir döngüdür: eski kimliği terk etmek, yeniden şekillenmek, tekrar doğmak. Gölgesinde takıntı, kontrol ihtiyacı ve affetme güçlüğü yatar. Potansiyeli ise derinliktir — sahici güç burada, yüzeyde değil yatar.",gezegen:"Venüs bu enerjiyle birleştiğinde aşk sahiplenici, derin ve yoğundur. Yüzeysel ilişkiye kapalıdır; ya her şeyi ya da hiçbir şeyi. Mars ve Plüton cinsel enerjiyi dönüştürücü bir güce çevirir — bu enerji ruhsal bir bağlantıya dönüşebildiğinde olağanüstü bir derinlik ortaya çıkar. Ay bu burçta derin hafıza ve duygusal arşivler taşır; eski yaralar uzun süre canlı kalabilir.",titresim:"Bordo ve koyu mor, dönüştürücü frekanslar. Gölge çalışması, derin psikolojik keşif ve şamanistik pratikler bu enerjiyle doğal uyum içindedir. Affetme ritüelleri ve 'kontrolü bırakıyorum' temelli meditasyon bu enerjinin en güçlü spiritüel kapılarını açar. Yoğun bedensel pratikler — güçlü nefes çalışmaları — derin bir arınma sağlar."},
    Yay:{derin:"Jüpiter'in geniş kanatları altında yetişmiş, ufukları hiç bitmeyen bir enerji. Değişken Ateş onu hem vizyon sahibi hem de taahhüt konusunda çekingen kılar. Anlam arayışı bu burç için bir hobi değil, varoluşun kendisidir — cevaplamadığı her 'neden' onu huzursuz eder. Gölgesinde sorumluluktan kaçma, abartılı iyimserlik ve söz tutamama yatar. Potansiyeli ise ilham vermek — kalabalıklara bile olsa bir ışık tutabilmektir.",gezegen:"Venüs bu enerjiyle birleştiğinde aşk bir macera, bir keşif yolculuğuna dönüşür. Zihinsel ve felsefi uyum vazgeçilmezdir; büyüyemeyeceği bir ilişkide sıkışmış hisseder. Ay-Yay bileşimi duygusal iyimserlik üretir ama derin duyguları işlemek zaman alabilir. Mars bu burçta ateşli, özgür ve impulsif bir tutku enerjisi taşır.",titresim:"Mor ve koyu sarı frekanslar, genişleyen titreşimler. Seyahat, kamp, açık hava ve farklı kültürlerle temas bu enerjinin spiritüel gıdasıdır. Felsefi okuma, öğretme ve anlam odaklı sohbetler meditasyon kadar iyileştirici olabilir. Topraklanma için dans, yürüyüş ve düzenli beden pratiği gereklidir."},
    Oğlak:{derin:"Satürn'ün eliyle şekillendirilmiş, zamanın sabırlı öğrencisi. Kardinal Toprak onu inşa etmeye, yapılandırmaya ve sorumluluğu üstlenmeye iter. Güç onun için şov değil, somut başarı ve uzun vadeli sürdürülebilirliktir. Gölgesinde duygusal soğukluk, 'hak etmem gerekir' inancı ve iş-ilişki dengesizliği yatar. Gerçek potansiyeli, ustalığını insanlığın hizmetine sunduğunda ve başarının ardındaki insani bedeli fark ettiğinde ortaya çıkar.",gezegen:"Venüs bu burçta ciddi, güvenilir ve uzun vadeli bir aşk enerjisi üretir. Romantizm küçük jestlerde gizlidir — orada olmak, söz vermek ve tutmak. Ay duygusal mesafeyi korurken aslında içten içe derin hisseder; bu çelişki bazen yalnızlaştırır. Mars bu burçta stratejik ve sabırlı hareket eder; enerjiyi doğru hedefe yönelttiğinde sonuçlar inanılmazdır.",titresim:"Koyu gri ve derin toprak frekanslar. Disiplin bu burç için bir pratik değil, spiritüel bir yol gibidir. Satürn ritüelleri, uzun vadeli taahhütler ve sabır gerektiren pratikler derin bir iç dönüşüm yaratır. 'Başarıdan bağımsız olarak değerliyim' çalışması bu enerjinin en derin kapısını açar."},
    Kova:{derin:"Uranüs'ün çıkardığı şimşekten doğmuş, alışılmışın dışında bir zihin. Sabit Hava modu onu fikirlerine bağlı ve özgünlüğünde kararlı kılar. Kolektif ile birey arasındaki gerilim bu enerjinin sürekli yaşattığı paradokstur — ait olmak ister, ama kendini kaybetmeden. Gölgesinde duygusal mesafe, alışılmışa karşı çıkmak için karşı çıkma ve yalnızlık yatar. Gerçek potansiyeli insanlığın geleceğine özgün katkıda bulunmaktadır.",gezegen:"Venüs bu enerjiyle birleştiğinde aşk alışılmışın dışındadır — zihinsel özgürlük, entelektüel çekim ve kısıtlanmama vazgeçilmezdir. Ay duygusal soğukluk değil, duygusal işlemenin zihinsel süreçlerden geçmesi anlamına gelir. Mars bu burçta ani, özgün ve beklenmedik hamleler yapar — tahmin edilemez ama her zaman özgündür.",titresim:"Elektrik mavisi ve gümüş, yüksek frekanslı titreşimler. Grup meditasyonu, topluluk pratikleri ve kolektif bilinç çalışmaları bu enerjiyle derin rezonans kurar. Teknoloji, fütüristik sanat ve bilim bu enerjiyi besler. Bedende olmak ve şimdiyi hissetmek — bu enerjinin en büyük spiritüel öğrenimidir."},
    Balık:{derin:"Neptün'ün denizlerinde yüzen, Jüpiter'in genişliğiyle beslenen ruh. Değişken Su modu onu her şeyle akış halinde tutar — katı biçimlere direnir, sınırlara karşı içgüdüsel bir direnç vardır. Spiritüel açıklık bu enerjinin en büyük armağanıdır; görünmeyeni görür, hissedilmeyeni hisseder. Gölgesinde kaybolma, kurban rolü ve gerçeklikten kaçış yatar. Gerçek potansiyeli şefkati eylemle buluşturduğunda açılır.",gezegen:"Venüs bu enerjiyle birleştiğinde koşulsuz, fedakâr ve romantik bir aşk ortaya çıkar. Ama bu sonsuz verme hali sınır çizilmediğinde tükenmişliğe dönüşür. Ay duygu ve sezgiyi birleştirir — rüyalar, imgeler ve iç ses güçlü mesajlar taşır. Mars bu burçta dolaylı ve pasif hareket eder; çatışmayı sevmez, dolaylı yollardan ilerler.",titresim:"Deniz mavisi ve leylak, dalgalı frekanslar. Su ritüelleri, müzik, şiir ve sessizlikte oturma bu enerji için doğal iyileşme kanallarıdır. Meditasyon ve spiritüel pratikler için en hazır burçlardan biridir — deneyim derinliği olağanüstü olabilir. 'Sınır çizmek sevilmemek değildir' bu enerjinin en dönüştürücü öğrenimidir."}
  };

var KARMA_STATIK={
  Koç:"Koç bu yaşamda cesaretini bilinçle kullanmayı öğrenmek için gelmiş. Ani hamleler yerine hedefe odaklı kararlılık — bu ayrım karmik büyümesinin özüdür. Öfkeyi dönüştürmeyi ve liderliği hizmetle buluşturmayı öğrendikçe ruh misyonu netleşir. Geçmiş yaşamlarda savaşçı olan bu enerji, şimdi içsel savaşı kazanmaya çağrılmıştır.",
  Boğa:"Boğa bu yaşamda güvenlik ile değişim arasındaki dengeyi bulmak için gelmiş. Karmik ders: sahip olmak ile bağlanmamak arasındaki farkı yaşamak. Maddi dünyanın güzelliğini takdir ederken ona bağımlı olmamak — bu özgürlük ruh misyonunun merkezindedir. Geçmiş yaşamlardan gelen kayıp korkusu bu seferde güvene dönüşmeye çağrılıyor.",
  İkizler:"İkizler bu yaşamda bilgiyi derinliğe dönüştürmeyi öğrenmek için gelmiş. Yüzeyden çok anlam, hızdan çok bağlantı — karmik büyüme bu yönde ilerler. Çift doğayı bütünleştirmek, zıtlıkları çatışma değil zenginlik olarak deneyimlemek ruh misyonunun özüdür. Geçmiş yaşamlarda parçalanan bu enerji, şimdi bütünleşmeye çağrılıyor.",
  Yengeç:"Yengeç bu yaşamda beslenmeyi öğrenmek kadar kendini beslemesini de öğrenmek için gelmiş. Karmik ders: başkalarını korurken kendini kaybetmemek. Geçmiş yaşamlarda anne arketipini derin biçimde yaşamış olan bu enerji, şimdi kendi ihtiyaçlarını da kutsal saymayı öğreniyor. Güvenliği içeriden inşa etmek bu ruhun misyonudur.",
  Aslan:"Aslan bu yaşamda ego merkezli parlamaktan kalp merkezli ışık saçmaya evrilmek için gelmiş. Karmik ders: tanınmak için değil, sevmek için var olmak. Geçmiş yaşamlarda liderlik ve iktidar arasındaki ince çizgide yürümüş olan bu enerji, şimdi gerçek büyüklüğün hizmette yattığını keşfediyor. Yaratıcılığını insanlığa armağan etmek ruh misyonunun doruğudur.",
  Başak:"Başak bu yaşamda mükemmeliyetten bütünlüğe geçişi öğrenmek için gelmiş. Karmik ders: hizmet etmek ile kendini silmek arasındaki farkı anlamak. Geçmiş yaşamlarda şifacı ve rahip arketipini yaşamış olan bu enerji, şimdi kendi şifasına da yönelmeyi öğreniyor. Yeterliliği içselleştirmek ve bedeni kutsal bir tapınak olarak onurlandırmak bu ruhun misyonudur.",
  Terazi:"Terazi bu yaşamda gerçek dengeyi — içsel dengeyi — bulmak için gelmiş. Karmik ders: başkalarını memnun ederken kendi sesini kaybetmemek. Geçmiş yaşamlarda ilişkilerde kimliğini eritmiş olan bu enerji, şimdi ilişki içinde tam kalmayı öğreniyor. Güzelliği ve adaleti bir arada taşımak, hem kendine hem karşısındakine dürüst olmak bu ruhun misyonudur.",
  Akrep:"Akrep bu yaşamda dönüşümü bilinçle yaşamayı öğrenmek için gelmiş. Karmik ders: kontrol etmek yerine teslim olmak — en büyük güç burada yatar. Geçmiş yaşamlarda güç ve kayıp arasında derin yaralar taşımış olan bu enerji, şimdi affetmeyi ve bırakmayı ruhsal eylem olarak deneyimliyor. Başkalarını dönüştürmek için önce kendini dönüştürmek bu misyonun özüdür.",
  Yay:"Yay bu yaşamda özgürlük ile sorumluluk arasındaki kutsal dengeyi bulmak için gelmiş. Karmik ders: anlam arayışını hayattan kaçışa dönüştürmemek. Geçmiş yaşamlarda kâşif ve öğretmen arketipini güçlü biçimde yaşamış olan bu enerji, şimdi bilgeliği paylaşmayı ve bir yerde kök salmayı da öğreniyor. İnsanlığa ilham vermek ruh misyonunun merkezindedir.",
  Oğlak:"Oğlak bu yaşamda başarının ötesinde anlam bulmayı öğrenmek için gelmiş. Karmik ders: değerini başarıyla değil, var oluşunla ölçmeyi öğrenmek. Geçmiş yaşamlarda otorite ve sorumluluk ağır yükler olarak taşınmış; bu seferki misyon o yükü bilinçle seçmektir. Ustalığını insanlığın hizmetine sunmak ve liderliğin gerçek anlamını keşfetmek bu ruhun yolculuğudur.",
  Kova:"Kova bu yaşamda insanlığın geleceğine özgün katkıda bulunmak için gelmiş. Karmik ders: devrimci enerjiyi sabotajdan yaratıcılığa çevirmek. Geçmiş yaşamlarda toplumdan dışlanma ve yanlış anlaşılma deneyimleri taşıyan bu enerji, şimdi farklılığını güç olarak konuşlandırıyor. Kolektif bilinci yükseltmek ve geleceğe köprü olmak bu ruhun en derin misyonudur.",
  Balık:"Balık bu yaşamda sınırları korurken evrensel sevgiyi yaşamayı öğrenmek için gelmiş. Karmik ders: şefkati kendini yitirmeden vermek. Geçmiş yaşamlarda kurban ve kurtarıcı rollerini defalarca yaşamış olan bu enerji, şimdi şifanın önce içeriden başladığını öğreniyor. Spiritüel derinliğini somut eylemlere dönüştürmek ve mistik bilgiyi dünyaya taşımak bu ruhun misyonudur.",
};

  // Çakra — foto çakra okuma öncelikli, statik fallback özgün metinle
  var chakraHtml = "";
  if(fp2r.chakra_aura) {
    chakraHtml += secBlok("🌀","ENERJİ MERKEZLERİ — FOTOĞRAFTAN OKUMA",fp2r.chakra_aura,"#1a365d","rgba(99,179,237,.05)");
  } else {
    var chakraStatik = CHAKRA_STATIK[sun2] || CHAKRA_STATIK["Kova"];
    chakraHtml += secBlok("🌀","ENERJİ MERKEZLERİ — ÇAKRA HARİTASI",chakraStatik,"#1a365d","rgba(99,179,237,.05)");
  }
  if(ai&&ai.a2&&ai.a2.chakra_dominant) chakraHtml += secBlok("🌟","BELİRLEYİCİ MERKEZ",ai.a2.chakra_dominant,"#1a5c2a","rgba(60,160,80,.05)");
  if(fp2r.en_aktif_chakra||fp2r.bloke_chakra){
    chakraHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:11px">';
    if(fp2r.en_aktif_chakra) chakraHtml += '<div style="padding:10px;border-radius:10px;background:rgba(60,160,80,.07);border:1px solid rgba(60,160,80,.2);text-align:center"><div style="font-size:9px;font-weight:900;color:#1a5c2a;margin-bottom:4px">🌟 EN AKTİF</div><div style="font-size:12px;font-weight:800;color:#111">'+fp2r.en_aktif_chakra+'</div></div>';
    if(fp2r.bloke_chakra&&fp2r.bloke_chakra.toLowerCase()!=="yok") chakraHtml += '<div style="padding:10px;border-radius:10px;background:rgba(200,50,50,.06);border:1px solid rgba(200,50,50,.15);text-align:center"><div style="font-size:9px;font-weight:900;color:#8b1a1a;margin-bottom:4px">🔒 BLOKE</div><div style="font-size:12px;font-weight:800;color:#111">'+fp2r.bloke_chakra+'</div></div>';
    chakraHtml += '</div>';
  }
  safe("p4-chakra","html",chakraHtml);

  // Astro — enerji imzası + ruh misyonu + gezegen dokusu (farklı başlık ve açı)
  var astroHtml = "";
  var enerjIci = pr.enerji_imzasi || (ai&&ai.a2&&ai.a2.enerji_titresim) || (ASTRO_STATIK[sun2]||ASTRO_STATIK["Kova"]).titresim;
  var misyonIci = pr.donusum || (ai&&ai.a2&&ai.a2.karma_misyon) || (ASTRO_STATIK[sun2]||ASTRO_STATIK["Kova"]).derin;
  var gezegenIci = (ai&&ai.a2&&ai.a2.gezegen_yorumu) || (ASTRO_STATIK[sun2]||ASTRO_STATIK["Kova"]).gezegen;
  astroHtml += secBlok("✦","ENERJİ İMZASI — ODADAKİ İZ",enerjIci,"#b8860b","rgba(212,175,110,.06)");
  astroHtml += secBlok("🌠","RUHUN AMACI & DÖNÜŞÜM YOLU",misyonIci,"#4a1a7a","rgba(100,50,150,.05)");
  astroHtml += secBlok("🪐","GEZEGEN DOKUSU & DUYGUSAL KÖK",gezegenIci,"#2d1b69","rgba(155,127,212,.05)");
  safe("p4-astro","html",astroHtml);

  safe("p4-guclu","text",(ai&&ai.a2&&ai.a2.gucler)?ai.a2.gucler:fp2r.guclu||p2.str||"");
  safe("p4-gizli","text",(ai&&ai.a2&&ai.a2.zorluklar)?ai.a2.zorluklar:fp2r.gizli||p2.shadow||"");
  safe("p4-iliski","text",(ai&&ai.a2&&ai.a2.iliski)?ai.a2.iliski:fp2r.iliski_stili||p2.attach||p2.love||"");
  var karizmaTxt = pr.enerji_imzasi || fp2r.karizma_notu || (ai&&ai.a2&&ai.a2.aciklama) || ((AURA[sun2]||AURA["Kova"]).r+" enerjisi — "+(AURA[sun2]||AURA["Kova"]).d);
  safe("p4-karizma","text",karizmaTxt||"");
  var karmaTxt = pr.donusum || (ai&&ai.a2&&ai.a2.karma_misyon) || (KARMA_STATIK[sun2]||KARMA_STATIK["Kova"]);
  safe("p4-karma","text",karmaTxt||"");

  // ─── TAB 5: TAKTİK — GENİŞLETİLMİŞ ÇİFT PERSPEKTİF ───
  var taktikVeri = ai&&ai.taktik ? ai.taktik : {};
  function taktikBlok(ikon,baslik,icerik,renk,bg){
    if(!icerik||icerik.length<3) return "";
    return '<div style="padding:14px 16px;border-radius:13px;background:'+bg+';border:1px solid '+renk+'44;margin-bottom:13px">'+
      '<div style="font-family:Cinzel,serif;font-size:10px;letter-spacing:1.4px;color:'+renk+';font-weight:900;margin-bottom:10px">'+ikon+' '+baslik+'</div>'+
      '<div style="font-size:13px;color:#111;line-height:1.95">'+icerik+'</div></div>';
  }
  var STRATEJILER={
    Koç:\`Doğrudan, cesur ve kendinden emin yaklaş — Koç duraksayan biri değil, hamlede bulunan birini fark eder. Rekabetçi ortamlarda yan yana gelmek idealdir; meydan okuma enerjisi ilgiyi anında yakalar. Zayıflık gösterme ama saygısızlık da etme: net sınır koy, kararlı dur. Bu kişi pasif ve edilgen yaklaşımdan çok çabuk sıkılır — eylem ve spontane kararlar çekicidir. İlk hamlede belirsizlik bırakma; net ve özgüvenli bir duruş kapı araladığın andır. ⚠ UYARI: Koç'a "ne zaman karar vereceksin?" baskısı yapmak anında soğuma yaratır.\`,
    Boğa:\`Sabır bu ilişkinin en güçlü stratejik aracıdır — acele kesinlikle kontraproduktif. Kaliteli mekanlar, duyusal deneyimler ve güzel ortamlar güveni nazikçe açar; estetik dikkat göze çarpar. Her görüşmede biraz daha içten ol, ama adımları Boğa'nın sindirme hızına göre ayarla. Maddi ve duygusal istikrar sinyalleri ver — bu kişi güvenilirliği ödüllendirir. ⚠ UYARI: Ani plan değişikliği, geceden geceye farklı biri olmak veya tutarsız mesajlar güveni çok hızlı eritir.\`,
    İkizler:\`Zihinsel bağ kurulmadan duygusal yakınlık mümkün değil — entelektüel sohbet birincil çekim aracın. Merak uyandıran sorular sor, farklı konular açıp kapat, her buluşmada farklı bir renk getir. Esprili ve hafif ol ama derinliği de göster; ikisini dengeleyen biri nadirdir ve dikkat çeker. Tutarsızlık güven erozyonudur — söylediklerini yap. ⚠ UYARI: Monotonluk ve tekrarcı konuşmalar bu kişide ilgiyi yok eder; dramatik duygusal sahneler onu kaçırır.\`,
    Yengeç:\`Güven ve emniyet hissi bu ilişkinin temeli — aceleci her adım geri tepebilir. Ailesi ve yakın çevresi hakkında gerçek merak ve ilgi göster; bu kişi için en değerli sinyallerden biridir. Yengeç'e güven inşa etmek zaman alır; küçük tutarlı adımlarla, nazikçe örülür. İlk izlenim yumuşak ve samimi olmalı — eleştirel bir ton savunma duvarını hemen kaldırır. ⚠ UYARI: Ani soğuma, uzaklaşma veya duygusal tutarsızlık bu kişide derin iz bırakır ve kolayca kapanmaz.\`,
    Aslan:\`Onu samimi biçimde gör ve takdir et — sahte iltifatı anında fark eder ve bu affedilmez. Özel anlar ve görkemli jestler yaratmak etkilidir; ama kalabalıkta değil, bire bir hissettirmek daha derin iz bırakır. Kendi tarzını ve özgüvenini göster — Aslan'ın enerjisi yanında parlayan biri arar, sönükleşeni değil. ⚠ UYARI: Başkalarının önünde eleştiri veya küçük düşürme bu kişi için telafisi çok zor bir kırılma yaratır.\`,
    Başak:\`Zekanı ve özenini her adımda hissettir — söylediğini yap, yazdığını tut. Bu kişinin çekim aracı güvenilirlik ve tutarlılıktır; detaylara gösterilen dikkat fark yaratır. Eleştirilerini ciddiye al ve geri dönüş yap — Başak kendini anlaşılmak ister. ⚠ UYARI: Dağınıklık, sorumsuzluk ve söz tutmamak güven kırılmasına doğrudan giden en kısa yoldur; sağlık ve hijyen konularında dikkatsizlik anında fark edilir.\`,
    Terazi:\`Zarif ve dengeli bir ilk izlenim bırak — estetik ortamlar ve güzel deneyimler kapı açar. Gerçek düşüncelerini söylemek için güvenli alan yarat; bu kişi çatışmadan kaçındığı için baskı altında gerçeğini paylaşmaz. Karar baskısı yapma — ya şimdi ya hiç tutumu mesafeyi garantiler. ⚠ UYARI: Agresif veya çatışmacı bir ton, zorlayıcı davranış bu kişi için çekilmez; dengeyi bozan her şey geri çekilmeyi tetikler.\`,
    Akrep:\`Yüzeysel ve sahte hiçbir şey bu kişinin radarından kaçmaz; derinlik ve otantiklik tek geçerli yaklaşımdır. Gizem bırak — her şeyi ilk seferinde açıklamak çekimi yok eder. Güveni yavaş ve dikkatli inşa et: bir kez kırılırsa geri kazanmak neredeyse imkânsız. ⚠ UYARI: İhanet, yalan veya gizli gündem bu kişi için kesinlikle bitiştir; kontrolcü ve manipülatif davranış derin direnç yaratır.\`,
    Yay:\`Macera ve özgürlük enerjisi ver — bu ilişkiyi kısıtlayıcı değil, genişletici hissettir. Felsefi tartışmalar, ortak maceralar ve büyük hayaller bağ kurar. Arkadaşlık temelli başlamak çok daha sağlam zemin oluşturur. ⚠ UYARI: Kısıtlama, kontrol ve neredesin baskısı özgürlüğe saldırı gibi hissedilir ve kaçma tepkisini anında tetikler.\`,
    Oğlak:\`Ciddi, hedefli ve güvenilir görün — bu kişi için ilişki de bir yatırım gibidir. Hırsını, vizyonunu ve uzun vadeli hedeflerini paylaş; benzer bir yaşam perspektifi çekim yaratır. Söz ver ve tut — tutarsızlık bu kişide güven kaybına doğrudan yol açar. ⚠ UYARI: Sorumsuzluk, tembellik ve hedefsizlik Oğlak için saygı erimesinin başlangıcıdır; duygusal drama ve dramatik krizler yıldırır.\`,
    Kova:\`Alışılmışın dışında ol — kalıpları kıran, farklı düşünen biri dikkat çeker. Dünyayı değiştirme hayallerinden, toplumsal projelerden, özgün fikirlerden konuş. Arkadaşlıkla başla; Kova duygusal yoğunluktan kaçar, zihinsel bağ önce gelir. ⚠ UYARI: Konformizm baskısı, herkes böyle yapıyor argümanı ve özgürlük kısıtlaması bu kişiyi anında kapatır.\`,
    Balık:\`Ruhani ve duygusal derinliğine gerçekten dokun — Balık sahteliği enerjisinde hisseder. Sanat, müzik, spiritüellik ve empati bu ilişkinin ortak zeminleri. Ne söylediğinden çok nasıl hissettirdiğin belirleyicidir. ⚠ UYARI: Kaba ve duyarsız davranışlar derinden yaralar; hayallerini küçümsemek veya gerçekçi ol baskısı bu kişiyi kapatır.\`
  };
  var ILETISIM={
    Koç:\`Doğrudan ve net iletişim kur — uzun mesajlar veya belirsizlik sabırsızlandırır ve ilgiyi azaltır. Konuya direkt gir, hızlı yanıtlar ver. Spontane öneriler ve ani kararlar bu kişiyle işe yarar; mesajlarında eylem ve enerji taşı. ⚡ Pratik ipucu: Bir fikir öner, tartışmaya açmak yerine şunu yapalım de.\`,
    Boğa:\`Yavaş, düşünceli ve tutarlı iletişim — kısa ama içten mesajlar güven inşa eder. Sesli veya yüz yüze konuşma metin mesajından çok daha derin bağ kurar. Ani değişiklikler veya sürpriz planlar stresi artırır — önceden bildir, rutini kırma. ⚡ Pratik ipucu: Hep söyleyeceğim ama bugün söylüyorum türü içten bir mesaj güçlü etki yaratır.\`,
    İkizler:\`Zeki ve esprili mesajlar, oyunlu ve merak uyandıran bir dil. Hem derinlik hem hafifliği dengele — bu birleşim nadirdir ve dikkat çeker. Uzun sessizlikler ilgisini kaybettirir; düzenli küçük temas noktaları oluştur. ⚡ Pratik ipucu: Bunu sana sormadan rahat edemezdim açılışı merak kancası atar.\`,
    Yengeç:\`Duygusal tonla, nazikçe iletişim kur — Nasılsın sorusunu gerçekten sor ve dinle, geçiştirme. Gecenin ilerleyen saatlerinde daha derin paylaşımlar açılır; bu ritmi fark et. Samimi ve ılık mesajlar güven köprüsü kurar. ⚡ Pratik ipucu: Önceki konuşmadan bir detayı hatırlayıp geri getirmek derin etki yaratır.\`,
    Aslan:\`Tutkulu ve coşkulu dil — onu gördüğünü hissettiren içten mesajlar. Sesli veya video iletişimde enerjin çok daha etkili taşınır. Söylediklerini hatırlayıp geri getirmek büyük etki yaratır. ⚡ Pratik ipucu: Seninle konuşurken farklı hissediyorum gibi özgün iltifatlar sahte iltifattan çok daha güçlüdür.\`,
    Başak:\`Detaylı, düşünceli ve açık mesajlar — yazım ve dikkat hatası olumsuz izlenim bırakır. Söylediklerini takip et ve geri dön. Analitik sorular sorabilirsin, bundan keyif alır. ⚡ Pratik ipucu: Bir önceki konuşmada öğrendiğin bir detayla açılmak gerçekten dinledin mesajı verir.\`,
    Terazi:\`Zarif ve dengeli dil — çatışmacı ton kapıları hızla kapatır. Seçenekler sun ama karar baskısı yapma; fikirlerine ortak etmek yakınlaşmayı hızlandırır. ⚡ Pratik ipucu: İki seçenek var, sence hangisi daha güzel yaklaşımı hem katılım hem seçim özgürlüğü verir.\`,
    Akrep:\`Az söyle, anlam yükle — yüzeysel konuşmalar zaman kaybıdır. Doğrudan derine git ya da hiç gitme. Sessizlik de güçlü bir iletişim aracı. ⚡ Pratik ipucu: Gizem bırak — her şeyi bir seferde açıklamak çekimi anında azaltır; bunu başka zaman anlatayım etkisi güçlüdür.\`,
    Yay:\`Enerjik, ilham verici ve özgür tonlu mesajlar — felsefi sorular ve macera önerileri ilgi çeker. Spontane ve neşeli ol; çok ciddi ve ağır bir dil boğar. ⚡ Pratik ipucu: Sence şu anda neden buradayız gibi varoluşsal bir soru bu kişiyle anında derin konuşmaya kapı açar.\`,
    Oğlak:\`Profesyonel ve net iletişim — söz ver ve tut. Duygusal dramatizm ve belirsizlikten kaçın; zaman duyarlılığına saygı göster. ⚡ Pratik ipucu: Bir plan öner ve zamanında gerçekleştir; bu kişide güven banka hesabı tutarlı adımlarla dolar.\`,
    Kova:\`Yenilikçi fikirler, toplumsal konular veya ilginç kavramlar üzerinden konuş. Duygusal mesajlar yerine zihinsel uyarım. Kendi özgün tarzında yaz. ⚡ Pratik ipucu: Bunu sadece sana sormak istiyorum — gerçekten ne düşünüyorsun açılışı Kova için tam bir davet.\`,
    Balık:\`Şiirsel ve duygusal mesajlar — anlam katmanlı ol. Seni düşündüm mesajları derin etki yaratır. Müzik veya sanat paylaş. ⚡ Pratik ipucu: Bugün bana seni hatırlatan bir şey gördüm türü mesajlar bu kişi için sıradan bir iletişimi anlam yüklü bir ana dönüştürür.\`
  };
  var KACIN={
    Koç:\`🚨 Pasiflik ve kararsızlık bu kişide çok hızlı ilgi kaybına yol açar — hareketsizlik çekim öldürür. Sözünü tutmamak ve yarım bırakmak güveni anında yıkar; bir kez kırılan güven Koç için çok zor tamir edilir. Otoriteyi sürekli sorgulamak veya eleştiri yağmuru savunmaya çeker. İlk dönemde fazla bağımlı görünmek itici gelir. Drama ve süregelen şikayetler egoya yük bindirir ve ilgiyi öldürür.\`,
    Boğa:\`🚨 Ani ve açıklanmayan değişiklikler güveni en hızlı eriten davranışlardır. Maddi sorumsuzluk veya istikrarsızlık sinyalleri güven kırılmasına doğrudan yol açar; bu kişi için istikrar temel beklentidir. Acelecilik veya baskı direnci artırır. Sahtecilik ve zorla yüklenen duygusallık anında hissedilir.\`,
    İkizler:\`🚨 Monotonluk ve tekrar bu kişinin ilgisini hızla öldürür — sürprizsiz, aynı ritimde devam eden bir ilişki sıkıştırır. Dramatik duygusal krizler kaçışı tetikler; duygusal yükleme özgürlük alanını daraltır. Tutarsız ve öngörülemeyen davranış güven erozyonu yaratır.\`,
    Yengeç:\`🚨 Duygusal tutarsızlık ve ani soğuma bu kişide çok derin yara açar — ve bu yara kolay kapanmaz. Aile ve geçmişe yönelik saygısızlık telafisi zor bir hasar yaratır. İçe kapandığında zorla açmaya çalışmak tepkiyi artırır.\`,
    Aslan:\`🚨 Aleni eleştiri — özellikle başkalarının önünde — bu kişi için kesinlikle tolere edilemez bir sınır ihlalidir. İlgisizlik veya değer vermiyormuş gibi davranmak soğumayı garantiler. Kıskançlıktan gelen saldırılar savunmayı anında aktive eder.\`,
    Başak:\`🚨 Dağınıklık, sorumsuzluk ve söz tutmamak bu kişide güven kırılmasının doğrudan tetikçisidir. Fazla dramatik ve irrasyonel davranışlar yıpratır. Eleştirilerini görmezden gelmek büyük kırılmaya zemin hazırlar.\`,
    Terazi:\`🚨 Agresif, zorlayıcı ve çatışmacı davranışlar bu kişiyle kapıları en hızlı kapatan şeydir. Ya şimdi ya hiç baskısı ilişkiyi hemen gerer. Karar almaya zorlamak veya seçenekleri kısıtlamak mesafe yaratır.\`,
    Akrep:\`🚨 İhanet, yalan ve saklı gündem — bunlardan biri yaşanırsa dönüşü yoktur. Güven bir kez kırılırsa Akrep için telafi edilemez. Yüzeysellik, sahtecilik ve manipülasyon anında hissedilir. Gizlilik ihlali ilişkiyi bitirir.\`,
    Yay:\`🚨 Kısıtlama ve kontrol bu kişi için özgürlüğüne saldırı gibi hissedilir ve kaçmayı tetikler. Neredesin sorusu tekrarlandığında baskı gibi okunur. Felsefeye ve inançlara saygısızlık ortak zemini yok eder.\`,
    Oğlak:\`🚨 Sorumsuzluk ve hedefsizlik bu kişi için saygı erimesinin başlangıcıdır. Güvenilmez davranışlar — geç kalmak, söz tutmamak — ilişkiyi adım adım zedeler. Başarı ve itibarına yapılan saygısızlık derin kırılmaya yol açar.\`,
    Kova:\`🚨 Herkes böyle yapıyor baskısı ve konformizm talebi bu kişiyi anında kapatır. Özgürlük kısıtlaması uzaklaşmayı garantiler. Fikirleri küçümsemek güveni en hızlı yıkan davranışlardan biridir. Kalıplaşmış ilişki beklentileri sıkıştırır.\`,
    Balık:\`🚨 Kaba, sert ve duyarsız davranışlar bu kişide derinden iz bırakır ve kolay silinmez. Hayallerini küçümsemek veya gerçekçi ol baskısı kendini ifade etmesini kapatır. Empati yoksunluğu anında hissedilir.\`
  };

  safe("t5-strateji","html", taktikBlok("🎯","2. KİŞİYE YAKLAŞIM STRATEJİSİ",taktikVeri.strateji||STRATEJILER[sun2]||STRATEJILER["Kova"],"#7a4a00","rgba(212,175,110,.06)"));
  safe("t5-iletisim","html", taktikBlok("💬","İLETİŞİM KODU — NE NASIL SÖYLENMELI",taktikVeri.iletisim||ILETISIM[sun2]||ILETISIM["Kova"],"#2d4a8a","rgba(99,149,255,.05)"));
  safe("t5-kacin","html", taktikBlok("🚨","KESİN SINIRLAR — YAPILMAMASI GEREKENLER",taktikVeri.kacin||KACIN[sun2]||KACIN["Kova"],"#8b1a1a","rgba(200,50,50,.06)"));
  safe("t5-randevu","html", taktikBlok("🌹","RANDEVU & ORTAM — EN UYGUN SAHNELER",taktikVeri.randevu||("Bu burcun en açık olduğu ortam "+ELEM[sun2]+" elementinin ruhunu taşıyan mekanlar — doğa, sanat veya anlam dolu aktiviteler ortak zemin yaratır. Büyük kalabalıklar yerine özel ve samimi ortamları seç. Birlikte bir şeyler yaratmak veya keşfetmek bağı pekiştirir. 🎯 İpucu: 'Gidelim mi?' yerine 'Şu yere gitmek istiyorum, seninle gitmek istedim' daha güçlüdür."),"#7a1040","rgba(232,160,192,.06)"));
  safe("t5-guclu","html", taktikBlok("⭐","1. KİŞİNİN GÜÇLÜ TUTMASI GEREKEN YÖNLER",taktikVeri.guclu_tut||("Kova enerjisinin vizyoner, bağımsız ve insancıl yapısı bu ilişkide en büyük çekim gücüdür — bunu saklamak yerine vurgula. Özgünlüğünü ve farklılığını koşulsuz göster; bu kişi standart insanı değil, öne çıkan biri arar. Büyük fikirler ve toplumsal duyarlılık bu kişiyle rezonans yaratır. ⭐ Kritik: Duygusal baskı yapmadan açık kalmak — bu iki şeyi aynı anda yapabilen biri olduğunu hissettir."),"#1a5c2a","rgba(60,160,80,.06)"));
  safe("t5-dikkat","html", taktikBlok("⚡","KRİTİK UYARILAR — İLİŞKİYİ YÖNETİRKEN",taktikVeri.dikkat||("⚠ Her iki taraf da özgürlük ihtiyacını korurken bağ kurmaya çalışıyor — bu dengeyi kurmak bu ilişkinin en büyük sınavı. İletişim kopukluğu yaşandığında varsayım değil, soru sor; sessiz anlaşmazlıklar birikerek kırılganlık yaratır. ⚠ Beklentiler söylenmeden birikirse iki taraf da hayal kırıklığına uğrar — erken ve açık konuşmak en sağlam strateji. Dönemsel olarak 'bu ilişki bize ne katıyor?' sorusunu birlikte sormak bağı canlı tutar."),"#5a3a8a","rgba(150,100,200,.06)"));
  safe("t5-uzunvade","html", taktikBlok("🌠","UZUN VADELİ UYUM HARİTASI",taktikVeri.uzun_vade||("İlk 3 ay: Çekim güçlü, enerji yüksek — bu dönemde gerçek uyumu test etmek için birlikte bir zorluktan geçmek değerlidir. 6. ay kritik eşik: Frekanslar netleşir, farklılıklar belirginleşir — bu dönemde diyalog kurulanlar kalıcı bağ kurar. Ortak büyüme vizyonu ve paylaşılan anlam bu ikiliği zamana taşıyan ana yakıttır. 🌠 Uzun vadeli güç: Birbirini küçümsemeden farklı olmak — bu iki kişi için en nadir ve en değerli kazanım."),"#2d5a8a","rgba(100,149,220,.05)"));
  safe("t5-gunluk","html", taktikBlok("📅","BU HAFTA İÇİN SOMUT ADIMLAR",taktikVeri.gunluk||("📌 Bugün: İlgi alanına dair içten ve özgün bir soru veya gözlemle başla — genel bir 'nasılsın' değil. 📌 Bu hafta: Ortak bir aktivite veya konuşma ortamı yarat; öneriyi net ve kararlı yap. 📌 Bu ay: Güven inşasına odaklan — bir söz ver, zamanında yerine getir. Küçük ama tutarlı adımlar büyük jestlerden çok daha güçlü bir zemin oluşturur."),"#5a7a2a","rgba(100,160,60,.05)"));

  // Yeni bölümler — ayrı divlere
  safe("t5-ilkmesaj","html", taktikBlok("💌","İLK MESAJ & AÇILIŞ STRATEJİSİ",taktikVeri.ilk_mesaj||("İlk mesaj için altın kural: kısa, özgün ve karşılık bekletir nitelikte. Genel bir 'merhaba güzel' yerine ortak bir ilgi noktasına dokunan ya da merak uyandıran bir gözlem çok daha güçlüdür. 💌 Örnek açılış tonu: 'Sana şunu sormak istedim — [ilgisi olan bir konu]. Seni bu konuda ne düşünüyor merak ettim.' Yanıt beklemeden takip mesajı gönderme; sabır ilk aşamada en güçlü araçlarından biri."),"#7a4a6a","rgba(180,100,160,.06)"));
  safe("t5-hediye","html", taktikBlok("🎁","HEDİYE, JEST & SÜRPRIZ FİKİRLERİ",taktikVeri.hediye||("Bu burç için en etkili jest maddi değeri yüksek hediyeden çok kişisel anlam taşıyan detaydır. Geçmiş bir konuşmadan hatırlanmış küçük bir şey sıradan bir hediyeden çok daha derin iz bırakır. 🎁 Öneriler: İlgi alanına özel bir kitap veya deneyim; favori müzik veya sanatçısına dair özgün bir atıf; 'bunu görünce seni düşündüm' notu eşliğinde gönderilen bir şey. Sürprizin zamanlaması içeriği kadar önemlidir."),"#7a3040","rgba(200,80,100,.05)"));
  safe("t5-dinamik","html", taktikBlok("🔮","İKİ KİŞİNİN KARŞILIKLİ DİNAMİĞİ",ai&&ai.dinamik||("Kova ve "+sun2+" bu ilişkide farklı frekanslardan gelen iki enerji olarak buluşuyor: biri sistemi sorgulamayı, diğeri dengeleri yönetmeyi öncelikler. Bu fark hem güçlü bir tamamlayıcılık zemini hem de potansiyel sürtüşme noktası. 🔮 Güç dengesi: Her iki taraf da kendi enerji alanını korurken birlikte büyüyebilmek bu ilişkinin gerçek potansiyelini açar. Birinin haklılığı üzerine kurulan dinamikler yerine ne öğreniyoruz? sorusu üzerine kurulan bir zemin bu ikiliği uzun vadede taşır."),"#5a3a5a","rgba(150,80,150,.05)"));


  document.getElementById("result").style.display = "block";
  setTimeout(function(){
    document.getElementById("result").scrollIntoView({behavior:"smooth",block:"start"});
  }, 150);
}

// ═══ ÇAKRA SOLO ══════════════════════════════════
var CH_DESC_COMP = [
  ["Güvenlik zemini uyumlu","Güvenlik ihtiyaçları farklı","Bu alanda çalışmak faydalı"],
  ["Yaratıcılık ve tutku uyumlu","Duygusal tarzlar farklı ama tamamlayıcı","Duygusal ifadeyi birlikte keşfedin"],
  ["Güç dengesi mükemmel","Kişisel sınırlara saygı önemli","Güç dinamiği üzerinde çalışın"],
  ["Kalp bağı derin ve güçlü","Sevgi ifadesi farklı ama samimi","Kalbi açık tutmak önemli"],
  ["İletişim berrak ve uyumlu","Farklı tarzlar köprüyle aşılabilir","Bilinçli iletişim kurun"],
  ["Sezgi ve vizyon örtüşüyor","Perspektifler farklı ama zenginleştirici","Sezgisel bağı geliştirin"],
  ["Ruhsal bağlantı çok güçlü","Spiritüel yollar farklı ama birleşebilir","Birlikte spiritüel pratik önerilir"]
];

function buildChakraHTML(scores, mode) {
  var descs = CH_DESC_COMP;
  return CHAKRA_D.map(function(c,i){
    var v = Math.min(99, Math.max(22, scores[i]||50));
    var di = v>=70?0:v>=50?1:2;
    return '<div class="chrow"><div class="chdot" style="background:'+c.c+'22;border:1.5px solid '+c.c+'55">'+c.e+'</div>'+
      '<div class="chi"><div class="chnm">'+c.n+' Çakra</div>'+
      '<div class="chbr"><div class="chbg"><div class="chfill" style="width:'+v+'%;background:'+c.c+'"></div></div>'+
      '<span class="chpct" style="color:'+c.c+'">'+v+'%</span></div>'+
      '<div class="chdsc">'+descs[i][di]+'</div></div></div>';
  }).join("");
}

function buildEnergyHTML(e, cols) {
  return [{k:"freq",l:"Frekans"},{k:"vib",l:"Titreşim"},{k:"mag",l:"Manyetizm"},{k:"bal",l:"Denge"}]
    .map(function(c,i){
      var v = Math.min(99, Math.max(22, e[c.k]||50));
      return '<div class="mtr"><div class="mlbl">'+c.l+'</div>'+
        '<div class="mval" style="color:'+cols[i]+'">'+v+'<span style="font-size:9px;opacity:.4">%</span></div>'+
        '<div class="mbar"><div class="mfill" style="width:'+v+'%;background:'+cols[i]+'"></div></div>'+
        '<div class="mnote">'+(v>=70?"Güçlü":v>=50?"Gelişiyor":"Dikkat")+'</div></div>';
    }).join("");
}

function buildPlanetChips(d) {
  return [["☀️","Güneş",d.sun],["⬆️","Yükselen",d.rising],["🌙","Ay",d.moon],
          ["♀","Venüs",d.venus],["♂","Mars",d.mars],["☿","Merkür",d.mercury],
          ["♃","Jüpiter",d.jupiter],["♄","Satürn",d.saturn]]
    .map(function(p){ return '<span class="pchip">'+p[0]+' '+p[1]+': '+(p[2]||"?")+'</span>'; }).join("");
}

function buildSoloChakraText(scores, sign) {
  var avg = Math.round(scores.reduce(function(a,b){return a+b;},0)/7);
  var cnames = ["Kök","Sakral","Solar Pleksus","Kalp","Boğaz","Üçüncü Göz","Taç"];
  var strongest = scores.indexOf(Math.max.apply(null,scores));
  return "<strong>Ortalama Çakra: %"+avg+"</strong> — "+(avg>=75?"Çakra sistemi güçlü ve aktif.":avg>=60?"Genel olarak dengeli.":"Bazı alanlarda gelişim var.")+"<br><br>"+
    "<strong>En Aktif: "+cnames[strongest]+" Çakrası (%"+scores[strongest]+")</strong>";
}

function buildEnergyText(e, sign) {
  return "<strong>⚡ Enerji Frekansı: %"+e.freq+"</strong> — "+(e.freq>=75?"Yüksek frekans.":e.freq>=55?"Dengeli enerji.":"İçe dönük enerji.")+"<br><br>"+
    "<strong>🌊 Titreşim: %"+e.vib+"</strong> — "+(e.vib>=75?"Yüksek titreşim.":e.vib>=55?"Dengeli titreşim.":"Daha sakin titreşim.");
}

// ═══ SİNASTRİ ════════════════════════════════════
function calcSynastry(bp1, bp2, cd1, cd2, sun2, ri2, el1, el2) {
  var ELEM_MAP = {Koç:"Ateş",Boğa:"Toprak",İkizler:"Hava",Yengeç:"Su",Aslan:"Ateş",Başak:"Toprak",Terazi:"Hava",Akrep:"Su",Yay:"Ateş",Oğlak:"Toprak",Kova:"Hava",Balık:"Su"};
  var MOD_MAP = {Koç:"Kardinal",Boğa:"Sabit",İkizler:"Değişken",Yengeç:"Kardinal",Aslan:"Sabit",Başak:"Değişken",Terazi:"Kardinal",Akrep:"Sabit",Yay:"Değişken",Oğlak:"Kardinal",Kova:"Sabit",Balık:"Değişken"};
  var SIGN_ORDER = ["Koç","Boğa","İkizler","Yengeç","Aslan","Başak","Terazi","Akrep","Yay","Oğlak","Kova","Balık"];
  function signAngle(s1,s2){
    var i1=SIGN_ORDER.indexOf(s1),i2=SIGN_ORDER.indexOf(s2);
    if(i1<0||i2<0) return 60;
    var d=Math.abs(i1-i2)*30;
    return d>180?360-d:d;
  }
  function aspectType(angle){
    if(angle<=10) return {name:"Kavuşum ☌",score_add:20,desc:"Enerji birleşimi"};
    if(Math.abs(angle-60)<=8) return {name:"Sekstil ⚹",score_add:15,desc:"Uyumlu akış"};
    if(Math.abs(angle-90)<=8) return {name:"Kare □",score_add:-15,desc:"Gerilim dinamiği"};
    if(Math.abs(angle-120)<=8) return {name:"Trigon △",score_add:20,desc:"Doğal ahenk"};
    if(Math.abs(angle-150)<=8) return {name:"Yod ⚻",score_add:-5,desc:"Karmik ayar noktası"};
    if(Math.abs(angle-180)<=8) return {name:"Karşıtlık ☍",score_add:-8,desc:"Güçlü çekim-itme"};
    return {name:"Bağlantı",score_add:3,desc:"Zayıf enerji akışı"};
  }
  var pairs = [
    {p1:"venus",p2:"mars",label:"Venüs–Mars",w:4,icon:"💕⚡",
      pos:"Venüs ve Mars arasındaki bu bağ, ilişkinin duygusal sıcaklıkla fiziksel enerjiyi harmanlayan en güçlü köküdür. Sevgi dili ve arzu dili birbiriyle konuşuyor; biri çekiyor, diğeri yanıt veriyor. Bu dinamik zamanla derinleşir ve ilişkiye hem tutku hem güven katar.",
      neg:"Venüs ve Mars farklı tempolardan geliyor — biri yavaş ve derin his isterken diğeri anlık ve doğrudan ifadeyi tercih ediyor. Bu fark anlaşılmadan bırakılırsa, sevgiye dair yanlış anlamalar birikerek mesafeye dönüşebilir. Konuşulduğunda ise tamamlayıcı bir güce dönüşme potansiyeli taşıyor."},
    {p1:"sun",p2:"moon",label:"Güneş–Ay",w:4,icon:"☀️🌙",
      pos:"Güneş ve Ay sinastride en temel uyum noktasıdır — kimlik ve duygular aynı ritme giriyor. Biri kararlılık ve yön getirirken diğeri sezgi ve derinlik sunuyor. Bu temas, birbirini tamamlayan iki enerji arasında doğal bir anlayış ve içgüdüsel bir yakınlık yaratır.",
      neg:"Güneş ve Ay farklı ihtiyaçlarla buluşuyor: biri tanınmak ve görülmek isterken diğeri güven ve duygusal sürekliliğe ihtiyaç duyuyor. Bu farkın farkında olunmadığında, biri fazla aklıyla biri fazla kalbiyle yaklaşıyor gibi hissedilir. Farkındalıkla yönetildiğinde ise bu zıtlık ilişkiyi dengeler."},
    {p1:"venus",p2:"venus",label:"Venüs–Venüs",w:3,icon:"💕💕",
      pos:"Her iki kişi de sevgiyi benzer bir dille ifade ediyor ve alıyor. Ne tür ortamlarda, ne tür jestlerle, hangi ritüellerle sevilmek istedikleri örtüşüyor. Bu uyum, birbirini anlamak için ekstra çaba gerektirmeden sevginin akmasını sağlıyor.",
      neg:"Venüs pozisyonları farklı olduğunda iki kişi sevgiyi farklı biçimde gösteriyor ve alıyor. Biri sözel ifadeyle, diğeri dokunuş ya da eylemle sevgi hissettiğinde, iyi niyetli jestler bile kaybolabiliyor. Bu farkı anlamak ilişkide yanlış anlamaların önüne geçer."},
    {p1:"moon",p2:"moon",label:"Ay–Ay",w:3,icon:"🌙🌙",
      pos:"Duygusal dil ortaktır — ikisi de benzer ritimlerle hissediyor, benzer şeylerden güvenlik ve huzur alıyor. Biri bunaldığında diğeri içgüdüsel olarak nasıl yaklaşacağını biliyor. Bu uyum, ilişkiye derin bir duygusal güvenlik zemini kazandırır.",
      neg:"Duygusal ritimler farklı tempoda çalışıyor. Biri içine çekilirken diğeri yakınlık arıyor; biri konuşmak isterken diğeri sessizliğe ihtiyaç duyuyor. Bu fark yorucu olabilir ama zamanla her biri diğerinin ihtiyacını öngrenmeyi öğrenir."},
    {p1:"sun",p2:"sun",label:"Güneş–Güneş",w:3,icon:"☀️☀️",
      pos:"İki güneş aynı frekansta titreşiyor. Yaşama bakış açıları, öncelik verdikleri değerler ve kişilik yapısının temel katmanları uyumlu. Bu ortaklık, uzun vadede aynı yönde yürüyebilmeyi ve birbirini temel düzeyde anlamayı mümkün kılıyor.",
      neg:"Güneşlerin farklı burçlarda olması iki ayrı yaşam vizyonunu beraberinde getirebilir. Biri özgürlüğü önceliklendirirken diğeri güvenliği arayabilir; biri bireysel gelişime odaklanırken diğeri ilişkiyi merkeze alabilir. Bu farkı diyalogla köprülemek gerekiyor."},
    {p1:"rising",p2:"rising",label:"Yükselen–Yükselen",w:2,icon:"⬆️⬆️",
      pos:"Yükselen burçlar örtüştüğünde iki kişi birbirini ilk andan itibaren tanıdık hissediyor. Dünyaya sunulan yüz benzer; sosyal davranış kalıpları, ilk izlenimler ve dış enerjinin yönetimi uyumlu. Bu, birlikte ortamlarda rahat olmayı ve ortak bir sosyal ritme girmeyı kolaylaştırır.",
      neg:"Yükselen burçlar farklı olduğunda iki kişi dünyaya farklı maskeler takıyor. Biri içe dönük ve sakin görünürken diğeri dışa dönük ve enerjik; biri formal, diğeri spontane. Bu fark ilk izlenimde yanlış okuma yaratabilir ama birbirini tanıdıkça daha az önem taşır."},
    {p1:"mercury",p2:"mercury",label:"Merkür–Merkür",w:2,icon:"🧠🧠",
      pos:"İletişim kanalı açık ve doğal akıyor. Konuşma tempoları benzer, düşünce yapıları birbiriyle rezonans kuruyor, mizah ve referans noktaları örtüşüyor. Bu uyum, yanlış anlamaları azaltır ve her konuşmanın enerji vermesini sağlar.",
      neg:"İki farklı Merkür stili çarpışıyor — biri doğrudan ve hızlı düşünürken diğeri yavaş ve derin işliyor; biri fazla konuşurken diğeri az ama öz söylüyor. Bu fark birikim yaratabiliyor. Birbirinin iletişim diline saygı göstermek bu köprüyü kurar."},
    {p1:"jupiter",p2:"sun",label:"Jüpiter–Güneş",w:2,icon:"🌟☀️",
      pos:"Jüpiter'in genişletici enerjisi Güneş'i besliyor ve büyütüyor. Bu temas, ilişkiye bir öğretmen-öğrenci ya da mentor-misafir dinamiği katabilir — biri diğerini büyümeye, genişlemeye ve potansiyelini görmeye davet ediyor. Birlikte yapılan şeyler büyüme getirir.",
      neg:"Jüpiter-Güneş temasının aşırısı beklentileri yükseltebilir. Biri sürekli büyüme, ilerleme ve anlam arıyorken diğeri bazen mevcut hali yeterli bulmak isteyebilir. Bu dengesizlik yorgunluk yaratabilir; hız ve yön konusunda ortaklaşmak önemlidir."},
    {p1:"mars",p2:"venus",label:"Mars–Venüs (K2→K1)",w:3,icon:"⚡💕",
      pos:"2. kişinin Mars enerjisi 1. kişinin Venüs alanına çarpıyor — bu, manyetik bir karşılıklı çekim yaratıyor. Arzu ve sevgi birbirini besliyor; biri tutuşturuyor, diğeri sıcaklıkla karşılık veriyor. Bu dinamik, ilişkiye sürekli taze ve canlı bir enerji akışı sağlar.",
      neg:"Farklı tempo ve yaklaşım tarzları zaman zaman sürtüşme yaratabilir. Mars hızlı ve doğrudan hamleler yaparken Venüs daha yavaş ve yavaş yavaş açılmak ister. Sabır ve ritim konusunda uzlaşmak bu güçlü çekimi sürdürülebilir kılar."},
    {p1:"moon",p2:"venus",label:"Ay–Venüs",w:2,icon:"🌙💕",
      pos:"Duygusal ihtiyaçlar ve sevgi dili burada buluşuyor. Ay'ın şefkat ve güvenlik arayışı, Venüs'ün sıcaklık ve güzellikle besleme enerjisiyle uyum içinde. Bu temas ilişkiye yumuşak ama sağlam bir duygusal zemin kazandırır ve her iki kişinin de sevildiğini hissetmesini kolaylaştırır.",
      neg:"Ay'ın duygusal ihtiyaçları bazen Venüs'ün yapabileceğinden daha fazla yakınlık ve güvence isteyebilir. Biri sürekli onay ve temas ararken diğeri zaman zaman özerkliğe ihtiyaç duyarsa, bu denge kurmak zorlaşabilir. Açık iletişim bu dinamiği yönetir."}
  ];
  var aspects = [];
  var totalScore = 0, totalWeight = 0;
  pairs.forEach(function(pp){
    var s1 = cd1[pp.p1]||"Kova", s2 = cd2[pp.p2]||sun2;
    var e1x = ELEM_MAP[s1]||"Hava", e2x = ELEM_MAP[s2]||"Hava";
    var mod1 = MOD_MAP[s1]||"Sabit", mod2 = MOD_MAP[s2]||"Sabit";
    var angle = signAngle(s1,s2);
    var asp = aspectType(angle);
    var elemBonus = (e1x===e2x)?12:((e1x==="Ateş"&&e2x==="Hava")||(e1x==="Hava"&&e2x==="Ateş")||(e1x==="Toprak"&&e2x==="Su")||(e1x==="Su"&&e2x==="Toprak"))?7:-4;
    var modBonus = mod1===mod2?-4:4;
    var sc = Math.min(98,Math.max(22,65+asp.score_add+elemBonus+modBonus));
    var type = sc>=75?"uyum":sc>=52?"karma":"zorluk";
    var detail = sc>=68?pp.pos:pp.neg;
    var colors = {uyum:"#1a5c2a",karma:"#7a4a00",zorluk:"#8b1a1a"};
    var bgs = {uyum:"rgba(60,160,80,.07)",karma:"rgba(212,175,110,.08)",zorluk:"rgba(200,50,50,.06)"};
    aspects.push({
      name:pp.label+" | "+s1+"–"+s2, shortName:pp.label, icon:pp.icon,
      aspect:asp.name, desc:detail,
      meta:"Element: "+e1x+"-"+e2x+" | Açı: "+angle+"° "+asp.name,
      score:sc, type:type, color:colors[type], bg:bgs[type], weight:pp.weight
    });
    totalScore += sc*pp.weight; totalWeight += pp.weight;
  });
  aspects.sort(function(a,b){ return b.score-a.score; });
  var synScore = Math.round(totalScore/totalWeight);
  var strongBonds = aspects.filter(function(a){ return a.score>=78; });
  var challenges = aspects.filter(function(a){ return a.score<52; });
  var relType = synScore>=90?"👑 Alev Ruhu Bağı":synScore>=80?"💑 Ruh Eşi Bağı":synScore>=70?"🌟 Uyumlu Yoldaşlık":synScore>=60?"🔮 Karmik Bağ":"⚔️ Zorlayıcı Bağ";
  var karmaPool = [
    "Bu iki ruh daha önce de buluşmuş. Karmik bağlar güçlü.",
    "Chiron köprüsü aktif — birbirinizi iyileştirme misyonu taşıyorsunuz.",
    "Kuzey Düğüm rezonansı var. Bu ilişki evrimsel büyüme için gönderilmiş.",
    "Pluton etkisi güçlü — dönüşüm ve yeniden doğuş.",
    "Neptün örtüsü — spiritüel bağ ve ilahi zamanlama."
  ];
  var kIdx = Math.abs(Math.round(Math.sin(SIGN_ORDER.indexOf(sun2)*137)*1000)) % karmaPool.length;
  return {
    aspects:aspects, strongBonds:strongBonds, challenges:challenges,
    score:synScore, relType:relType, karmaMsg:karmaPool[kIdx],
    summary:"Kova–"+sun2+" sinastri: "+synScore+" puan | "+strongBonds.length+" güçlü bağ | "+challenges.length+" zorluk | "+relType
  };
}

// ═══ GRAFİK FONKSİYONLARI ════════════════════════

// ── Chart.js Grafikleri ──────────────────────────────────
var _chartInstances = {}; // Mevcut chart'ları takip et

function destroyChart(id) {
  if(_chartInstances[id]) { _chartInstances[id].destroy(); delete _chartInstances[id]; }
}

function drawChakraSolo(id, scores, accentColor) {
  var canvas = document.getElementById(id); if(!canvas) return;
  if(typeof Chart === 'undefined') return;
  destroyChart(id);
  var labels = CHAKRA_D.map(function(c){return c.e;});
  var vals = CHAKRA_D.map(function(c,i){return Math.min(99,Math.max(22,scores[i]||50));});
  var colors = CHAKRA_D.map(function(c){return c.c;});
  // Canvas boyutu ayarla
  var pw = canvas.parentElement ? canvas.parentElement.clientWidth : 310;
  var W = Math.min(pw>50?pw:310,350);
  canvas.style.width = W+"px";
  canvas.style.height = Math.round(W*0.65)+"px";
  _chartInstances[id] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        data: vals,
        backgroundColor: colors.map(function(c){return c+"bb";}),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: false, maintainAspectRatio: false,
      plugins: {
        legend: {display:false},
        tooltip: {callbacks:{label:function(ctx){return ctx.parsed.y+"%";}}}
      },
      scales: {
        x: {ticks:{color:"#fff",font:{size:11}}, grid:{color:"rgba(255,255,255,.06)"}, border:{color:"rgba(255,255,255,.1)"}},
        y: {min:0,max:100, ticks:{color:"rgba(212,175,110,.7)",font:{size:10},callback:function(v){return v+"%";}}, grid:{color:"rgba(255,255,255,.05)"}, border:{color:"rgba(255,255,255,.1)"}}
      },
      animation: {duration:900, easing:"easeOutQuart"}
    }
  });
  canvas.style.background = "#1a0d02";
}

function drawChakraComp(id, c1, c2, cComp) {
  var canvas = document.getElementById(id); if(!canvas) return;
  if(typeof Chart === 'undefined') return;
  destroyChart(id);
  var labels = CHAKRA_D.map(function(c){return c.e;});
  var v1 = CHAKRA_D.map(function(c,i){return Math.min(99,Math.max(22,c1[i]||50));});
  var v2 = CHAKRA_D.map(function(c,i){return Math.min(99,Math.max(22,c2[i]||50));});
  var vC = CHAKRA_D.map(function(c,i){return Math.min(99,Math.max(22,cComp[i]||50));});
  var pw = canvas.parentElement ? canvas.parentElement.clientWidth : 310;
  canvas.style.width = Math.min(pw>50?pw:310,310)+"px";
  canvas.style.height = "200px";
  _chartInstances[id] = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {label:"Kişi 1", data:v1, backgroundColor:GH1+"99", borderColor:GH1, borderWidth:1.5, borderRadius:3},
        {label:"Kişi 2", data:v2, backgroundColor:GH2+"99", borderColor:GH2, borderWidth:1.5, borderRadius:3},
        {label:"Uyum",   data:vC, backgroundColor:"rgba(255,255,255,.25)", borderColor:"rgba(255,255,255,.7)", borderWidth:1.5, borderRadius:3}
      ]
    },
    options: {
      responsive:false, maintainAspectRatio:false,
      plugins:{legend:{labels:{color:"rgba(212,175,110,.8)",font:{size:10}}}},
      scales:{
        x:{ticks:{color:"#fff",font:{size:10}}, grid:{color:"rgba(255,255,255,.06)"}},
        y:{min:0,max:100, ticks:{color:"rgba(212,175,110,.7)",font:{size:9},callback:function(v){return v;}}, grid:{color:"rgba(255,255,255,.05)"}}
      },
      animation:{duration:800,easing:"easeOutQuart"}
    }
  });
  canvas.style.background="#1a0d02";
}

function drawRadar(id, data) {
  var canvas = document.getElementById(id); if(!canvas) return;
  if(typeof Chart === 'undefined') return;
  destroyChart(id);
  var pw = canvas.parentElement ? canvas.parentElement.clientWidth : 310;
  var S = Math.min(pw>50?pw:310,310);
  canvas.style.width=S+"px"; canvas.style.height=S+"px";
  _chartInstances[id] = new Chart(canvas, {
    type: "radar",
    data: {
      labels: data.lbl,
      datasets: [
        {label:"Kişi 1", data:data.v1, backgroundColor:GH1+"44", borderColor:GH1, borderWidth:2, pointBackgroundColor:GH1, pointRadius:4},
        {label:"Kişi 2", data:data.v2, backgroundColor:GH2+"33", borderColor:GH2, borderWidth:2, pointBackgroundColor:GH2, pointRadius:4}
      ]
    },
    options: {
      responsive:false, maintainAspectRatio:false,
      plugins:{legend:{labels:{color:"rgba(50,30,10,.8)",font:{family:"Cinzel,serif",size:10}}}},
      scales:{r:{
        min:0,max:100,
        ticks:{display:false},
        grid:{color:"rgba(255,255,255,.08)"},
        angleLines:{color:"rgba(255,255,255,.1)"},
        pointLabels:{color:"rgba(50,30,10,.85)",font:{family:"Cinzel,serif",size:11,weight:"bold"}}
      }},
      animation:{duration:900,easing:"easeOutQuart"}
    }
  });
  canvas.style.background="transparent";
}

// Orijinal Canvas fonksiyonları kaldırıldı — Chart.js kullanıyor

function drawAstroChart(id, data) {
  var canvas = document.getElementById(id); if(!canvas) return;
  var dpr = Math.min(window.devicePixelRatio||1, 2);
  var pw = canvas.parentElement ? canvas.parentElement.clientWidth : 0;
  var S = Math.min(pw>50?pw:380, 380);
  canvas.width = S*dpr; canvas.height = S*dpr;
  canvas.style.width = S+"px"; canvas.style.height = S+"px";
  var ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  var W=S, H=S, cx=W/2, cy=H/2;
  ctx.fillStyle = "#1a0d02"; ctx.fillRect(0,0,W,H);
  for(var i=0;i<40;i++){
    ctx.beginPath(); ctx.arc(Math.random()*W, Math.random()*H, Math.random()*.8+.2, 0, Math.PI*2);
    ctx.fillStyle = "rgba(255,240,210,"+(Math.random()*.3+.05)+")"; ctx.fill();
  }
  var R_out=W*.46, R_in=W*.36, R_core=W*.24, R_inner=W*.15;
  var COLORS=["#ef4444","#22c55e","#eab308","#94a3b8","#f59e0b","#84cc16","#ec4899","#9f1239","#8b5cf6","#78716c","#3b82f6","#06b6d4"];
  var startIdx = Math.max(0, SIGNS.indexOf(data.sun));
  for(var deg=0;deg<360;deg+=5){
    var a=-Math.PI/2+deg*Math.PI/180, r1=R_out-(deg%30===0?9:deg%10===0?6:3);
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(R_out,0); ctx.lineTo(r1,0);
    ctx.strokeStyle=deg%30===0?"rgba(212,175,110,.55)":"rgba(255,255,255,.14)";
    ctx.lineWidth=deg%30===0?1.5:.8; ctx.stroke(); ctx.restore();
  }
  for(var i=0;i<12;i++){
    var si=(startIdx+i)%12;
    var a1=-Math.PI/2+i*Math.PI/6, a2=a1+Math.PI/6;
    ctx.beginPath();
    ctx.moveTo(cx+Math.cos(a1)*R_in, cy+Math.sin(a1)*R_in);
    ctx.arc(cx,cy,R_out,a1,a2);
    ctx.arc(cx,cy,R_in,a2,a1,true); ctx.closePath();
    ctx.fillStyle=COLORS[si]+"1a"; ctx.fill();
    ctx.strokeStyle=COLORS[si]+"55"; ctx.lineWidth=.8; ctx.stroke();
    var am=(a1+a2)/2;
    ctx.font=W*.048+"px serif"; ctx.fillStyle=COLORS[si]+"cc";
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(GLYPHS[SIGNS[si]]||"✦", cx+Math.cos(am)*(R_in+R_out)/2, cy+Math.sin(am)*(R_in+R_out)/2);
  }
  [R_in,R_core,R_inner].forEach(function(rr){
    ctx.beginPath(); ctx.arc(cx,cy,rr,0,Math.PI*2);
    ctx.strokeStyle="rgba(212,175,110,.18)"; ctx.lineWidth=.8; ctx.stroke();
  });
  var planets = [
    {g:"☉",s:data.sun,col:"#f59e0b",r:R_core*.95},
    {g:"⬆",s:data.rising,col:"#e8a0c0",r:R_core*.7},
    {g:"☽",s:data.moon,col:"#94a3b8",r:R_in*.85},
    {g:"♀",s:data.venus,col:"#ec4899",r:R_in*.72},
    {g:"♂",s:data.mars,col:"#ef4444",r:R_core*.5},
    {g:"☿",s:data.mercury,col:"#eab308",r:R_in*.6},
    {g:"♃",s:data.jupiter,col:"#f97316",r:R_in*.78},
    {g:"♄",s:data.saturn,col:"#78716c",r:R_core*.82}
  ];
  planets.forEach(function(p,pi){
    var si=SIGNS.indexOf(p.s); if(si<0) return;
    var rel=(si-startIdx+12)%12;
    var baseA=-Math.PI/2+rel*Math.PI/6+Math.PI/12;
    var offset=(pi%3-1)*.18, a=baseA+offset;
    var px=cx+Math.cos(a)*p.r, py=cy+Math.sin(a)*p.r;
    ctx.beginPath(); ctx.arc(px,py,W*.035,0,Math.PI*2);
    ctx.fillStyle=p.col+"25"; ctx.fill();
    ctx.strokeStyle=p.col+"90"; ctx.lineWidth=1.5; ctx.stroke();
    ctx.shadowColor=p.col; ctx.shadowBlur=10;
    ctx.font="bold "+W*.044+"px serif"; ctx.fillStyle=p.col;
    ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(p.g,px,py); ctx.shadowBlur=0;
  });
  var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,R_inner*.8);
  cg.addColorStop(0,"rgba(212,175,110,.35)"); cg.addColorStop(1,"rgba(212,175,110,0)");
  ctx.beginPath(); ctx.arc(cx,cy,R_inner*.8,0,Math.PI*2);
  ctx.fillStyle=cg; ctx.fill();
  ctx.font=W*.065+"px serif"; ctx.fillStyle="rgba(212,175,110,.9)";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(GLYPHS[data.sun]||"✦", cx, cy);
  ctx.font=W*.03+"px Cinzel,serif"; ctx.fillStyle="rgba(212,175,110,.5)"; ctx.textAlign="center";
  ctx.fillText(data.sun.toUpperCase()+" ☀ "+data.rising+" ⬆", cx, H-8);
}

// ═══ YARDIMCI SHOW/HIDE ══════════════════════════
function showLov(s, m) {
  var ov = document.getElementById("lov");
  if(ov) ov.classList.toggle("show", s);
  if(m) { var ls = document.getElementById("lstep"); if(ls) ls.textContent = m; }
  var ab = document.getElementById("abtn"); if(ab) ab.disabled = s;
}

function updStep(m) {
  var el = document.getElementById("lstep"); if(el) el.textContent = m;
}

function resetApp() {
  try { ["1a","1b","2a","2b"].forEach(function(s){ delPhoto(s); }); } catch(e){}
  ["nm1","nm2","dy1","mo1","yr1","ri1","hr1","mn1","loc1","dy2","mo2","yr2","ri2","hr2","mn2","loc2"].forEach(function(id){
    var el = document.getElementById(id); if(el) el.value = "";
  });
  var snbdg = document.getElementById("snbdg"); if(snbdg) snbdg.style.display = "none";
  var res = document.getElementById("result"); if(res) res.style.display = "none";
  var er = document.getElementById("err"); if(er){ er.style.display="none"; er.textContent=""; }
  var ab = document.getElementById("abtn"); if(ab) ab.disabled = false;
  chartsDrawn = false; pendingCharts = null;
  window.scrollTo({top:0, behavior:"smooth"});
}

// ═══ BAŞLANGIÇ ════════════════════════════════════
(function init(){
  try {
    var d=document.getElementById("dy2"), m=document.getElementById("mo2"),
        y=document.getElementById("yr2"), r=document.getElementById("ri2"),
        h=document.getElementById("hr2"), mn=document.getElementById("mn2");
    if(d) for(var i=1;i<=31;i++) d.innerHTML += '<option value="'+i+'">'+i+'</option>';
    if(m) MONTHS.forEach(function(mo,i){ m.innerHTML += '<option value="'+(i+1)+'">'+mo+'</option>'; });
    if(y) for(var i=2012;i>=1940;i--) y.innerHTML += '<option value="'+i+'">'+i+'</option>';
    // K1 selectleri
    var d1el=document.getElementById("dy1"),m1el=document.getElementById("mo1"),y1el=document.getElementById("yr1"),r1el=document.getElementById("ri1");
    if(d1el) for(var i=1;i<=31;i++) d1el.innerHTML+='<option value="'+i+'">'+i+'</option>';
    if(m1el) MONTHS.forEach(function(mo,i){m1el.innerHTML+='<option value="'+(i+1)+'">'+mo+'</option>';});
    if(y1el) for(var i=2012;i>=1940;i--) y1el.innerHTML+='<option value="'+i+'">'+i+'</option>';
    if(r1el){r1el.innerHTML='<option value="">Yükselen Burç (opsiyonel)</option>';SIGNS.forEach(function(s){r1el.innerHTML+='<option value="'+s+'">'+s+'</option>';});}
    if(r) { r.innerHTML = '<option value="">Yükselen Burç (isteğe bağlı)</option>'; SIGNS.forEach(function(s){ r.innerHTML += '<option value="'+s+'">'+s+'</option>'; }); }
    if(h) for(var i=0;i<24;i++) h.innerHTML += '<option value="'+i+'">'+String(i).padStart(2,"0")+':xx</option>';
    if(mn) for(var i=0;i<60;i+=5) mn.innerHTML += '<option value="'+i+'">'+String(i).padStart(2,"0")+'</option>';
    // K1 saat
    var h1el=document.getElementById("hr1"), mn1el=document.getElementById("mn1");
    if(h1el) for(var i=0;i<24;i++) h1el.innerHTML += '<option value="'+i+'">'+String(i).padStart(2,"0")+':xx</option>';
    if(mn1el) for(var i=0;i<60;i+=5) mn1el.innerHTML += '<option value="'+i+'">'+String(i).padStart(2,"0")+'</option>';
    var stored = localStorage.getItem("cak")||"";
    if(stored && stored.length > 10) {
      var inp = document.getElementById("apiKeyInp");
      if(inp) { inp.value = stored; }
      var ks = document.getElementById("keyStatus");
      if(ks) { ks.textContent = "✓ API anahtarı kaydedildi"; ks.style.color = "#2d6a2d"; }
    }
  } catch(e){ console.warn("init err:", e); }
})();
</script>
</body>
</html>
`;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(HTML_CONTENT);
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
  const city = (req.body.city||"").toLowerCase()
    .replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s")
    .replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c");
  for (const [k,v] of Object.entries(CITIES)) {
    if (city.includes(k) || k.includes(city)) return res.json({ found:true, ...v, city:k });
  }
  res.json({ found:false, ...CITIES["istanbul"], city:"istanbul" });
});

app.listen(PORT, () => console.log("Kozmik API :" + PORT));
