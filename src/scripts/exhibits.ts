/**
 * One lazy WebGL renderer shared by the project, skill and interest exhibits.
 * Only the exhibit nearest the viewport centre renders. DOM controls work without WebGL.
 */
import * as T from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

type Exhibit = { host: HTMLElement; group: T.Group; nodes: T.Mesh[]; index: number; kind: string; drag: number; labels: HTMLElement[] };
export function initExhibits() {
 const hosts=[...document.querySelectorAll<HTMLElement>('[data-exhibit]')];
 if(!hosts.length) return;
 const media=matchMedia('(prefers-reduced-motion: reduce)');
 const motion={get matches(){return media.matches||document.documentElement.classList.contains('motion-reduced')},addEventListener:media.addEventListener.bind(media)};
 const visible=new Set<HTMLElement>();
 let renderer:T.WebGLRenderer|undefined, active:Exhibit|undefined, raf=0, time=0, last=0, destroyed=false;
 const scene=new T.Scene(), camera=new T.PerspectiveCamera(36,1,.1,100);
 camera.position.set(0,.8,9);camera.lookAt(0,0,0);
 const exhibits=new Map<HTMLElement,Exhibit>();
 const gold=new T.MeshPhysicalMaterial({color:0xd6a75d,metalness:1,roughness:.24,clearcoat:.4});
 const dark=new T.MeshPhysicalMaterial({color:0x171c1e,metalness:.85,roughness:.28});
 const glow=new T.MeshStandardMaterial({color:0xf4c472,emissive:0xd98126,emissiveIntensity:.65,metalness:.55,roughness:.3});
 const blue=new T.MeshStandardMaterial({color:0x719ba8,emissive:0x193642,emissiveIntensity:.7,metalness:.7,roughness:.27});
 const wire=new T.LineBasicMaterial({color:0xbb8b4c,transparent:true,opacity:.35});
 scene.add(new T.HemisphereLight(0xffe7bc,0x121a22,2));
 const key=new T.DirectionalLight(0xffeccb,5);key.position.set(-3,5,4);scene.add(key);
 const rim=new T.PointLight(0xff8a28,45);rim.position.set(4,-1,2);scene.add(rim);
 const fill=new T.PointLight(0x78a4bd,22);fill.position.set(-4,1,-2);scene.add(fill);
 function mesh(geo:T.BufferGeometry,mat:T.Material=gold,parent:T.Object3D) {const m=new T.Mesh(geo,mat);parent.add(m);return m;}
 function ring(parent:T.Object3D,r:number,tilt:number,thick=.012){const m=mesh(new T.TorusGeometry(r,thick,8,100),gold,parent);m.rotation.x=tilt;return m;}
 function clear(g:T.Group){g.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line)o.geometry.dispose()});g.clear();}
 function buildObject(ex:Exhibit){
  clear(ex.group);ex.nodes=[];const g=ex.group,k=ex.kind;
  if(k==='skills'){
   mesh(new T.IcosahedronGeometry(.7,1),gold,g);
   mesh(new T.IcosahedronGeometry(.9,1),new T.MeshBasicMaterial({color:0xe5ba76,wireframe:true,transparent:true,opacity:.22}),g);
   for(let i=0;i<3;i++){const r=ring(g,1.24+i*.13,Math.PI/2+i*.7);r.rotation.y=i*.6;}
   ex.labels.forEach((_,i)=>{
    const a=i/ex.labels.length*Math.PI*2;
    const m=mesh(new T.OctahedronGeometry(.14),i%3===0?blue:glow,g);
    m.position.set(Math.cos(a)*2.15,Math.sin(a)*1.65,Math.sin(a*2)*.75);m.userData.index=i;ex.nodes.push(m);
    const line=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(),m.position]),wire);g.add(line);
   });
  }else if(k==='projects'){
   const platforms=new T.Group();g.add(platforms);
   for(let i=0;i<3;i++){
    const item=new T.Group();item.position.set((i-1)*2.3,i===ex.index?.25:-.2,i===ex.index?.5:-.8);item.rotation.y=(i-1)*-.2;item.scale.setScalar(i===ex.index?1:.7);platforms.add(item);
    const base=mesh(new T.CylinderGeometry(.87,1,.13,64),dark,item);base.position.y=-1.43;
    const halo=ring(item,.92,Math.PI/2,.023);halo.position.y=-1.34;
    if(i===0){
     const phone=mesh(new T.BoxGeometry(1.15,2,.15,1,1,1),gold,item);phone.rotation.z=-.1;
     const screen=mesh(new T.BoxGeometry(1.03,1.84,.025),dark,item);screen.position.z=.09;screen.rotation.z=-.1;
     for(let b=0;b<5;b++){const bar=mesh(new T.BoxGeometry(.11,.2+b*.13,.04),b%2?blue:glow,item);bar.position.set(-.32+b*.16,-.46+b*.045,.13);}
     const coin=mesh(new T.CylinderGeometry(.34,.34,.07,48),gold,item);coin.rotation.x=Math.PI/2;coin.position.set(.5,.6,.35);
    }else if(i===1){
     const terrain=mesh(new T.IcosahedronGeometry(1,0),dark,item);terrain.scale.set(1.15,.45,1.15);terrain.rotation.y=.4;
     const pts=[new T.Vector3(-.85,-.1,.4),new T.Vector3(-.4,.65,0),new T.Vector3(.2,.3,.45),new T.Vector3(.85,1,-.2)];
     mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),60,.028,8,false),glow,item);
     pts.forEach(p=>{const n=mesh(new T.SphereGeometry(.10,16,12),glow,item);n.position.copy(p)});
     ring(item,.75,.5,.018).position.y=.4;
    }else{
     mesh(new T.TorusKnotGeometry(.59,.19,90,12,2,3),gold,item);
     ring(item,1,Math.PI/2,.018);
     mesh(new T.IcosahedronGeometry(.38,1),blue,item);
    }
    const hit=mesh(new T.SphereGeometry(1.1,12,8),new T.MeshBasicMaterial({visible:false}),item);hit.userData.index=i;ex.nodes.push(hit);
   }
   g.rotation.x=.05;
  }else{
   const i=ex.index;
   if(i===0){[-.72,.72].forEach(x=>{const tire=ring(g,.7,0,.16);tire.position.x=x;ring(g,.48,0,.014).position.x=x;for(let n=0;n<8;n++){const spoke=mesh(new T.BoxGeometry(.95,.012,.012),gold,g);spoke.position.x=x;spoke.rotation.z=n*Math.PI/4}});mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.7,0,0),new T.Vector3(0,.75,0),new T.Vector3(.7,0,0),new T.Vector3(-.7,0,0)]),32,.04,8,false),dark,g);}
   else if(i===1||i===2){for(let n=0;n<6;n++){const r=ring(g,1-n*.12,0,.06);r.position.z=n*.13}mesh(new T.CylinderGeometry(.35,.35,.1,48),blue,g).rotation.x=Math.PI/2;if(i===2)ring(g,1.45,Math.PI/2,.035);}
   else if(i===3){mesh(new T.CylinderGeometry(.07,.07,2.5,24),gold,g).rotation.z=Math.PI/2;[-1,1].forEach(x=>{const m=mesh(new T.CylinderGeometry(.6,.6,.24,40),dark,g);m.rotation.z=Math.PI/2;m.position.x=x;ring(g,.59,Math.PI/2,.025).position.x=x;});}
   else if(i===4){mesh(new T.IcosahedronGeometry(1,2),dark,g);for(let n=0;n<4;n++){const r=ring(g,1.12,Math.PI/2+n*.7);r.rotation.y=n*.5;}}
   else if(i===5){mesh(new T.BoxGeometry(1.4,1.4,.22),dark,g);mesh(new T.BoxGeometry(.8,.8,.27),gold,g);for(let n=0;n<9;n++){const p=(n-4)*.16;for(const s of [-1,1]){const a=mesh(new T.BoxGeometry(.05,.32,.04),gold,g);a.position.set(p,s*.83,0);const b=mesh(new T.BoxGeometry(.32,.05,.04),gold,g);b.position.set(s*.83,p,0)}}}
   else{mesh(new T.TorusKnotGeometry(.85,.18,120,16,3,5),gold,g);mesh(new T.IcosahedronGeometry(.5,0),blue,g);}
   ring(g,1.85,Math.PI/2,.01);g.rotation.set(.2,-.2,0);
  }
 }
 function get(host:HTMLElement){
  let ex=exhibits.get(host);if(ex)return ex;
  ex={host,group:new T.Group(),nodes:[],index:0,kind:host.dataset.exhibit!,drag:0,labels:[...host.querySelectorAll<HTMLElement>('[data-node]')]};
  exhibits.set(host,ex);buildObject(ex);return ex;
 }
 function resize(){if(!active||!renderer)return;const w=active.host.clientWidth,h=active.host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=active.kind==='projects'?(w<600?13:9):(w<400?10:8.5);camera.updateProjectionMatrix();}
 function choose(){
  if(document.documentElement.dataset.render==='static') return;
  if(document.hidden||document.documentElement.classList.contains('intro-pending')){cancelAnimationFrame(raf);raf=0;return;}
  const host=[...visible].sort((a,b)=>Math.abs(a.getBoundingClientRect().top+a.clientHeight/2-innerHeight/2)-Math.abs(b.getBoundingClientRect().top+b.clientHeight/2-innerHeight/2))[0];
  if(!host){cancelAnimationFrame(raf);raf=0;return;}
  if(!renderer){
   try{renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<600?1.25:1.5));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(new RoomEnvironment(),.04).texture;pm.dispose();
    renderer.domElement.setAttribute('aria-hidden','true');
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(raf);destroyed=true;hosts.forEach(h=>h.classList.remove('exhibit-ready'));});
   }catch{hosts.forEach(h=>h.classList.add('exhibit-unavailable'));return;}
  }
  const next=get(host);if(next!==active){if(active){scene.remove(active.group);active.host.classList.remove('exhibit-active');}active=next;scene.add(active.group);host.prepend(renderer.domElement);host.classList.add('exhibit-ready','exhibit-active');resize();}
  if(!raf&&!destroyed){last=performance.now();raf=requestAnimationFrame(frame);}
 }
 function frame(now:number){
  raf=0;if(!active||!renderer||document.hidden||destroyed)return;
  const dt=Math.min((now-last)/1000,.05);last=now;if(!motion.matches)time+=dt;
  const ex=active;
  const scroll=ex.host.getBoundingClientRect().top/innerHeight;
  ex.group.rotation.y=ex.drag+(motion.matches?0:Math.sin(time*.2)*.12+scroll*.13);
  if(ex.kind==='skills')ex.group.rotation.z=motion.matches?0:Math.sin(time*.17)*.04;
  ex.nodes.forEach((n,i)=>{if(ex.kind==='skills'){n.rotation.y=time*.4;n.scale.setScalar(i===ex.index?1.6:1);}});
  scene.updateMatrixWorld(true);
  ex.labels.forEach((el,i)=>{const n=ex.nodes[i];if(!n)return;const v=n.getWorldPosition(new T.Vector3()).project(camera);el.style.left=((v.x*.5+.5)*100)+'%';el.style.top=((-v.y*.5+.5)*100)+'%';});
  renderer.render(scene,camera);
  if(!motion.matches)raf=requestAnimationFrame(frame);
 }
 function select(host:HTMLElement,kind:string,index:number,focus=false){
  const scope=host.closest('[data-'+kind+'-theatre]')||host.closest('[data-skill-universe]')!;
  const tabs=[...scope.querySelectorAll<HTMLButtonElement>('[data-'+kind+'-select]')];
  tabs.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;if(focus&&i===index)b.focus()});
  scope.querySelectorAll<HTMLElement>('[data-'+kind+'-panel]').forEach((p,i)=>p.hidden=i!==index);
  const ex=get(host);ex.index=index;if(kind!=='skill')buildObject(ex);choose();if(motion.matches&&renderer)frame(performance.now());
 }
 hosts.forEach(host=>{
  const kind=host.dataset.exhibit==='projects'?'project':host.dataset.exhibit==='world'?'world':'skill';
  const scope=host.closest('[data-'+kind+'-theatre]')||host.closest('[data-skill-universe]');
  const tabs=[...(scope?.querySelectorAll<HTMLButtonElement>('[data-'+kind+'-select]')||[])];
  tabs.forEach((b,i)=>{b.addEventListener('click',()=>select(host,kind,i));b.addEventListener('keydown',e=>{let j=i;if(e.key==='ArrowRight'||e.key==='ArrowDown')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();select(host,kind,j,true);});});
  host.querySelectorAll<HTMLButtonElement>('[data-node]').forEach((b,i)=>b.addEventListener('click',()=>select(host,kind,i)));
  let dragging=false,lx=0,start=0;
  host.addEventListener('pointerdown',e=>{if((e.target as HTMLElement).closest('button'))return;dragging=true;lx=start=e.clientX;host.setPointerCapture(e.pointerId);});
  host.addEventListener('pointermove',e=>{if(!dragging)return;get(host).drag+=(e.clientX-lx)*.008;lx=e.clientX;choose();});
  host.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;if(Math.abs(e.clientX-start)<5&&active?.host===host){const r=host.getBoundingClientRect();const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=ray.intersectObjects(active.nodes,false)[0];if(hit)select(host,kind,hit.object.userData.index);}});
  host.addEventListener('pointercancel',()=>dragging=false);
  new ResizeObserver(resize).observe(host);
 });
 const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)visible.add(e.target as HTMLElement);else visible.delete(e.target as HTMLElement);});choose();},{threshold:.12});
 hosts.forEach(h=>io.observe(h));
 document.addEventListener('visibilitychange',choose);
 new MutationObserver(choose).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
 motion.addEventListener('change',()=>{cancelAnimationFrame(raf);raf=0;choose()});
 window.addEventListener('pagehide',()=>{destroyed=true;cancelAnimationFrame(raf);io.disconnect();exhibits.forEach(e=>clear(e.group));renderer?.dispose()},{once:true});
}

