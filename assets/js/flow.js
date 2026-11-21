/*
 * BlinkFlow: fondo generativo en WebGL (ruido fbm con deformación de dominio).
 * Uso: BlinkFlow(canvas, { palette: ["#7c5cff", "#00e0ff", "#ff4ecd"], bg: "#050507", animate: true })
 */
(function () {
  const VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FRAG = `
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform vec2 uMouse;
uniform vec3 uC1;uniform vec3 uC2;uniform vec3 uC3;uniform vec3 uBg;
uniform float uSeed;uniform float uScale;uniform float uMode;uniform float uGrain;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
vec3 field(vec2 p,float t){
 vec2 q=vec2(fbm(p+uSeed+t),fbm(p+vec2(5.2,1.3)+uSeed-t));
 vec2 r=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*1.3),fbm(p+3.5*q+vec2(8.3,2.8)-t*1.1));
 float f=fbm(p+3.5*r);
 vec3 c=mix(uBg,uC1,smoothstep(.28,.9,f));
 c=mix(c,uC2,smoothstep(.45,1.1,length(q))*.85);
 c=mix(c,uC3,smoothstep(.55,.95,r.y)*.8);
 c*=.38+1.5*f*f;
 c+=mix(uC2,vec3(1.),.35)*pow(smoothstep(.55,.95,f),3.)*.9;
 return c;
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*uRes)/min(uRes.x,uRes.y);
 float t=uTime*.04;
 vec2 m=(uMouse-.5)*.3;
 vec3 col=field(p*uScale+m,t);
 if(uMode>.5&&uMode<1.5){
  vec2 c=p-vec2(.06,-.02)-m*.15;float R=.32;float d=length(c);
  col*=1.-.4*smoothstep(R+.3,R,d);
  float z=sqrt(max(R*R-d*d,0.));vec3 n=normalize(vec3(c,z+1e-4));
  vec3 inner=field((p+n.xy*.6)*uScale*1.35+2.,t*1.4);
  float fres=pow(1.-n.z,2.2);
  vec3 l=normalize(vec3(-.5,.6,.7));
  float spec=pow(max(dot(reflect(-l,n),vec3(0.,0.,1.)),0.),50.);
  vec3 s=inner*1.35+fres*mix(uC2,vec3(1.),.45)*.95+spec*.85;
  col=mix(col,s,smoothstep(R,R-.004,d));
 } else if(uMode>1.5&&uMode<2.5){
  float b=sin((p.y*1.2+fbm(p*2.2+t)*.7)*22.);
  col=mix(col,col*1.7+uC2*.12,smoothstep(.55,1.,b)*.55);
 } else if(uMode>2.5){
  float d=abs(length(p-m*.1)-.3+.03*fbm(p*4.+t));
  col+=(uC3*.6+uC1*.5)*smoothstep(.08,0.,d)*.8+vec3(1.)*smoothstep(.012,0.,d)*.5;
 }
 col*=1.-.5*dot(p*.85,p*.85);
 col+=(hash(gl_FragCoord.xy+fract(uTime*.1))-.5)*uGrain;
 gl_FragColor=vec4(max(col,0.),1.);
}`;

  const hex = (h) => {
    const n = parseInt(h.replace("#", ""), 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };

  window.BlinkFlow = function (canvas, o) {
    o = Object.assign(
      { palette: ["#7c5cff", "#00e0ff", "#ff4ecd"], bg: "#050507", seed: 0, scale: 1.6, mode: 0, grain: 0.05, time: 12, animate: false, resolution: 1, preserve: false },
      o || {}
    );
    const gl = canvas.getContext("webgl", { antialias: false, preserveDrawingBuffer: o.preserve, alpha: false });
    if (!gl) return null;

    const sh = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (n) => gl.getUniformLocation(prog, n);
    const U = { res: u("uRes"), time: u("uTime"), mouse: u("uMouse") };
    gl.uniform3fv(u("uC1"), hex(o.palette[0]));
    gl.uniform3fv(u("uC2"), hex(o.palette[1]));
    gl.uniform3fv(u("uC3"), hex(o.palette[2]));
    gl.uniform3fv(u("uBg"), hex(o.bg));
    gl.uniform1f(u("uSeed"), o.seed);
    gl.uniform1f(u("uScale"), o.scale);
    gl.uniform1f(u("uMode"), o.mode);
    gl.uniform1f(u("uGrain"), o.grain);

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * o.resolution));
      const h = Math.max(1, Math.round(canvas.clientHeight * o.resolution));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, w, h);
    };
    const draw = (t) => {
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      gl.uniform1f(U.time, t);
      gl.uniform2f(U.mouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();
    draw(o.time);
    if (!o.animate) return { draw, resize };

    let running = true;
    let raf;
    const start = performance.now() - o.time * 1000;
    const loop = (now) => {
      if (running) draw((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", (e) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => (running = e.isIntersecting)).observe(canvas);
    }
    return { draw, resize, stop: () => cancelAnimationFrame(raf) };
  };
})();
