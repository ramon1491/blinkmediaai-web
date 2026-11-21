# BlinkMediaAi · Web

Web estática del estudio de diseño con IA **BlinkMediaAi**. HTML, CSS y JavaScript sin dependencias ni build.

## Ver en local

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Publicar

- **GitHub Pages:** Settings → Pages → Source: "Deploy from a branch" → `main` / `(root)`.
- **Vercel / Netlify:** importa el repositorio; no hace falta comando de build ni carpeta de salida (raíz).

## Pendiente de completar

Busca `PENDIENTE` en `index.html` para encontrar cada punto.

- [ ] Usuario real de Instagram (ahora `@blinkmediaai`, en 4 enlaces).
- [ ] Email de contacto (ahora `hola@blinkmediaai.com`, también en el `action` del formulario).
- [ ] Número de WhatsApp (ahora `+00 000 000 000` / `wa.me/000000000`).
- [ ] Imágenes del portfolio: guarda los archivos en `assets/portfolio/` y sustituye cada `.work__media` por `<img>`. Cambia títulos y categorías.
- [ ] Texto de "Nosotros" con la historia real del estudio.
- [ ] Revisar las cifras del hero (10x, 72 h, 100%) para que sean reales.
- [ ] Logo definitivo (ahora un logotipo provisional en CSS + `assets/favicon.svg`).
- [ ] Formulario: hoy abre el cliente de correo. Para recibir mensajes directamente, crea un formulario en [Formspree](https://formspree.io) y cambia el `action` del `<form>` por su URL (y quita `enctype`).
- [ ] Dominio propio (p. ej. blinkmediaai.com) al publicar.

## Estructura

```
index.html        Página única con todas las secciones
styles.css        Estilos (colores en :root)
main.js           Menú móvil y animaciones
assets/           Favicon e imágenes
```
