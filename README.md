# Portafolio · José Guadalupe Díaz

## Ver el sitio en tu computadora
```
npm install      (solo la primera vez)
npm run dev      (abre http://localhost:5173)
```

## Cambiar textos, fotos o videos
Todo el contenido está en **`public/data/contenido.json`**. No hace falta tocar código.

| Quiero…                        | Hago esto |
|--------------------------------|-----------|
| Cambiar mi foto                | Reemplaza `public/assets/photos/foto-jose-diaz.jpg` (mismo nombre) o cambia `perfil.foto`. |
| Agregar un video a un caso     | Copia el `.mp4` a `public/assets/videos/` y agrega `{ "src": "assets/videos/nombre.mp4", "titulo": "..." }` en `videos`. |
| Agregar un proyecto            | Copia un bloque completo dentro de `proyectos` y edítalo. |
| Agregar una propiedad          | Agrega un objeto en `inmobiliario.propiedades`. |
| Agregar un curso               | Agrega un objeto en `cursos` (`modalidad`: "Virtual" o "Presencial"). Puedes poner el PDF del certificado en `public/assets/docs/` y su ruta en `certificado`. |
| Agregar una herramienta        | Pon el logo `.svg` en `public/assets/logos/` y agrégalo en `herramientas`. |

**Consejo:** usa nombres de archivo sin espacios, tildes ni ñ (ej. `casa-en-pinalejo.mp4`).
También puedes dejar los archivos en la carpeta principal y ejecutar `python tools/copiar_medios.py`,
que los copia con nombres limpios.

## Agregar otra landing (proyectos futuros)
1. Copia `landings/_plantilla` → `landings/mi-proyecto` (sin `_`).
2. Edita `landings/mi-proyecto/index.html`.
3. En `contenido.json`, dentro de `"landings"`, agrega:
   `{ "titulo": "Mi proyecto", "descripcion": "...", "url": "./landings/mi-proyecto/index.html", "imagen": "" }`
   Aparecerá automáticamente la sección "Más proyectos" y el enlace en el menú.

## Publicar
`npm run build` genera la carpeta `dist/`, lista para subir a Netlify, Vercel o GitHub Pages.
