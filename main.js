(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- fondo WebGL del hero ---------- */
  const heroCanvas = $(".hero__canvas");
  let flow = null;
  try {
    flow = window.BlinkFlow && BlinkFlow(heroCanvas, {
      palette: ["#7c5cff", "#00e0ff", "#ff4ecd"],
      mode: 1, seed: 1.2, scale: 1.5, grain: 0.03,
      animate: !reduce,
      resolution: Math.min(window.devicePixelRatio || 1, 2) * (window.innerWidth < 700 ? 0.75 : 0.6),
    });
  } catch (e) { flow = null; }
  if (!flow) root.classList.add("no-webgl");

  /* ---------- scroll suave ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollTo = (target) => {
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
    else target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  /* ---------- menú ---------- */
  const burger = $(".burger");
  const menu = $("#menu");
  const setMenu = (open) => {
    root.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.setAttribute("aria-hidden", !open);
    if (lenis) open ? lenis.stop() : lenis.start();
  };
  burger.addEventListener("click", () => setMenu(!root.classList.contains("menu-open")));

  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? document.body : $(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      scrollTo(target);
    })
  );

  /* ---------- nav se oculta al bajar ---------- */
  const nav = $(".nav");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("is-hidden", y > 200 && y > lastY && !root.classList.contains("menu-open"));
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- cursor, botones magnéticos, preview de servicios ---------- */
  if (fine && !reduce) {
    const cursor = $(".cursor");
    const label = $(".cursor__label");
    const preview = $(".hover-preview");
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, px = mx, py = my;
    window.addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; });
    const tick = () => {
      cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
      px += (mx - px) * 0.1; py += (my - py) * 0.1;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      preview.style.transform = `translate3d(${px + 28}px, ${py - 120}px, 0) ${preview.classList.contains("is-on") ? "scale(1)" : "scale(.6)"}`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    $$("a, button, label, input, textarea").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        const text = el.closest("[data-cursor]")?.dataset.cursor;
        if (text) { label.textContent = text; cursor.classList.add("is-label"); }
        else cursor.classList.add("is-link");
      });
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-link", "is-label"));
    });

    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.3;
        const y = (e.clientY - r.top - r.height / 2) * 0.4;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), color .5s";
        el.style.transform = "";
        setTimeout(() => (el.style.transition = ""), 600);
      });
    });

    $$(".srv__row").forEach((row) => {
      row.addEventListener("mouseenter", () => { preview.src = row.dataset.preview; preview.classList.add("is-on"); });
      row.addEventListener("mouseleave", () => preview.classList.remove("is-on"));
    });
  }

  /* ---------- manifiesto: dividir en palabras ---------- */
  const words = $("[data-words]");
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  }

  /* ---------- sin GSAP o con movimiento reducido: todo visible ---------- */
  const loader = $(".loader");
  if (!hasGsap || reduce) {
    $$(".w").forEach((w) => (w.style.opacity = 1));
    loader && loader.remove();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- intro: loader + hero ---------- */
  const lines = $$(".hero__title .line > span");
  const fades = $$("[data-hero-fade]");
  gsap.set(lines, { yPercent: 110 });
  gsap.set(fades, { autoAlpha: 0, y: 24 });
  if (lenis) lenis.stop();

  const num = $(".loader__num");
  const counter = { v: 0 };
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
  intro
    .to(counter, { v: 100, duration: 1.3, ease: "power2.inOut", onUpdate: () => (num.textContent = Math.round(counter.v)) })
    .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1.1, ease: "expo.inOut" }, "+=0.1")
    .from(heroCanvas, { scale: 1.25, duration: 2.2 }, "-=0.8")
    .to(lines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, "-=2")
    .to(fades, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, "-=1.1")
    .add(() => { loader.remove(); if (lenis) lenis.start(); });
  gsap.set(loader, { clipPath: "inset(0 0 0% 0)" });

  /* parallax del hero al hacer scroll */
  gsap.to(".hero__inner", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(heroCanvas, { yPercent: 20, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- manifiesto: las palabras se encienden ---------- */
  gsap.to(".manifesto__text .w", {
    opacity: 1, stagger: 0.05, ease: "none",
    scrollTrigger: { trigger: ".manifesto__text", start: "top 80%", end: "bottom 50%", scrub: true },
  });

  /* ---------- apariciones ---------- */
  gsap.set("[data-reveal]", { autoAlpha: 0, y: 50 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.2, ease: "expo.out", stagger: 0.08, overwrite: true }),
  });

  /* ---------- contadores ---------- */
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count;
    const o = { v: 0 };
    el.textContent = "0";
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 2, ease: "expo.out", onUpdate: () => (el.textContent = Math.round(o.v)) }),
    });
  });

  /* ---------- trabajos: scroll horizontal fijado (escritorio) ---------- */
  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    const track = $(".work__track");
    const dist = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -dist(), ease: "none",
      scrollTrigger: { trigger: ".work", start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
    });
    $$(".card__img img").forEach((img) =>
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: "none", scrollTrigger: { trigger: ".work", start: "top top", end: () => "+=" + dist(), scrub: true } })
    );
  });

  /* ---------- palabra gigante del footer ---------- */
  gsap.from(".footer__word", { yPercent: 40, opacity: 0, ease: "expo.out", duration: 1.6, scrollTrigger: { trigger: ".footer", start: "top 85%" } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
