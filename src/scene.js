/* ============================================================
   AXIOM | scene.js — render canvas semua eksperimen
   ============================================================ */
import {$,fmt,clamp,DEG} from './core.js';
import {S,P,l1,l2} from './state.js';
import {kaleidoN,curvedCalc,physDatar} from './physics.js';
import {curFrame} from './engine.js';

export const vp=$('bench');let vc=null;
export function fitScene(){const d=devicePixelRatio||1;
 vp.width=innerWidth*d;vp.height=innerHeight*d;
  vc=vp.getContext('2d',{willReadFrequently:true});vc.setTransform(d,0,0,d,0,0)}
addEventListener('resize',fitScene);
const STARS=Array.from({length:110},()=>({x:Math.random(),y:Math.random()*.75,r:Math.random()*1.3+.3,ph:Math.random()*7}));
export const trailPts=[],burst=[];
const ambPh=Array.from({length:14},()=>({p:Math.random()}));
let lastPx=0,lastPy=0;
export function spawnBurst(hit){for(let i=0;i<30;i++){const a=Math.random()*7,sp=60+Math.random()*200;
 burst.push({x:lastPx,y:lastPy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,l:1,hit})}}
function lerp(a,b,t){return a+(b-a)*t}
function arrow(x1,y1,x2,y2,col,w,dash){
 vc.strokeStyle=col;vc.fillStyle=col;vc.lineWidth=w||2.5;vc.setLineDash(dash||[]);
 vc.beginPath();vc.moveTo(x1,y1);vc.lineTo(x2,y2);vc.stroke();vc.setLineDash([]);
 const a=Math.atan2(y2-y1,x2-x1);
 vc.beginPath();vc.moveTo(x2,y2);
 vc.lineTo(x2-9*Math.cos(a-.42),y2-9*Math.sin(a-.42));
 vc.lineTo(x2-9*Math.cos(a+.42),y2-9*Math.sin(a+.42));vc.closePath();vc.fill()}
function photonAlong(path,u,c1){
 if(u<=0||u>=1)return;
 const seg=path.length-1,dd=u*seg,i=Math.min(Math.floor(dd),seg-1),tt=dd-i;
 const px=lerp(path[i].x,path[i+1].x,tt),py=lerp(path[i].y,path[i+1].y,tt);
 lastPx=px;lastPy=py;
 if(S.o.trail){trailPts.push({x:px,y:py});if(trailPts.length>30)trailPts.shift()}
 trailPts.forEach((tp,i2)=>{const fr=i2/trailPts.length;
  vc.fillStyle=c1+Math.round(fr*100).toString(16).padStart(2,'0');
  vc.beginPath();vc.arc(tp.x,tp.y,2+fr*4,0,7);vc.fill()});
 vc.save();vc.shadowColor='#fff';vc.shadowBlur=18;
 const fg=vc.createRadialGradient(px-2,py-2,0,px,py,9);
 fg.addColorStop(0,'#fff');fg.addColorStop(1,c1);
 vc.fillStyle=fg;vc.beginPath();vc.arc(px,py,7,0,7);vc.fill();vc.restore()}
function drawScaleBar(x,y,scalePxPerM,c1){
 const cands=[.1,.2,.5,1,2,5,10,20];
 let m=cands[cands.length-1];
 for(const c of cands){if(c*scalePxPerM>=70){m=c;break}}
 const len=m*scalePxPerM;
 vc.strokeStyle='rgba(237,242,252,.55)';vc.lineWidth=1.5;
 vc.beginPath();vc.moveTo(x,y);vc.lineTo(x+len,y);vc.stroke();
 vc.beginPath();vc.moveTo(x,y-5);vc.lineTo(x,y+5);vc.moveTo(x+len,y-5);vc.lineTo(x+len,y+5);vc.stroke();
 vc.fillStyle='rgba(237,242,252,.6)';vc.font='9px JetBrains Mono';vc.textAlign='center';
 vc.fillText(fmt(m,m<1?1:0)+' m',x+len/2,y-9)}
function drawBackdrop(W,H,t,c1,c2){
 const bg=vc.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,'#0A0E20');bg.addColorStop(.6,'#0D1226');bg.addColorStop(1,'#111A38');
 vc.fillStyle=bg;vc.fillRect(0,0,W,H);
 const nb=(x,y,r,col)=>{const g=vc.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0,col);g.addColorStop(1,'transparent');vc.fillStyle=g;vc.fillRect(x-r,y-r,r*2,r*2)};
 nb(W*.82,H*.12,300,c1+'20');nb(W*.12,H*.85,280,c2+'20');
 STARS.forEach(s=>{vc.fillStyle=`rgba(210,228,255,${.2+.35*Math.abs(Math.sin(t*.7+s.ph))})`;
  vc.fillRect(s.x*W,s.y*H,s.r,s.r)});
 const hor=H*.74,vpx=W/2;
 vc.strokeStyle=c1+'12';vc.lineWidth=1;
 for(let i=-9;i<=9;i++){vc.beginPath();vc.moveTo(vpx+i*26,hor);vc.lineTo(vpx+i*W*.16,H);vc.stroke()}
 let yy=hor,hh=.5;
 while(yy<H){vc.beginPath();vc.moveTo(0,yy);vc.lineTo(W,yy);vc.stroke();yy+=hh;hh*=1.5}
 const hz=vc.createLinearGradient(0,hor-60,0,hor);
 hz.addColorStop(0,'transparent');hz.addColorStop(1,c1+'1C');
 vc.fillStyle=hz;vc.fillRect(0,hor-60,W,60)}
export function drawScene(now){
 if(!vc)fitScene();
 const W=innerWidth,H=innerHeight,t=(now||0)/1000;
 const c1=l1(),c2=l2(),p=P(),f=curFrame(),e=S.exp;
 vc.clearRect(0,0,W,H);
 drawBackdrop(W,H,t,c1,c2);
 if(e==='DATAR')drawDatar(W,H,t,c1,c2,p,f);
 else if(e==='BAUR')drawBaur(W,H,t,c1,c2,p);
 else if(e==='KALEIDO')drawKaleido(W,H,t,c1,c2,p);
 else drawCurved(W,H,t,c1,c2,p,f);
 for(let i=burst.length-1;i>=0;i--){const b=burst[i];
  b.x+=b.vx/60;b.y+=b.vy/60;b.l-=.02;
  if(b.l<=0){burst.splice(i,1);continue}
  vc.fillStyle=(b.hit?'#41E8A5':c1)+Math.round(b.l*200).toString(16).padStart(2,'0');
  vc.beginPath();vc.arc(b.x,b.y,2.6,0,7);vc.fill()}}

/* ---- E1: cermin datar — laser menyapu busur atas kiri↔kanan (0=normal) ---- */
let datarFinT=0;
function drawDatar(W,H,t,c1,c2,p,f){
 const u=f.u||0;
 const done=u>=2;
 if(!done)datarFinT=0;
 const a=p.al*DEG;
 const i=clamp(p.i,-90,90)*DEG;
 /* cincin membesar mengikuti L */
 const maxR=Math.max(150,Math.min(W*.5-130,H*.46-60,H*.54-95));
 const Lpx=120+(maxR-120)*Math.sqrt((p.L-1)/39);
 const OX=Math.round(W*.5),OY=Math.round(H*.46);
 /* kerangka lokal cermin (rotate -a, seperti v1):
    y+ lokal = sisi DEPAN (reflektif, ke atas saat α=0)
    i diukur dari NORMAL: i=0 → laser sepanjang normal;
    i>0 → miring ke kanan; i<0 → ke kiri (busur atas saja) */
 const toW=(lx,ly)=>({x:OX+lx*Math.cos(a)-ly*Math.sin(a),
                      y:OY-lx*Math.sin(a)-ly*Math.cos(a)});
 const O={x:OX,y:OY};
 const off=i;
 const Lp=toW(Math.sin(off)*Lpx, Math.cos(off)*Lpx);
 const Rp=toW(-Math.sin(off)*Lpx, Math.cos(off)*Lpx);
 const Np=toW(0,Lpx);
 const halfLen=110;
 const E1=toW(-halfLen,0),E2=toW(halfLen,0);
 const p1=clamp(u,0,1),p2=clamp(u-1,0,1);
 const reveal=done?clamp((t-datarFinT)/.7,0,1):0;
 if(done&&!datarFinT)datarFinT=t;
 /* cincin lintasan */
 vc.setLineDash([3,9]);vc.strokeStyle=c1+'2A';vc.lineWidth=1;
 vc.beginPath();vc.arc(OX,OY,Lpx,0,7);vc.stroke();vc.setLineDash([]);
 /* normal */
 if(S.o.norm){vc.setLineDash([4,7]);vc.strokeStyle='rgba(237,242,252,.4)';vc.lineWidth=1.4;
  vc.beginPath();vc.moveTo(O.x,O.y);vc.lineTo(Np.x,Np.y);vc.stroke();vc.setLineDash([]);
  vc.fillStyle='rgba(237,242,252,.55)';vc.font='9px JetBrains Mono';vc.textAlign='center';
  vc.fillText('NORMAL',(O.x+Np.x)/2,(O.y+Np.y)/2-8)}
 /* ===== CERMIN bentuk asli (translate+rotate) ===== */
 vc.save();vc.translate(OX,OY);vc.rotate(-a);
 vc.shadowColor='rgba(200,220,255,.7)';vc.shadowBlur=14;
 const mg=vc.createLinearGradient(-110,0,110,0);
 mg.addColorStop(0,'#6E7F99');mg.addColorStop(.5,'#E8F0FC');mg.addColorStop(1,'#6E7F99');
 vc.strokeStyle=mg;vc.lineWidth=6;vc.lineCap='round';
 vc.beginPath();vc.moveTo(-110,0);vc.lineTo(110,0);vc.stroke();
 vc.shadowBlur=0;vc.strokeStyle='rgba(255,255,255,.25)';vc.lineWidth=8;
 vc.beginPath();vc.moveTo(-104,5);vc.lineTo(104,5);vc.stroke();
 vc.restore();vc.lineCap='butt';
 /* ===== emitter laser ===== */
 vc.save();vc.translate(Lp.x,Lp.y);vc.rotate(Math.atan2(O.y-Lp.y,O.x-Lp.x));
 vc.fillStyle=c2;vc.shadowColor=c2;vc.shadowBlur=12;
 vc.beginPath();vc.roundRect(-8,-9,34,18,7);vc.fill();
 vc.fillStyle='#0B1120';vc.beginPath();vc.roundRect(-2,-4,10,8,3);vc.fill();
 vc.restore();vc.shadowBlur=0;
 vc.fillStyle='rgba(237,242,252,.6)';vc.font='9px JetBrains Mono';vc.textAlign='center';
 vc.fillText('LASER',Lp.x,Lp.y+28);
 /* ===== SEBELUM ▶: jalur DATANG saja (dashed) ===== */
 if(p1+p2<=0){
  vc.setLineDash([5,7]);vc.strokeStyle=c1+'88';vc.lineWidth=1.6;
  vc.beginPath();vc.moveTo(Lp.x,Lp.y);vc.lineTo(O.x,O.y);vc.stroke();
  vc.setLineDash([])}
 /* ===== SAAT ▶: garis terbentuk mengikuti foton ===== */
 if(p1>0){
  const px=lerp(Lp.x,O.x,p1),py=lerp(Lp.y,O.y,p1);
  vc.shadowColor=c1;vc.shadowBlur=12;
  let g1=vc.createLinearGradient(Lp.x,Lp.y,px,py);
  g1.addColorStop(0,c1+'44');g1.addColorStop(1,c1);
  vc.strokeStyle=g1;vc.lineWidth=3;
  vc.beginPath();vc.moveTo(Lp.x,Lp.y);vc.lineTo(px,py);vc.stroke();vc.shadowBlur=0;
  glowDot(px,py,c1)}
 if(p2>0){
  const px=lerp(O.x,Rp.x,p2),py=lerp(O.y,Rp.y,p2);
  vc.shadowColor=c1;vc.shadowBlur=12;
  let g2=vc.createLinearGradient(O.x,O.y,px,py);
  g2.addColorStop(0,c1);g2.addColorStop(1,c1+'66');
  vc.strokeStyle=g2;vc.lineWidth=3;
  vc.beginPath();vc.moveTo(O.x,O.y);vc.lineTo(px,py);vc.stroke();vc.shadowBlur=0;
  glowDot(px,py,c1)}
 /* kilau titik datang */
 vc.save();vc.shadowColor='#fff';vc.shadowBlur=10;
 vc.fillStyle='rgba(255,255,255,'+(.45+.35*Math.sin(t*6))+')';
 vc.beginPath();vc.arc(O.x,O.y,3.2,0,7);vc.fill();vc.restore();
 /* ===== BUSUR i & r + LABEL — setelah foton selesai ===== */
 if(reveal>0){
  vc.globalAlpha=reveal;
  const aN=Math.atan2(Np.y-O.y,Np.x-O.x);
  const aL=Math.atan2(Lp.y-O.y,Lp.x-O.x);
  const aR=Math.atan2(Rp.y-O.y,Rp.x-O.x);
  const arcB=(a1,a2,r)=>{let dd=a2-a1;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;
   vc.beginPath();for(let k=0;k<=24;k++){const aa=a1+dd*k/24;
    const x=O.x+Math.cos(aa)*r,y=O.y+Math.sin(aa)*r;k?vc.lineTo(x,y):vc.moveTo(x,y)}vc.stroke()};
  vc.lineWidth=2;
  vc.strokeStyle='rgba(65,232,165,.9)';arcB(aN,aL,46);
  vc.strokeStyle=c1;arcB(aN,aR,58);
  const mid1=aN+(((aL-aN)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/2;
  const mid2=aN+(((aR-aN)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/2;
  vc.font='10px JetBrains Mono';vc.textAlign='center';
  vc.fillStyle='rgba(65,232,165,.95)';
  vc.fillText('i='+fmt(Math.abs(p.i),0)+'°',O.x+Math.cos(mid1)*64,O.y+Math.sin(mid1)*64+3);
  vc.fillStyle=c1;
  vc.fillText('r='+fmt(Math.abs(p.i),0)+'°',O.x+Math.cos(mid2)*76,O.y+Math.sin(mid2)*76+3);
  vc.fillStyle='rgba(237,242,252,.7)';
  vc.fillText('sinar datang',(Lp.x+O.x)/2-38,(Lp.y+O.y)/2);
  vc.fillText('sinar pantul',(O.x+Rp.x)/2+38,(O.y+Rp.y)/2-8);
  vc.globalAlpha=1;
 }
}
/* kepala foton menyala */
function glowDot(x,y,c1){
 vc.save();vc.shadowColor='#fff';vc.shadowBlur=16;
 const g=vc.createRadialGradient(x-2,y-2,0,x,y,8);
 g.addColorStop(0,'#fff');g.addColorStop(1,c1);
 vc.fillStyle=g;vc.beginPath();vc.arc(x,y,6.5,0,7);vc.fill();vc.restore()}

/* ---- E2: baur vs teratur ---- */
function drawBaur(W,H,t,c1,c2,p){
 const OX=W*.42,OY=H*.5;
 const dInX=Math.sin(p.i*DEG),dInY=Math.cos(p.i*DEG);
 const rX=Math.sin(p.i*DEG),rY=-Math.cos(p.i*DEG);
 const len=200,inX=OX-dInX*len,inY=OY-dInY*len;
 vc.shadowColor=c1;vc.shadowBlur=12;
 let g1=vc.createLinearGradient(inX,inY,OX,OY);
 g1.addColorStop(0,c1+'33');g1.addColorStop(1,c1+'EE');
 vc.strokeStyle=g1;vc.lineWidth=3.5;
 vc.beginPath();vc.moveTo(inX,inY);vc.lineTo(OX,OY);vc.stroke();
 const spread=p.rough/100*60*DEG;
 const NR=13;
 for(let k=0;k<NR;k++){
  const frac=NR===1?0:k/(NR-1)*2-1;
  const off=frac*spread;
  const ang=Math.atan2(rY,rX)+off;
  const rr=len*(1-Math.abs(frac)*.35);
  const ex=OX+Math.cos(ang)*rr,ey=OY+Math.sin(ang)*rr;
  const alpha=Math.max(16,Math.round(220*(1-Math.abs(frac)*.8)));
  vc.strokeStyle=c1+alpha.toString(16).padStart(2,'0');
  vc.lineWidth=off===0?3:1.6;
  vc.beginPath();vc.moveTo(OX,OY);vc.lineTo(ex,ey);vc.stroke()}
 vc.shadowBlur=0;
 vc.strokeStyle='#E8F0FC';vc.lineWidth=4;vc.lineCap='round';
 vc.shadowColor='rgba(200,220,255,.6)';vc.shadowBlur=12;
 vc.beginPath();
 for(let x=-110;x<=110;x+=6){
  const y=OY+120+(p.rough/100)*6*Math.sin(x*.9);
  x===-110?vc.moveTo(OX+x,y):vc.lineTo(OX+x,y)}
 vc.stroke();vc.shadowBlur=0;vc.lineCap='butt';
 vc.fillStyle='rgba(237,242,252,.65)';vc.font='10px JetBrains Mono';vc.textAlign='center';
 vc.fillText(p.rough<10?'PERMUKAAN HALUS → TERATUR (specular)':'PERMUKAAN KASAR → BAUR (difus)',OX,OY+155);
 if(S.o.amb){ambPh.forEach((q,k)=>{
  q.p=(q.p+.005)%1;
  let ax,ay;
  if(q.p<.5){ax=lerp(inX,OX,q.p*2);ay=lerp(inY,OY,q.p*2)}
  else{const ang=Math.atan2(rY,rX)+((q.p*7%1)-.5)*spread;const rr=(q.p-.5)*2*len*.8;
   ax=OX+Math.cos(ang)*rr;ay=OY+Math.sin(ang)*rr}
  vc.fillStyle=c1+'55';vc.beginPath();vc.arc(ax,ay,1.8,0,7);vc.fill()})}
 const u=(curFrame().u||0)*2;
 if(u>0){const uu=Math.min(u,1);
  if(uu<.5){lastPx=lerp(inX,OX,uu*2);lastPy=lerp(inY,OY,uu*2)}
  else{const ang=Math.atan2(rY,rX);const rr=(uu-.5)*2*len*.8;
   lastPx=OX+Math.cos(ang)*rr;lastPy=OY+Math.sin(ang)*rr}
  if(S.o.trail){trailPts.push({x:lastPx,y:lastPy});if(trailPts.length>30)trailPts.shift()}
  trailPts.forEach((tp,i)=>{const fr=i/trailPts.length;
   vc.fillStyle=c1+Math.round(fr*100).toString(16).padStart(2,'0');
   vc.beginPath();vc.arc(tp.x,tp.y,2+fr*4,0,7);vc.fill()});
  vc.save();vc.shadowColor='#fff';vc.shadowBlur=16;
  vc.fillStyle='#fff';vc.beginPath();vc.arc(lastPx,lastPy,6,0,7);vc.fill();vc.restore()}}

/* ---- E3: kaleidoskop ---- */
function drawKaleido(W,H,t,c1,c2,p){
 const OX=W/2,OY=H*.47,Rpx=Math.min(W,H)*.28;
 const th=p.theta*DEG;
 const mA=-th/2-Math.PI/2,mB=th/2-Math.PI/2;
 const drawMirror=(ang,label)=>{
  const x2=OX+Math.cos(ang)*Rpx,y2=OY+Math.sin(ang)*Rpx;
  vc.shadowColor='rgba(200,220,255,.7)';vc.shadowBlur=12;
  const mg=vc.createLinearGradient(OX,OY,x2,y2);
  mg.addColorStop(0,'#8FA2BC');mg.addColorStop(.5,'#E8F0FC');mg.addColorStop(1,'#8FA2BC');
  vc.strokeStyle=mg;vc.lineWidth=5;vc.lineCap='round';
  vc.beginPath();vc.moveTo(OX,OY);vc.lineTo(x2,y2);vc.stroke();
  vc.shadowBlur=0;vc.lineCap='butt';
  vc.fillStyle='rgba(237,242,252,.6)';vc.font='10px JetBrains Mono';vc.textAlign='center';
  vc.fillText(label,x2+Math.cos(ang)*24,y2+Math.sin(ang)*24+3)};
 drawMirror(mA,'CERMIN 1');drawMirror(mB,'CERMIN 2');
 vc.strokeStyle=c1+'66';vc.lineWidth=1.5;vc.setLineDash([4,6]);
 vc.beginPath();vc.arc(OX,OY,50,mA,mB);vc.stroke();vc.setLineDash([]);
 const midAng=(mA+mB)/2;
 vc.fillStyle=c1;vc.font='11px JetBrains Mono';vc.textAlign='center';
 vc.fillText('θ='+p.theta+'°',OX+Math.cos(midAng)*70,OY+Math.sin(midAng)*70+4);
 const rb=p.dist/100*Rpx,hh=p.hh/100*Rpx;
 const drawObjArrow=(ang,real)=>{
  const bx=OX+Math.cos(ang)*rb,by=OY+Math.sin(ang)*rb;
  const tx=OX+Math.cos(ang)*(rb+hh),ty=OY+Math.sin(ang)*(rb+hh);
  arrow(bx,by,tx,ty,real?'#EDF2FC':'#9D7BFF',real?4:3);
  if(S.o.klabel){vc.fillStyle=real?'#EDF2FC':'#9D7BFF';vc.font='9px JetBrains Mono';vc.textAlign='center';
   vc.fillText(real?'BENDA':'bayangan',tx+Math.cos(ang)*16,ty+Math.sin(ang)*16+3)}};
 const bA=-Math.PI/2;
 drawObjArrow(bA,true);
 const n=kaleidoN(p.theta);
 let placed=0;
 for(let k=1;k<=14&&placed<n;k++){
  for(const sgn of[1,-1]){
   if(placed>=n)break;
   const ang=bA+sgn*k*2*th;
   if(ang>-Math.PI-.05&&ang<Math.PI+.05){drawObjArrow(ang,false);placed++}}}
 vc.fillStyle='rgba(237,242,252,.75)';vc.font='11px JetBrains Mono';vc.textAlign='center';
 vc.fillText('n = 360/θ − 1 = '+n+' bayangan',OX,OY+Rpx+40);
 const u=(curFrame().u||0);
 if(u>0){const a2=bA+u*Math.PI*2;
  lastPx=OX+Math.cos(a2)*rb;lastPy=OY+Math.sin(a2)*rb;
  vc.save();vc.shadowColor='#fff';vc.shadowBlur=14;
  vc.fillStyle='#fff';vc.beginPath();vc.arc(lastPx,lastPy,6,0,7);vc.fill();vc.restore()}}

/* ---- E4: cermin cekung — sudut datang diatur, refleksi vektor di busur ---- */
let curFinT=0;
function drawCurved(W,H,t,c1,c2,p,f){
 const u=f.u||0;
 const done=u>=2;
 if(!done)curFinT=0;
 const convex=S.exp==='CEMBUNG';
 const cc=curvedCalc(p,convex);
 const cy=Math.round(H*.5);
 const xL=170,xR=W-140;
 const cxS=Math.round((xL+xR)/2);
 const spDisp=cc.inf?0:(cc.sPrime>0?Math.min(cc.sPrime,40):-Math.min(Math.abs(cc.sPrime),40));
 const hDisp=cc.inf?0:clamp(cc.hp,-9,9);
 const clipped=!cc.inf&&(Math.abs(cc.sPrime)>40||Math.abs(cc.hp)>9.01);
 /* iterasi skala: muat benda, R, bayangan, dan h=10 di bawah puncak cermin */
 let scale=46,Vx=0,bx=0,Rpt=0,Fpt=0,xb=0,halfH=110,Rpx=0;
 for(let it=0;it<90;it++){
  Rpx=p.R*scale;
  Vx=Math.round(cxS+p.s*scale/2);
  bx=Vx-p.s*scale;
  Rpt=convex?Vx+p.R*scale:Vx-p.R*scale;
  Fpt=convex?Vx+(p.R/2)*scale:Vx-(p.R/2)*scale;
  halfH=Math.min(Math.max(110,Rpx*.8),300,cy-75,H-125-cy,Rpx*.98);
  xb=cc.inf?Vx:Vx-(cc.sPrime>0?1:-1)*Math.min(Math.abs(cc.sPrime),40)*scale;
  const hOk=(10*scale)<=halfH*.92;
  if(hOk&&bx>=xL&&Rpt>=xL-10&&Rpt<=xR-10&&xb>=xL&&xb<=xR-10&&Vx<=xR-90)break;
  scale*=.94;
 }
 scale=Math.max(scale,6);
 Rpx=Math.max(90,p.R*scale);
 Vx=Math.round(cxS+p.s*scale/2);
 bx=Vx-p.s*scale;
 Rpt=convex?Vx+p.R*scale:Vx-p.R*scale;
 Fpt=convex?Vx+(p.R/2)*scale:Vx-(p.R/2)*scale;
 halfH=Math.min(Math.max(110,Rpx*.8),300,cy-75,H-125-cy,Rpx*.98);
 xb=cc.inf?Vx:Vx-(cc.sPrime>0?1:-1)*Math.min(Math.abs(cc.sPrime),40)*scale;
 /* ===== titik kunci ===== */
 const bw=Math.max(9,scale*.38);
 const A={x:Math.max(bx,xL+8),y:cy-p.h*scale};       /* puncak lilin (h meter asli) */
 const sp=cc.inf?999:cc.sPrime;
 const yb=cc.inf?cy:cy-hDisp*scale;
 /* ===== sudut datang dari slider (0° = sejajar sumbu, positif menunduk) ===== */
 const ang=clamp(+(p.ang||0),0,85)*DEG;
 /* clamp agar sinar selalu mengenai busur (ujung bawah) */
 const maxDn=Math.atan2((cy+halfH)-A.y,Vx-A.x);
 const angR=Math.min(Math.max(ang,0.02),Math.max(maxDn*.98,0.02));
 const dir0={x:Math.cos(angR),y:Math.sin(angR)};
 /* ===== perpotongan sinar dengan lingkaran cermin ===== */
 const Cc={x:convex?Vx+Rpx:Vx-Rpx,y:cy};
 const ox2=A.x-Cc.x,oy2=A.y-Cc.y;
 const bq=2*(ox2*dir0.x+oy2*dir0.y),cq=ox2*ox2+oy2*oy2-Rpx*Rpx;
 const disc=bq*bq-4*cq;
 let tt=Math.max(1,cy-A.y);
 if(disc>=0){const s2=Math.sqrt(disc);const t1=(-bq-s2)/2,t2=(-bq+s2)/2;
  if(convex){if(t1>0)tt=t1;else if(t2>0)tt=t2}
  else{if(t2>0)tt=t2;else if(t1>0)tt=t1}}
 const P1={x:A.x+dir0.x*tt,y:A.y+dir0.y*tt};
 /* ===== normal lokal busur & refleksi vektor ===== */
 let nX=Cc.x-P1.x,nY=Cc.y-P1.y;const nL=Math.hypot(nX,nY)||1;nX/=nL;nY/=nL;
 const dn=dir0.x*nX+dir0.y*nY;
 const rX=dir0.x-2*dn*nX,rY=dir0.y-2*dn*nY;
 const rl=Math.hypot(rX,rY)||1;const rUx=rX/rl,rUy=rY/rl;
 /* ===== fase animasi ===== */
 const p1=clamp(u/.55,0,1),p2=clamp((u-.55)/.45,0,1);
 const reveal=done?clamp((t-curFinT)/.7,0,1):0;
 if(done&&!curFinT)curFinT=t;
 /* ===== SUMBU UTAMA ===== */
 const xs=[bx,Rpt,Fpt,Vx,xb].filter(x=>isFinite(x));
 const axL=Math.max(70,Math.min(...xs)-55);
 const axR=Math.min(W-85,Math.max(...xs)+55+90);
 vc.strokeStyle='rgba(237,242,252,.6)';vc.lineWidth=2;
 vc.beginPath();vc.moveTo(axL,cy);vc.lineTo(axR,cy);vc.stroke();
 /* ===== ZONA I II III IV ===== */
 const zc=x=>clamp(x,axL+28,axR-28);
 vc.fillStyle=c1;vc.font='600 13px Outfit';vc.textAlign='center';vc.textBaseline='middle';
 if(!convex){
  vc.fillText('III',zc((axL+Rpt)/2),cy);
  vc.fillText('II',zc((Rpt+Fpt)/2),cy);
  vc.fillText('I',zc((Fpt+Vx)/2),cy);
  const z4=clamp(Vx+70,Vx+40,axR-30);
  vc.fillText('IV',z4,cy);
 }else{
  vc.fillText('I',zc((axL+Vx)/2),cy);
  const z4=clamp(Vx+70,Vx+40,axR-30);
  vc.fillText('IV',z4,cy);
 }
 vc.textBaseline='alphabetic';
 /* ===== TITIK F & R ===== */
 if(S.o.fclabel){
  const tick=(x,lbl)=>{
   vc.strokeStyle='rgba(237,242,252,.6)';vc.lineWidth=1.5;
   vc.beginPath();vc.moveTo(x,cy-6);vc.lineTo(x,cy+6);vc.stroke();
   vc.fillStyle='#FFC46B';vc.font='10px JetBrains Mono';vc.textAlign='center';
   vc.fillText(lbl,x,cy-12)};
  tick(Fpt,'F');tick(Rpt,'R');
 }
 /* ===== busur cermin ===== */
 const halfH2=Math.min(halfH,Rpx*.98);
 const thm=Math.asin(Math.min(halfH2/Rpx,.95));
 vc.save();
 const Mg=vc.createLinearGradient(Vx,cy-halfH2,Vx,cy+halfH2);
 Mg.addColorStop(0,'#8FA2BC');Mg.addColorStop(.5,'#E8F0FC');Mg.addColorStop(1,'#8FA2BC');
 vc.strokeStyle=Mg;vc.lineWidth=6;vc.lineCap='round';
 vc.shadowColor='rgba(200,220,255,.7)';vc.shadowBlur=14;
 vc.beginPath();
 if(convex)vc.arc(Vx+Rpx,cy,Rpx,Math.PI-thm,Math.PI+thm);
 else vc.arc(Vx-Rpx,cy,Rpx,-thm,thm);
 vc.stroke();vc.shadowBlur=0;
 vc.strokeStyle='rgba(255,255,255,.2)';vc.lineWidth=9;
 vc.beginPath();
 if(convex)vc.arc(Vx+Rpx,cy,Rpx+4,Math.PI-thm,Math.PI+thm);
 else vc.arc(Vx-Rpx,cy,Rpx-4,-thm,thm);
 vc.stroke();
 vc.restore();vc.lineCap='butt';
 /* ===== OBJEK: lilin (batang + api) ===== */
 vc.save();
 vc.fillStyle='rgba(237,242,252,.85)';
 vc.beginPath();vc.roundRect(A.x-bw/2,A.y,bw,cy-A.y,3);vc.fill();
 vc.fillStyle='rgba(255,255,255,.25)';
 vc.fillRect(A.x+bw*.3,A.y+3,bw*.15,cy-A.y-6);
 const fl=1+.12*Math.sin(t*9);
 vc.shadowColor='#FFC46B';vc.shadowBlur=14;
 const fg2=vc.createRadialGradient(A.x,A.y-6*fl,0,A.x,A.y-6*fl,10*fl);
 fg2.addColorStop(0,'#FFF3C9');fg2.addColorStop(.5,'#FFC46B');fg2.addColorStop(1,'rgba(255,140,60,0)');
 vc.fillStyle=fg2;vc.beginPath();vc.arc(A.x,A.y-6*fl,10*fl,0,7);vc.fill();
 vc.restore();
 vc.fillStyle='rgba(237,242,252,.75)';vc.font='10px JetBrains Mono';vc.textAlign='center';
 vc.fillText('benda',A.x,cy+18);
 /* ===== SEBELUM ▶: jalur DATANG saja (dashed) ===== */
 if(p1+p2<=0){
  vc.setLineDash([5,7]);vc.strokeStyle=c1+'88';vc.lineWidth=1.6;
  vc.beginPath();vc.moveTo(A.x,A.y);vc.lineTo(P1.x,P1.y);vc.stroke();
  vc.setLineDash([])}
 /* ===== SAAT ▶: foton + garis datang terbentuk ===== */
 if(p1>0){
  const qx=lerp(A.x,P1.x,p1),qy=lerp(A.y,P1.y,p1);
  vc.shadowColor=c1;vc.shadowBlur=12;
  let g1=vc.createLinearGradient(A.x,A.y,qx,qy);
  g1.addColorStop(0,c1+'44');g1.addColorStop(1,c1);
  vc.strokeStyle=g1;vc.lineWidth=3;
  vc.beginPath();vc.moveTo(A.x,A.y);vc.lineTo(qx,qy);vc.stroke();vc.shadowBlur=0;
  glowDot(qx,qy,c1)}
 /* ===== SAAT ▶: garis pantulan terbentuk ===== */
 if(p2>0){
  const qd=Math.min(p2*1.6,1)*(cc.inf?280:Math.hypot(xb-P1.x,yb-P1.y));
  const qx=P1.x+rUx*qd,qy=P1.y+rUy*qd;
  vc.shadowColor=c1;vc.shadowBlur=12;
  let g2=vc.createLinearGradient(P1.x,P1.y,qx,qy);
  g2.addColorStop(0,c1);g2.addColorStop(1,c1+'66');
  vc.strokeStyle=g2;vc.lineWidth=3;
  vc.beginPath();vc.moveTo(P1.x,P1.y);vc.lineTo(qx,qy);vc.stroke();vc.shadowBlur=0;
  glowDot(qx,qy,c1)}
 /* kilau titik pantul */
 vc.save();vc.shadowColor='#fff';vc.shadowBlur=10;
 vc.fillStyle='rgba(255,255,255,'+(.45+.35*Math.sin(t*6))+')';
 vc.beginPath();vc.arc(P1.x,P1.y,3.2,0,7);vc.fill();vc.restore();
 /* ===== GARIS RESMI + BAYANGAN — setelah foton selesai ===== */
 if(reveal>0){
  vc.globalAlpha=reveal;
  let g1=vc.createLinearGradient(A.x,A.y,P1.x,P1.y);
  g1.addColorStop(0,c1+'55');g1.addColorStop(1,c1);
  vc.strokeStyle=g1;vc.lineWidth=2.6;
  vc.beginPath();vc.moveTo(A.x,A.y);vc.lineTo(P1.x,P1.y);vc.stroke();
  let g2=vc.createLinearGradient(P1.x,P1.y,xb,yb);
  g2.addColorStop(0,c1);g2.addColorStop(1,sp>0?'#41E8A5':'#9D7BFF');
  vc.strokeStyle=g2;vc.lineWidth=2.6;
  vc.beginPath();vc.moveTo(P1.x,P1.y);vc.lineTo(xb,yb);vc.stroke();
  if(S.o.arcs){
   const aN=Math.atan2(nY,nX);
   const aI=Math.atan2(A.y-P1.y,A.x-P1.x),aR=Math.atan2(yb-P1.y,xb-P1.x);
   const arcB=(a1,a2,r)=>{let dd=a2-a1;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;
    vc.beginPath();for(let k=0;k<=24;k++){const aa=a1+dd*k/24;
     const x=P1.x+Math.cos(aa)*r,y=P1.y+Math.sin(aa)*r;k?vc.lineTo(x,y):vc.moveTo(x,y)}vc.stroke()};
   vc.lineWidth=2;
   vc.strokeStyle='rgba(65,232,165,.9)';arcB(aN,aI,46);
   vc.strokeStyle=c1;arcB(aN,aR,58);
   const mid1=aN+(((aI-aN)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/2;
   const mid2=aN+(((aR-aN)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/2;
   vc.font='10px JetBrains Mono';vc.textAlign='center';
   vc.fillStyle='rgba(65,232,165,.95)';
   vc.fillText('i',P1.x+Math.cos(mid1)*62,P1.y+Math.sin(mid1)*62+3);
   vc.fillStyle=c1;
   vc.fillText('r',P1.x+Math.cos(mid2)*74,P1.y+Math.sin(mid2)*74+3);
  }
  const bcol=sp>0?'#41E8A5':'#9D7BFF';
  if(!cc.inf){
   arrow(xb,cy,xb,yb,bcol,3,sp<0?[5,4]:[]);
   vc.save();vc.globalAlpha=reveal*.9;
   vc.fillStyle=bcol;
   /* kotak lilin bayangan: dukung dua arah (di atas / di bawah sumbu) */
   const yy0=Math.min(yb,cy),hh0=Math.abs(cy-yb);
   vc.beginPath();vc.roundRect(xb-bw/2,yy0,bw,hh0,3);vc.fill();
   vc.shadowColor=bcol;vc.shadowBlur=8;
   /* api bayangan selalu di ujung terjauh dari sumbu */
   const gl=yb+(hp>0?-4:4);
   vc.beginPath();vc.arc(xb,gl,4,0,7);vc.fill();
   vc.restore();
   vc.fillStyle=bcol;vc.font='10px JetBrains Mono';vc.textAlign='center';
   const stat=(sp>0?'NYATA':'MAYA')+', '+(hp>0?'TEGAK':'TERBALIK')+', '+cc.size;
   vc.fillText('s′='+fmt(sp,2)+'m'+(Math.abs(sp)>40?' →':''),xb,cy+(hp>0?-14:28));
   vc.fillText(stat+(clipped?' *':''),xb,cy+(hp>0?-28:42));
   if(clipped){vc.fillStyle='rgba(255,196,107,.85)';vc.font='9px JetBrains Mono';
    vc.fillText('* sebagian di luar bingkai (nilai aktual di HUD)',xb,cy+(hp>0?-42:56))}
  }else{
   vc.fillStyle='rgba(237,242,252,.85)';vc.font='11px JetBrains Mono';vc.textAlign='left';
   vc.fillText('s = f → sinar pantul SEJAJAR → bayangan di tak hingga (s′ = ∞)',axL+20,cy-24);
  }
  vc.globalAlpha=1;
 }
 drawScaleBar(186,H-30,scale,c1)}

/* ============================================================
   AUTO-POSITION: parkirkan konsol analisis di zona kanvas
   yang paling kosong (diukur dari piksel terang scene)
   ============================================================ */
export function positionConsole(){
 const c=document.getElementById('console');if(!c)return;
 c.classList.add('show');
 const cw=c.offsetWidth||440,ch=c.offsetHeight||160;
 const W=innerWidth,H=innerHeight;
 const slots=[
  ['tengah-atas',(W-cw)/2,64],
  ['kiri-atas',110,64],
  ['kanan-atas',W-cw-110,64],
  ['kiri-tengah',150,clamp((H-ch)/2,64,Math.max(H-ch-130,64))],
  ['kanan-tengah',W-cw-150,clamp((H-ch)/2,64,Math.max(H-ch-130,64))],
  ['kiri-bawah',150,Math.max(H-ch-120,64)],
  ['kanan-bawah',W-cw-150,Math.max(H-ch-120,64)]
 ];
 let best=slots[0],bestScore=Infinity;
 for(const s of slots){
  const sc=busyScore(s[1],s[2],cw,Math.min(ch,180));
  if(sc<bestScore){bestScore=sc;best=s}
  if(bestScore===0)break;
 }
 c.style.left=Math.round(clamp(best[1],8,W-cw-8))+'px';
 c.style.top=Math.round(clamp(best[2],8,H-ch-8))+'px';
}
function busyScore(x,y,w,h){
 try{
  if(!vc)return 999;
  const d=devicePixelRatio||1;
  const sx=Math.max(0,Math.round(x*d)),sy=Math.max(0,Math.round(y*d));
  const sw=Math.min(Math.round(w*d),vp.width-sx),sh=Math.min(Math.round(h*d),vp.height-sy);
  if(sw<20||sh<20)return 999;
  const px=vc.getImageData(sx,sy,sw,sh).data;
  let hits=0;
  for(let i=0;i<px.length;i+=16){
   const lum=px[i]*0.3+px[i+1]*0.5+px[i+2]*0.2;
   if(px[i+3]>40&&lum>100)hits++;
  }
  return hits;
 }catch(e){return 999}
}