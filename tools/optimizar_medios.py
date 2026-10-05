"""
OPTIMIZAR MEDIOS PARA LA WEB
----------------------------
Uso:  python tools/optimizar_medios.py

Qué hace (se puede ejecutar las veces que quieras, solo procesa lo nuevo):
  1. Comprime los videos de public/assets/videos a 540x960 (~0.8 Mbps), aptos para celular.
  2. Crea una portada .jpg por video en public/assets/videos/posters/ (la usa la web y el PDF).
  3. Reduce las imágenes PNG/JPG grandes de public/assets/images y photos.
  4. Mueve a /medios_sin_usar los archivos que no aparecen en contenido.json (no se publican).
  5. Muestra el peso total: Vercel gratis permite máximo 100 MB por publicación.

Requisitos (una sola vez):  pip install imageio-ffmpeg pillow
"""
import os, re, shutil, subprocess, sys

try:
    import imageio_ffmpeg
    from PIL import Image
except ImportError:
    sys.exit("Falta instalar: pip install imageio-ffmpeg pillow")

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
VID = os.path.join(PUB, "assets", "videos")
POS = os.path.join(VID, "posters")
UNUSED = os.path.join(ROOT, "medios_sin_usar")
os.makedirs(POS, exist_ok=True)

contenido = open(os.path.join(PUB, "data", "contenido.json"), encoding="utf-8").read()
usados = set(re.findall(r'"(assets/[^"#]+)"', contenido))

def info(path):
    out = subprocess.run([FF, "-i", path], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    h = re.search(r"Video: .*?, (\d{2,4})x(\d{2,4})", out)
    br = re.search(r"bitrate: (\d+) kb/s", out)
    return (int(h[1]), int(h[2])) if h else (0, 0), int(br[1]) if br else 0

# 1-2. Videos
for f in sorted(os.listdir(VID)):
    if not f.endswith(".mp4"):
        continue
    src = os.path.join(VID, f)
    rel = f"assets/videos/{f}"
    if rel not in usados:
        os.makedirs(UNUSED, exist_ok=True)
        shutil.move(src, os.path.join(UNUSED, f))
        print(f"  sin usar -> medios_sin_usar/{f}")
        continue
    (w, h), br = info(src)
    if br > 1100 or min(w, h) > 540:
        tmp = src + ".tmp.mp4"
        print(f"  comprimiendo {f} ({os.path.getsize(src)/1e6:.1f} MB)...", flush=True)
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", src,
                        "-vf", "scale='if(gt(iw,ih),-2,min(540,iw))':'if(gt(iw,ih),min(540,ih),-2)'",
                        "-c:v", "libx264", "-preset", "slow", "-b:v", "720k", "-maxrate", "1000k", "-bufsize", "1500k",
                        "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k", "-ac", "1",
                        "-movflags", "+faststart", tmp], check=True)
        for intento in range(10):
            try:
                os.replace(tmp, src)
                break
            except PermissionError:
                if intento == 9:
                    os.remove(tmp)
                    print("     ! archivo en uso: cierra el navegador / 'npm run dev' y vuelve a ejecutar")
                    break
                import time; time.sleep(1.5)
        print(f"     -> {os.path.getsize(src)/1e6:.1f} MB")
    poster = os.path.join(POS, f.replace(".mp4", ".jpg"))
    if not os.path.exists(poster):
        subprocess.run([FF, "-y", "-loglevel", "error", "-ss", "0.8", "-i", src, "-frames:v", "1",
                        "-vf", "scale=540:-2", "-q:v", "4", poster], check=True)

# 3-4. Imágenes
for carpeta in ("images", "photos"):
    d = os.path.join(PUB, "assets", carpeta)
    for f in sorted(os.listdir(d)):
        p = os.path.join(d, f)
        if f"assets/{carpeta}/{f}" not in usados:
            os.makedirs(UNUSED, exist_ok=True)
            shutil.move(p, os.path.join(UNUSED, f))
            print(f"  sin usar -> medios_sin_usar/{f}")
            continue
        if os.path.getsize(p) > 400_000:
            im = Image.open(p)
            im.thumbnail((1400, 1400))
            if f.lower().endswith(".png"):
                im = im.convert("RGB").quantize(colors=256, method=Image.Quantize.MEDIANCUT) if im.mode != "P" else im
                im.save(p, optimize=True)
            else:
                im.convert("RGB").save(p, quality=82, optimize=True, progressive=True)
            print(f"  imagen optimizada {f}: {os.path.getsize(p)/1e3:.0f} KB")

# 5. Peso total
total = sum(os.path.getsize(os.path.join(r, x)) for r, _, fs in os.walk(PUB) for x in fs)
print(f"\nPeso total de la web: {total/1e6:.1f} MB (límite Vercel gratis: 100 MB)")
if total > 95e6:
    print("ATENCIÓN: estás cerca o por encima del límite. Quita videos o usa enlaces de YouTube/TikTok.")
