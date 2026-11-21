# BlinkMediaAi · Web

Web del estudio creativo de diseño con IA **BlinkMediaAi**. Es estática (HTML, CSS y JS), no necesita paso de build y se despliega tal cual en Vercel, Netlify o GitHub Pages.

## Qué tiene

- Portada con fondo generativo animado en WebGL (`assets/js/flow.js`) que reacciona al ratón.
- Pantalla de carga, scroll suave (Lenis) y animaciones de scroll (GSAP + ScrollTrigger). Las librerías están incluidas en `assets/vendor/`, así que no dependen de ningún CDN.
- Cursor personalizado, botones magnéticos y vista previa flotante de imágenes en Servicios.
- Galería de trabajos con scroll horizontal (en escritorio) y carrusel deslizable (en móvil).
- Respeta "reducir movimiento" del sistema y funciona sin JavaScript.

## Ver en local

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Publicar

- **Vercel:** importa el repo y deja la configuración por defecto (Framework: Other, sin build command). Cada push a `main` publica la web.
- **GitHub Pages:** Settings → Pages → rama `main`, carpeta `/ (root)`.

## Pendiente de completar

Busca `PENDIENTE` en `index.html`.

- [ ] Usuario real de Instagram (ahora `@blinkmediaai`).
- [ ] Email (`hola@blinkmediaai.com`, también en el `action` del formulario) y número de WhatsApp.
- [ ] Trabajos: las imágenes de `assets/img/work-*.jpg` son visuales generativos de ejemplo. Sustitúyelas por proyectos reales (formato 4:5, unos 1600 px) y cambia nombres y categorías.
- [ ] Instagram: cambia `assets/img/ig-*.jpg` por posts reales.
- [ ] Texto del Estudio y cifras (10x, 72 h, 100 %, 24 h): confirmar que son reales.
- [ ] Logo definitivo (ahora es un logotipo provisional hecho en CSS y `assets/favicon.svg`).
- [ ] Formulario: hoy abre el correo del visitante. Para recibir mensajes directamente, crea un formulario en [Formspree](https://formspree.io), pon su URL en el `action` del `<form>` y quita `enctype`.
- [ ] Dominio propio y actualizar la URL de `og:image` en `index.html` si cambia.

## Estructura

```
index.html            Página única
styles.css            Estilos (colores y tipografías en :root)
main.js               Interacciones y animaciones
assets/js/flow.js     Fondo generativo WebGL
assets/vendor/        GSAP, ScrollTrigger y Lenis
assets/img/           Visuales, imagen para redes (og.jpg)
```
