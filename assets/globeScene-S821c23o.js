import{W as At,S as Rt,P as Tt,G as j,a as ht,u as pt,v as w,c as Lt,C,w as Vt,B as A,F as f,L as _t,l as G,x as Et,y as Ot,V as St}from"./three.module-3T0H-G4h.js";const l=2,_=12,gt=32,W={lat:17.69,lon:83.22},Ht=[{lat:51.5,lon:-.13},{lat:37.77,lon:-122.42},{lat:35.68,lon:139.69},{lat:1.35,lon:103.82},{lat:25.2,lon:55.27},{lat:-33.87,lon:151.21},{lat:52.52,lon:13.4},{lat:12.97,lon:77.59}],b=(z,P,u)=>{const d=(90-z)*Math.PI/180,p=(P+180)*Math.PI/180;return new St(-u*Math.sin(d)*Math.cos(p),u*Math.cos(d),u*Math.sin(d)*Math.sin(p))},It=`
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }`,Bt=`
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec3 L = normalize(vec3(-0.55, 0.6, 0.6));
    float diff = max(dot(vN, L), 0.0);
    float fres = pow(1.0 - max(dot(vN, vV), 0.0), 2.6);
    vec3 col = vec3(0.016, 0.012, 0.009);
    col += vec3(0.36, 0.19, 0.05) * pow(diff, 2.2) * 0.32;
    col += vec3(1.0, 0.66, 0.22) * fres * 0.3;
    gl_FragColor = vec4(col, 1.0);
  }`,Nt=`
  varying vec3 vN;
  void main() {
    vN = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`,Dt=`
  uniform vec3 uColor;
  varying vec3 vN;
  void main() {
    float i = pow(clamp(0.7 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 4.2);
    gl_FragColor = vec4(uColor * i * 0.65, 1.0);
  }`,jt=`
  attribute float aRand;
  uniform float uSize;
  uniform float uTime;
  varying float vRand;
  varying float vFacing;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    vRand = aRand;
    gl_PointSize = uSize * (0.78 + aRand * 0.5) * (${_.toFixed(1)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`,Gt=`
  uniform float uTime;
  uniform float uOpacity;
  varying float vRand;
  varying float vFacing;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    float twinkle = 0.72 + 0.28 * sin(uTime * 1.4 + vRand * 37.0);
    float limb = smoothstep(-0.02, 0.38, vFacing);
    vec3 col = mix(vec3(1.0, 0.6, 0.12), vec3(1.0, 0.9, 0.56), vRand);
    gl_FragColor = vec4(col, a * twinkle * limb * uOpacity);
  }`,wt=`
  attribute float aT;
  uniform float uRadius;
  varying float vT;
  varying float vDepth;
  void main() {
    vT = aT;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vec4 origin = modelMatrix * vec4(0.0, 0.0, 0.0, 1.0);
    vDepth = (wp.z - origin.z) / max(uRadius, 0.0001);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`,yt=`
  uniform float uHead;
  uniform float uBase;
  uniform float uTail;
  uniform float uLoop;
  uniform vec3 uColor;
  uniform vec3 uHot;
  varying float vT;
  varying float vDepth;
  void main() {
    float d = uHead - vT;
    if (uLoop > 0.5) d = fract(d);
    float trail = (d >= 0.0) ? exp(-d * uTail) : 0.0;
    float depth = mix(0.35, 1.0, smoothstep(-1.0, 0.6, vDepth));
    float a = (uBase + trail) * depth;
    gl_FragColor = vec4(mix(uColor, uHot, clamp(trail * 1.2, 0.0, 1.0)), a);
  }`,xt=`
  uniform float uSize;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = uSize * (${_.toFixed(1)} / -mv.z);
    gl_Position = projectionMatrix * mv;
  }`,Mt=`
  uniform vec3 uColor;
  uniform float uOpacity;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = smoothstep(0.12, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor * (core * 1.4 + halo * halo * 0.9), (core + halo * halo * 0.7) * uOpacity);
  }`;function qt(z,P){const u=P.quality==="high",d=new At({antialias:u,alpha:!0,powerPreference:u?"high-performance":"low-power"}),p=Math.min(window.devicePixelRatio||1,u?1.75:1.4);d.setPixelRatio(p),d.setClearColor(0,0);const T=d.domElement;T.setAttribute("aria-hidden","true"),z.appendChild(T);const k=new Rt,F=new Tt(gt,1,.1,100);F.position.set(0,0,_);const h=new j;k.add(h);const E=new j;E.rotation.set(.16,0,.36),h.add(E);const y=new j;y.rotation.y=-3.02-.55,E.add(y);const x={transparent:!0,depthWrite:!1,blending:Lt};y.add(new ht(new pt(l*.995,u?72:48,u?54:36),new w({vertexShader:It,fragmentShader:Bt})));const bt=new ht(new pt(l*1.17,48,32),new w({vertexShader:Nt,fragmentShader:Dt,side:Vt,uniforms:{uColor:{value:new C("#c97a12")}},...x}));E.add(bt);{const t=[];for(let e=-60;e<=60;e+=30)for(let n=0;n<96;n++){const r=b(e,n/96*360-180,l*1.002),s=b(e,(n+1)/96*360-180,l*1.002);t.push(r.x,r.y,r.z,s.x,s.y,s.z)}for(let e=-180;e<180;e+=30)for(let n=0;n<96/2;n++){const r=b(-90+n/48*180,e,l*1.002),s=b(-90+(n+1)/(96/2)*180,e,l*1.002);t.push(r.x,r.y,r.z,s.x,s.y,s.z)}const a=new A;a.setAttribute("position",new f(t,3));const i=new w({vertexShader:"void main(){ gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:"void main(){ gl_FragColor = vec4(1.0, 0.7, 0.25, 0.07); }",...x});y.add(new _t(a,i))}const O=new w({vertexShader:jt,fragmentShader:Gt,uniforms:{uSize:{value:2.4*p},uTime:{value:0},uOpacity:{value:0}},...x}),H=new A,tt=new G(H,O);tt.frustumCulled=!1,y.add(tt);const et=t=>{const o=t.length/2,a=new Float32Array(o*3),i=new Float32Array(o);for(let e=0;e<o;e++){const n=b(t[e*2],t[e*2+1],l*1.004);a[e*3]=n.x,a[e*3+1]=n.y,a[e*3+2]=n.z,i[e]=Math.random()}H.setAttribute("position",new f(a,3)),H.setAttribute("aRand",new f(i,1)),H.computeBoundingSphere()},zt=t=>{const o=new Float32Array(t*2),a=Math.PI*(3-Math.sqrt(5));for(let i=0;i<t;i++){const e=1-i/(t-1)*2;o[i*2]=Math.asin(e)*180/Math.PI,o[i*2+1]=i*a%(Math.PI*2)/Math.PI*180-180}return o},q=[],Pt=b(W.lat,W.lon,l);Ht.forEach((t,o)=>{const a=Pt.clone().normalize(),i=b(t.lat,t.lon,l).normalize(),e=a.angleTo(i),n=72,r=[],s=[];for(let S=0;S<=n;S++){const g=S/n,V=Math.sin(e)||1,D=a.clone().multiplyScalar(Math.sin((1-g)*e)/V).add(i.clone().multiplyScalar(Math.sin(g*e)/V)),Ct=1+Math.sin(Math.PI*g)*(.06+e*.1);D.multiplyScalar(l*Ct),r.push(D.x,D.y,D.z),s.push(g)}const v=new A;v.setAttribute("position",new f(r,3)),v.setAttribute("aT",new f(s,1));const m=new w({vertexShader:wt,fragmentShader:yt,uniforms:{uHead:{value:0},uBase:{value:.07},uTail:{value:7},uLoop:{value:0},uRadius:{value:l},uColor:{value:new C("#b8650a")},uHot:{value:new C("#ffe08a")},uOffset:{value:o*.37}},...x});q.push(m),y.add(new Et(v,m))});const ot=new w({vertexShader:xt,fragmentShader:Mt,uniforms:{uSize:{value:26*p},uColor:{value:new C("#ffd27a")},uOpacity:{value:1}},...x}),at=new A,Y=b(W.lat,W.lon,l*1.012);at.setAttribute("position",new f([Y.x,Y.y,Y.z],3)),y.add(new G(at,ot));const nt=[{r:1.4,rx:.34,rz:.42,speed:.07,base:.11,color:"#c47a12"},{r:1.68,rx:.26,rz:-.36,speed:-.048,base:.08,color:"#9a5a0c"},{r:2.02,rx:.42,rz:.12,speed:.033,base:.055,color:"#7a4100"}].map((t,o)=>{const a=new j;a.rotation.set(t.rx,0,t.rz),h.add(a);const i=320,e=[],n=[];for(let g=0;g<i;g++){const V=g/i*Math.PI*2;e.push(Math.cos(V)*l*t.r,0,Math.sin(V)*l*t.r),n.push(g/i)}const r=new A;r.setAttribute("position",new f(e,3)),r.setAttribute("aT",new f(n,1));const s=new w({vertexShader:wt,fragmentShader:yt,uniforms:{uHead:{value:o*.31},uBase:{value:t.base},uTail:{value:5.5},uLoop:{value:1},uRadius:{value:l*t.r},uColor:{value:new C(t.color)},uHot:{value:new C("#ffe7a0")}},...x});a.add(new Ot(r,s));const v=new A;v.setAttribute("position",new f([0,0,0],3));const m=new w({vertexShader:xt,fragmentShader:Mt,uniforms:{uSize:{value:(o===0?30:22)*p},uColor:{value:new C("#ffd98a")},uOpacity:{value:.95}},...x}),S=new G(v,m);return a.add(S),{def:t,m:s,sat:S,radius:l*t.r}}),$=u?520:220;{const t=new Float32Array($*3),o=new Float32Array($);for(let n=0;n<$;n++){const r=new St().randomDirection().multiplyScalar(l*(1.5+Math.random()*2.6));t.set([r.x*1.4,r.y,r.z],n*3),o[n]=Math.random()}const a=new A;a.setAttribute("position",new f(t,3)),a.setAttribute("aRand",new f(o,1));const i=new w({vertexShader:`
        attribute float aRand; uniform float uSize; varying float vR;
        void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vR=aRand; gl_PointSize = uSize*(0.4+aRand)*(${_.toFixed(1)}/-mv.z); gl_Position = projectionMatrix*mv; }`,fragmentShader:`
        uniform float uTime; varying float vR;
        void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard; float a=smoothstep(0.5,0.0,d)*(0.25+0.35*sin(uTime*0.8+vR*50.0)*0.5+0.175);
          gl_FragColor=vec4(mix(vec3(1.0,0.55,0.1),vec3(1.0,0.85,0.5),vR), a*0.6); }`,uniforms:{uSize:{value:2.6*p},uTime:{value:0}},...x}),e=new G(a,i);e.name="dust",h.add(e)}let R=0,M=0,U=0;const it=()=>{if(R=z.clientWidth,M=z.clientHeight,!R||!M)return;d.setSize(R,M,!1),F.aspect=R/M,F.updateProjectionMatrix();const t=Math.tan(gt*Math.PI/360)*_,o=t*F.aspect,a=window.innerWidth>=P.wideBreakpoint,i=a?.735:.5,e=.36,n=a?Math.min(M*.54,R*.37):Math.min(R*.9,M*.6),r=2*t/M;U=(1-e*2)*t,h.position.set((i*2-1)*o,U,0);const s=n*r/(2*l);h.scale.setScalar(s),q.forEach(m=>m.uniforms.uRadius.value=l*s),nt.forEach(({m,radius:S})=>m.uniforms.uRadius.value=S*s);const v=n/560;O.uniforms.uSize.value=2.8*p*Math.max(.8,v)},rt=new ResizeObserver(it);rt.observe(z),it();const c={x:0,y:0,tx:0,ty:0},Ft=window.matchMedia("(pointer: fine)").matches,st=t=>{c.tx=t.clientX/window.innerWidth*2-1,c.ty=t.clientY/window.innerHeight*2-1};Ft&&window.addEventListener("pointermove",st,{passive:!0});let X=0,Z=!1,J=!0,I=0,L=0,K=!1,lt=!1,B=0,ct=!1;const ut=t=>{if(X=requestAnimationFrame(ut),!u&&(K=!K,K))return;const o=I?Math.min(.05,(t-I)/1e3):.016;I=t,L+=o,c.x+=(c.tx-c.x)*.045,c.y+=(c.ty-c.y)*.045,F.position.x=c.x*.45,F.position.y=-c.y*.3;const a=Math.min(1,window.scrollY/Math.max(1,M));h.position.y=U+a*1.6,h.rotation.y=c.x*.16,h.rotation.x=c.y*.08+a*.25,y.rotation.y+=o*.045,ct&&B<1&&(B=Math.min(1,B+o*.9)),O.uniforms.uOpacity.value=B,O.uniforms.uTime.value=L,q.forEach((e,n)=>{const r=3.2+n%3*.7;e.uniforms.uHead.value=(L+e.uniforms.uOffset.value*r)%r/r*1.6-.1}),ot.uniforms.uOpacity.value=.75+Math.sin(L*2.4)*.25,nt.forEach(({def:e,m:n,sat:r,radius:s})=>{const v=((n.uniforms.uHead.value+o*e.speed)%1+1)%1;n.uniforms.uHead.value=v;const m=v*Math.PI*2;r.position.set(Math.cos(m)*s,0,Math.sin(m)*s)});const i=h.getObjectByName("dust");i&&(i.rotation.y+=o*.01,i.material.uniforms.uTime.value=L),d.render(k,F),lt||(lt=!0,P.onReady?.())},Q=()=>{Z||!J||document.hidden||(Z=!0,I=0,X=requestAnimationFrame(ut))},N=()=>{Z=!1,cancelAnimationFrame(X)},dt=new IntersectionObserver(([t])=>{J=t.isIntersecting,J?Q():N()});dt.observe(z);const vt=()=>document.hidden?N():Q();document.addEventListener("visibilitychange",vt);const mt=t=>{t.preventDefault(),N(),P.onError?.()};T.addEventListener("webglcontextlost",mt);const ft=new AbortController;return fetch(P.landUrl,{signal:ft.signal}).then(t=>{if(!t.ok)throw new Error(String(t.status));return t.arrayBuffer()}).then(t=>{const o=new Int16Array(t),a=new Float32Array(o.length);for(let i=0;i<o.length;i++)a[i]=o[i]/180;et(a)}).catch(t=>{t.name!=="AbortError"&&et(zt(4200))}).finally(()=>{ct=!0}),Q(),{dispose(){N(),ft.abort(),rt.disconnect(),dt.disconnect(),document.removeEventListener("visibilitychange",vt),window.removeEventListener("pointermove",st),T.removeEventListener("webglcontextlost",mt),k.traverse(t=>{const o=t;o.geometry?.dispose(),Array.isArray(o.material)?o.material.forEach(a=>a.dispose()):o.material?.dispose()}),d.dispose(),d.forceContextLoss(),T.remove()}}}export{qt as createGlobeScene};
