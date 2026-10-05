import "./style.css";

/* =========================================================
   Todo el contenido viene de public/data/contenido.json.
   Para cambiar textos, fotos o videos edita ese archivo.
   ========================================================= */

const $ = (sel) => document.querySelector(sel);
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const ICON_PLAY = `<svg class="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_CLOSE = `<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

/* ---------------- Tema claro / oscuro ---------------- */
function initTheme() {
  const root = document.documentElement;
  const knob = $("#theme-knob");
  const paint = () => {
    const dark = root.classList.contains("dark");
    knob.style.transform = dark ? "translateX(0)" : "translateX(1.625rem)";
    $("#icon-moon").classList.toggle("hidden", !dark);
    $("#icon-sun").classList.toggle("hidden", dark);
  };
  $("#theme-toggle").addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("tema", root.classList.contains("dark") ? "oscuro" : "claro");
    paint();
  });
  paint();
}

/* ---------------- Navegación con fondo al hacer scroll ---------------- */
function initNav() {
  const nav = $("#nav");
  const onScroll = () => {
    const scrolled = window.scrollY > 20;
    nav.classList.toggle("bg-base/80", scrolled);
    nav.classList.toggle("backdrop-blur-xl", scrolled);
    nav.classList.toggle("border-b", scrolled);
    nav.classList.toggle("border-line", scrolled);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------------- Animación de aparición ---------------- */
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("visible"), revealObserver.unobserve(e.target))),
  { threshold: 0.12 }
);
const observeReveals = () => document.querySelectorAll(".reveal:not(.visible)").forEach((el) => revealObserver.observe(el));

/* ---------------- Videos: carga diferida y vista previa ---------------- */
/** Portada generada por tools/optimizar_medios.py: assets/videos/posters/<nombre>.jpg */
const posterOf = (src) => src.replace("assets/videos/", "assets/videos/posters/").replace(/\.mp4$/i, ".jpg");

function videoThumb(video, extraClass = "") {
  return `
    <div class="video-thumb group ${extraClass}" data-video>
      <video data-src="${esc(video.src)}" poster="${esc(posterOf(video.src))}" muted playsinline loop preload="none"></video>
      <span class="play-badge">${ICON_PLAY}</span>
      ${video.titulo ? `<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-xs font-medium text-white">${esc(video.titulo)}</div>` : ""}
    </div>`;
}

/** Activa miniaturas: vista previa al pasar el mouse (solo computadora) y reproductor al hacer clic */
function bindVideoThumbs(container, videos, onBack) {
  const hover = window.matchMedia("(hover: hover)").matches;
  container.querySelectorAll("[data-video]").forEach((thumb, i) => {
    const v = thumb.querySelector("video");
    if (hover) {
      thumb.addEventListener("mouseenter", () => {
        if (!v.src) v.src = v.dataset.src;
        v.play().catch(() => {});
      });
      thumb.addEventListener("mouseleave", () => v.pause());
    }
    thumb.addEventListener("click", () => openPlayer(videos, i, onBack));
  });
}

/* ---------------- Modal ---------------- */
const modal = $("#modal");
const panel = $("#modal-panel");

function openModal(html, widthClass = "max-w-4xl") {
  panel.className = `modal-panel relative max-h-[92vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface sm:rounded-3xl ${widthClass}`;
  panel.innerHTML = html;
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  panel.scrollTop = 0;
  panel.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
}
function closeModal() {
  panel.querySelectorAll("video").forEach((v) => v.pause());
  modal.classList.add("hidden");
  panel.innerHTML = "";
  document.body.style.overflow = "";
}
modal.querySelector("[data-close]").addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => e.key === "Escape" && !modal.classList.contains("hidden") && closeModal());

const closeBtn = `<button data-close aria-label="Cerrar" class="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-elevated text-ink transition hover:border-gold hover:text-gold">${ICON_CLOSE}</button>`;

/** Reproductor con lista de videos (anterior / siguiente) */
function openPlayer(videos, index, onBack) {
  const v = videos[index];
  openModal(
    `${closeBtn}
    <div class="grid gap-0 md:grid-cols-[minmax(0,420px)_1fr]">
      <div class="bg-black md:rounded-l-3xl">
        <video src="${esc(v.src)}" poster="${esc(posterOf(v.src))}" controls autoplay playsinline class="mx-auto max-h-[80vh] w-full bg-black object-contain md:rounded-l-3xl"></video>
      </div>
      <div class="flex flex-col p-6 md:p-8">
        ${onBack ? `<button id="player-back" class="mb-5 self-start text-sm text-muted transition hover:text-gold">← Volver al caso</button>` : ""}
        <p class="eyebrow">Video ${index + 1} de ${videos.length}</p>
        <h3 class="mt-2 text-2xl font-bold">${esc(v.titulo || "")}</h3>
        <div class="mt-6 grid grid-cols-3 gap-3">
          ${videos
            .map(
              (o, i) => `<button data-goto="${i}" class="relative overflow-hidden rounded-lg border ${i === index ? "border-gold" : "border-line opacity-60 hover:opacity-100"} bg-black transition" style="aspect-ratio:9/16">
                <img src="${esc(posterOf(o.src))}" alt="" loading="lazy" class="h-full w-full object-cover"></button>`
            )
            .join("")}
        </div>
        <div class="mt-auto flex gap-3 pt-6">
          <button id="player-prev" class="btn-ghost !px-4 !py-2" ${index === 0 ? "disabled style='opacity:.4'" : ""}>← Anterior</button>
          <button id="player-next" class="btn-ghost !px-4 !py-2" ${index === videos.length - 1 ? "disabled style='opacity:.4'" : ""}>Siguiente →</button>
        </div>
      </div>
    </div>`,
    "max-w-5xl"
  );
  panel.querySelectorAll("[data-goto]").forEach((b) => b.addEventListener("click", () => openPlayer(videos, +b.dataset.goto, onBack)));
  $("#player-prev")?.addEventListener("click", () => index > 0 && openPlayer(videos, index - 1, onBack));
  $("#player-next")?.addEventListener("click", () => index < videos.length - 1 && openPlayer(videos, index + 1, onBack));
  $("#player-back")?.addEventListener("click", onBack);
}

/* ---------------- Render de secciones ---------------- */
function renderPerfil(p) {
  $("#hero-titulo").textContent = p.titulo;
  $("#hero-nombre").innerHTML = esc(p.nombre).replace(/ (\S+)$/, ' <span class="text-gold">$1</span>');
  $("#hero-frase").textContent = p.frase;
  $("#hero-foto").src = p.foto;
  ["#hero-cv", "#btn-cv"].forEach((s) => ($(s).href = p.cv));
  $("#btn-whatsapp").href = `https://wa.me/${p.whatsapp}`;
  $("#btn-email").href = `mailto:${p.email}`;
  $("#contacto-ubicacion").textContent = `${p.ubicacion} · ${p.telefono} · ${p.email}`;
  $("#sobre-mi").innerHTML = p.sobreMi.map((t) => `<p>${esc(t)}</p>`).join("");
  $("#cifras").innerHTML = p.cifras
    .map(
      (c) => `<div class="bg-surface p-6 md:p-8">
        <div class="font-display text-3xl font-extrabold text-gold md:text-4xl">${esc(c.valor)}</div>
        <div class="mt-1 text-sm text-muted">${esc(c.etiqueta)}</div></div>`
    )
    .join("");
}

function logoTile(logo, nombre) {
  return logo
    ? `<span class="logo-tile"><img src="${esc(logo)}" alt="${esc(nombre)}" class="h-full w-full object-contain" loading="lazy"></span>`
    : `<span class="logo-tile font-display text-lg font-bold text-[#d4af55]">${esc(nombre.split(" ").filter((w) => w.length > 2).map((w) => w[0]).slice(0, 2).join(""))}</span>`;
}

function renderHerramientas(lista) {
  $("#herramientas").innerHTML = lista
    .map(
      (h) => `<div class="group flex w-24 flex-col items-center gap-2 text-center" title="${esc(h.nombre)}">
        <div class="transition duration-300 group-hover:-translate-y-1">${logoTile(h.logo, h.nombre)}</div>
        <span class="text-xs text-muted transition group-hover:text-ink">${esc(h.nombre)}</span></div>`
    )
    .join("");
}

function renderProyectos(lista) {
  $("#proyectos-grid").innerHTML = lista
    .map(
      (p, i) => `
      <article class="reveal card card-hover group flex cursor-pointer flex-col overflow-hidden" data-proyecto="${i}">
        <div class="relative aspect-[16/10] overflow-hidden bg-elevated">
          <img src="${esc(p.portada)}" alt="${esc(p.nombre)}" loading="lazy" class="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105">
          <div class="absolute inset-0 bg-gradient-to-t from-surface via-transparent"></div>
          <span class="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs text-white backdrop-blur">${p.videos.length} videos</span>
        </div>
        <div class="flex flex-1 flex-col p-6">
          <p class="text-xs uppercase tracking-widest text-muted">${esc(p.categoria)}</p>
          <h3 class="mt-2 text-xl font-bold">${esc(p.nombre)}</h3>
          <p class="mt-3 line-clamp-3 text-sm text-muted">${esc(p.problema)}</p>
          <div class="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5">
            ${p.metricas.map((m) => `<div><div class="font-display text-lg font-bold text-gold">${esc(m.valor)}</div><div class="text-[11px] leading-tight text-muted">${esc(m.etiqueta)}</div></div>`).join("")}
          </div>
          <span class="mt-6 text-sm font-semibold text-gold">Ver caso completo →</span>
        </div>
      </article>`
    )
    .join("");
  document.querySelectorAll("[data-proyecto]").forEach((el) => el.addEventListener("click", () => openProyecto(lista[+el.dataset.proyecto])));
}

function openProyecto(p) {
  const bloques = [
    ["01", "El problema", p.problema],
    ["02", "La estrategia", p.estrategia],
    ["03", "La ejecución", p.ejecucion],
    ["04", "El resultado", p.resultado]
  ];
  openModal(`
    ${closeBtn}
    <div class="p-6 md:p-10">
      <p class="eyebrow">${esc(p.categoria)}</p>
      <h3 class="mt-2 pr-12 text-3xl font-bold md:text-4xl">${esc(p.nombre)}</h3>
      <div class="mt-8 grid grid-cols-3 gap-3">
        ${p.metricas.map((m) => `<div class="rounded-xl border border-line bg-elevated p-4"><div class="font-display text-2xl font-bold text-gold">${esc(m.valor)}</div><div class="mt-1 text-xs text-muted">${esc(m.etiqueta)}</div></div>`).join("")}
      </div>
      <div class="mt-10 space-y-8">
        ${bloques.map(([n, t, txt]) => `<div class="grid gap-2 md:grid-cols-[160px_1fr]"><div><span class="font-display text-sm text-gold">${n}</span><h4 class="font-bold">${t}</h4></div><p class="leading-relaxed text-muted">${esc(txt)}</p></div>`).join("")}
      </div>
      ${p.videos.length ? `<h4 class="mt-12 font-bold">Videos del caso</h4><div id="proyecto-videos" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">${p.videos.map((v) => videoThumb(v)).join("")}</div>` : ""}
      ${p.imagenes?.length ? `<h4 class="mt-12 font-bold">Resultados en plataforma</h4><div class="mt-4 grid gap-3 sm:grid-cols-2">${p.imagenes.map((src) => `<a href="${esc(src)}" target="_blank"><img src="${esc(src)}" loading="lazy" class="w-full rounded-xl border border-line transition hover:border-gold" alt=""></a>`).join("")}</div>` : ""}
      ${p.enlaces?.length ? `<div class="mt-10 flex flex-wrap gap-3">${p.enlaces.map((e) => `<a href="${esc(e.url)}" target="_blank" rel="noopener" class="btn-ghost !py-2">${esc(e.red)} ↗</a>`).join("")}</div>` : ""}
    </div>`);
  const cont = $("#proyecto-videos");
  if (cont) bindVideoThumbs(cont, p.videos, () => openProyecto(p));
}

function renderMetaAds(m) {
  if (!m) return $("#resultados").remove();
  $("#meta-fuente").textContent = m.fuente;
  $("#meta-kpis").innerHTML = m.kpis
    .map(
      (k) => `<div class="card p-5 md:p-6"><div class="font-display text-2xl font-extrabold text-gold md:text-3xl">${esc(k.valor)}</div>
        <div class="mt-1 text-xs text-muted md:text-sm">${esc(k.etiqueta)}</div></div>`
    )
    .join("");
  const max = Math.max(...m.negocios.map((n) => n.conversaciones));
  $("#meta-barras").innerHTML = m.negocios
    .map((n) => {
      const cpc = n.inversion / n.conversaciones;
      return `<div>
        <div class="mb-2 flex items-baseline justify-between gap-4 text-sm">
          <span class="font-medium">${esc(n.nombre)}</span>
          <span class="shrink-0 tabular-nums text-muted"><b class="text-ink">${n.conversaciones.toLocaleString("en-US")}</b> · $${cpc.toFixed(2)}</span>
        </div>
        <div class="h-2.5 overflow-hidden rounded-full bg-elevated">
          <div class="bar h-full rounded-full bg-gradient-to-r from-gold/60 to-gold" style="--w:${((n.conversaciones / max) * 100).toFixed(1)}%"></div>
        </div></div>`;
    })
    .join("");
}

const metricasMini = (lista = []) =>
  lista.length
    ? `<div class="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5">${lista
        .map((m) => `<div><div class="font-display text-lg font-bold text-gold">${esc(m.valor)}</div><div class="text-[11px] leading-tight text-muted">${esc(m.etiqueta)}</div></div>`)
        .join("")}</div>`
    : "";

function renderEmprendimientos(lista) {
  const cont = $("#emprendimientos-grid");
  cont.innerHTML = lista
    .map(
      (e, i) => `
      <div class="reveal grid items-start gap-8 lg:grid-cols-[1fr_2fr]">
        <div>
          ${e.imagen ? `<img src="${esc(e.imagen)}" alt="${esc(e.nombre)}" loading="lazy" class="mb-6 aspect-video w-full rounded-2xl border border-line object-cover">` : ""}
          <span class="chip">${esc(e.tipo)}</span>
          <h3 class="mt-3 text-3xl font-bold">${esc(e.nombre)}</h3>
          <p class="mt-4 text-muted">${esc(e.descripcion)}</p>
          ${metricasMini(e.metricas)}
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3" data-emp="${i}">${e.videos.map((v) => videoThumb(v)).join("")}</div>
      </div>`
    )
    .join("");
  lista.forEach((e, i) => bindVideoThumbs(cont.querySelector(`[data-emp="${i}"]`), e.videos));
}

function renderInmobiliario(inmo) {
  $("#inmo-desc").textContent = inmo.descripcion;
  const videos = inmo.propiedades.map((p) => ({ src: p.video, titulo: `${p.titulo} · ${p.ubicacion}` }));
  const cont = $("#inmobiliario-grid");
  cont.innerHTML = videos.map((v) => videoThumb(v, "reveal")).join("");
  // Dato destacado opcional sobre cada propiedad (ej. "260 interesados")
  cont.querySelectorAll("[data-video]").forEach((el, i) => {
    const dato = inmo.propiedades[i].dato;
    if (dato) el.insertAdjacentHTML("beforeend", `<span class="absolute left-3 top-3 rounded-full bg-gold px-3 py-1 text-[11px] font-semibold text-black">${esc(dato)}</span>`);
  });
  bindVideoThumbs(cont, videos);
}

function renderExperiencia(lista) {
  $("#experiencia-lista").innerHTML = lista
    .map(
      (x) => `
      <li class="reveal relative">
        <span class="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-4 border-base bg-gold"></span>
        <p class="text-sm font-medium text-gold">${esc(x.periodo)}</p>
        <h3 class="mt-1 text-xl font-bold">${esc(x.cargo)}</h3>
        <p class="text-sm text-muted">${esc(x.empresa)}</p>
        <ul class="mt-4 space-y-2 text-sm text-muted">${x.puntos.map((t) => `<li class="flex gap-3"><span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold"></span>${esc(t)}</li>`).join("")}</ul>
      </li>`
    )
    .join("");
}

function renderMetodologia(m) {
  if (!m) return $("#metodologia")?.remove();
  $("#metodologia-principio").textContent = m.principio;
  $("#metodologia-enfoque").textContent = m.enfoque;
  $("#metodologia-pasos").innerHTML = m.pasos
    .map(
      (p) => `
      <div class="reveal card card-hover flex flex-col p-6">
        <span class="font-display text-2xl font-black text-gold">${esc(p.paso)}</span>
        <h3 class="mt-3 text-lg font-bold">${esc(p.titulo)}</h3>
        <p class="mt-2 text-xs leading-relaxed text-muted">${esc(p.detalle)}</p>
      </div>`
    )
    .join("");
}

function renderEducacion(lista = []) {
  const cont = $("#educacion-grid");
  if (!cont || !lista.length) return;
  cont.innerHTML = lista
    .map(
      (e) => `
      <div class="reveal card card-hover flex flex-col justify-between p-6">
        <div>
          <div class="flex items-center justify-between gap-3">
            <span class="chip !border-gold/40 !text-gold">${esc(e.tipo)}</span>
            <span class="text-xs text-muted">${esc(e.periodo)}</span>
          </div>
          <h3 class="mt-4 font-display text-xl font-bold">${esc(e.titulo)}</h3>
          <p class="mt-2 text-sm text-muted">${esc(e.institucion)}</p>
        </div>
        <div class="mt-6 border-t border-line pt-4 text-xs font-medium text-ink">
          ${esc(e.estado)}
        </div>
      </div>`
    )
    .join("");
}

function renderCursos(lista) {
  const filtros = ["Todos", ...new Set(lista.map((c) => c.modalidad))];
  let activo = "Todos";
  const pintar = () => {
    $("#cursos-filtros").innerHTML = filtros
      .map((f) => `<button data-f="${esc(f)}" class="rounded-full border px-4 py-1.5 text-sm transition ${f === activo ? "border-gold bg-gold text-black" : "border-line text-muted hover:text-ink"}">${esc(f)}</button>`)
      .join("");
    $("#cursos-grid").innerHTML = lista
      .filter((c) => activo === "Todos" || c.modalidad === activo)
      .map(
        (c) => `
        <div class="card card-hover flex items-start gap-4 p-5">
          ${logoTile(c.logo, c.institucion)}
          <div class="min-w-0">
            <h3 class="font-sans font-semibold leading-snug">${esc(c.titulo)}</h3>
            <p class="mt-1 text-sm text-muted">${esc(c.institucion)}${c.anio ? " · " + esc(c.anio) : ""}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <span class="chip ${c.modalidad === "Presencial" ? "!border-gold/50 !text-gold" : ""}">${esc(c.modalidad)}</span>
              ${c.certificado ? `<a href="${esc(c.certificado)}" target="_blank" class="text-xs font-semibold text-gold hover:underline">Ver certificado ↗</a>` : ""}
            </div>
          </div>
        </div>`
      )
      .join("");
    document.querySelectorAll("[data-f]").forEach((b) => b.addEventListener("click", () => ((activo = b.dataset.f), pintar())));
  };
  pintar();
}

function renderLandings(lista) {
  if (!lista?.length) return;
  $("#landings").classList.remove("hidden");
  $("#nav-links").insertAdjacentHTML("beforeend", `<a href="#landings" class="hover:text-ink transition">Más</a>`);
  $("#landings-grid").innerHTML = lista
    .map(
      (l) => `<a href="${esc(l.url)}" class="reveal card card-hover block overflow-hidden">
        ${l.imagen ? `<img src="${esc(l.imagen)}" class="aspect-video w-full object-cover" alt="">` : ""}
        <div class="p-6"><h3 class="text-xl font-bold">${esc(l.titulo)}</h3><p class="mt-2 text-sm text-muted">${esc(l.descripcion || "")}</p>
        <span class="mt-4 inline-block text-sm font-semibold text-gold">Ver proyecto →</span></div></a>`
    )
    .join("");
}

/* ---------------- Inicio ---------------- */
async function init() {
  initTheme();
  initNav();
  $("#anio").textContent = new Date().getFullYear();
  try {
    const res = await fetch("./data/contenido.json", { cache: "no-cache" });
    const d = await res.json();
    renderPerfil(d.perfil);
    renderHerramientas(d.herramientas);
    renderProyectos(d.proyectos);
    renderMetodologia(d.metodologia);
    renderMetaAds(d.metaAds);
    renderEmprendimientos(d.emprendimientos);
    renderInmobiliario(d.inmobiliario);
    renderExperiencia(d.experiencia);
    renderEducacion(d.educacion);
    renderCursos(d.cursos);
    renderLandings(d.landings);
    abrirDesdeEnlace(d);
  } catch (err) {
    console.error("No se pudo cargar contenido.json:", err);
  }
  observeReveals();
}

/** Enlaces directos (usados por el PDF): ?caso=<id> abre un caso, ?video=<ruta> reproduce un video */
function abrirDesdeEnlace(d) {
  const q = new URLSearchParams(location.search);
  const caso = q.get("caso");
  const video = q.get("video");
  if (caso) {
    const p = d.proyectos.find((x) => x.id === caso);
    if (p) openProyecto(p);
  } else if (video) {
    // Busca la lista donde está ese video para poder navegar anterior/siguiente
    const listas = [
      ...d.proyectos.map((p) => p.videos),
      ...d.emprendimientos.map((e) => e.videos),
      d.inmobiliario.propiedades.map((p) => ({ src: p.video, titulo: `${p.titulo} · ${p.ubicacion}` }))
    ];
    const lista = listas.find((l) => l.some((v) => v.src === video)) || [{ src: video, titulo: "" }];
    openPlayer(lista, lista.findIndex((v) => v.src === video) || 0);
  }
}

init();
