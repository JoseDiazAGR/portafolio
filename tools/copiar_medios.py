"""Copia los medios del portafolio a portfolio_site/public/assets con nombres limpios.
Se puede volver a ejecutar cuando agregues archivos nuevos (no sobreescribe si ya existen)."""
import os, re, shutil, unicodedata

SRC = r"c:/Users/jose_/Documents/WEBS/Portafolio de Jose"
DST = os.path.join(SRC, "portfolio_site", "public", "assets")

def slug(name):
    base, ext = os.path.splitext(name)
    base = unicodedata.normalize("NFKD", base).encode("ascii", "ignore").decode()
    base = re.sub(r"[^a-zA-Z0-9]+", "-", base).strip("-").lower()
    return base + ext.lower()

folders = {".mp4": "videos", ".png": "images", ".jpg": "photos", ".pdf": "docs"}
for f in os.listdir(SRC):
    p = os.path.join(SRC, f)
    if not os.path.isfile(p):
        continue
    ext = os.path.splitext(f)[1].lower()
    if ext not in folders or f.startswith("Portafolio_Jose_Diaz_Atlantis"):
        continue
    out_dir = os.path.join(DST, folders[ext])
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, slug(f))
    if not os.path.exists(out):
        shutil.copy2(p, out)
    print(f"{folders[ext]}/{slug(f)}")
