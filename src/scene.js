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
 vc=vp.getContext('2d');vc.setTransform(d,0,0,d,0,0)}
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

/* ---- E1: cermin datar ---- */
function drawDatar(W,H,t,c1,c2,p,f){
 const Lpx=Math.min(30*p.L,W*.5-215),OX=W/2,OY=H*.54,a=p.al*DEG;
 const nX=-Math.sin(a),nY=-Math.cos(a);
 const dInX=Math.sin(p.i*DEG),dInY=Math.cos(p.i*DEG);
 const rCvX=Math.sin((p.i-2*p.al)*DEG),rCvY=-Math.cos((p.i-2*p.al)*DEG);
 const lasX=OX-dInX*Lpx,lasY=OY-dInY*Lpx;
 const detX=OX+Math.sin(p.phi*DEG)*Lpx,detY=OY-Math.cos(p.phi*DEG)*Lpx;
 vc.setLineDash([3,9]);vc.strokeStyle=c1+'2A';vc.lineWidth=1;
 vc.beginPath();vc.arc(OX,OY,Lpx,0,7);vc.stroke();vc.setLineDash([]);
 if(S.o.norm){vc.setLineDash([4,7]);vc.strokeStyle='rgba(237,242,252,.4)';vc.lineWidth=1.4;
  vc.beginPath();vc.moveTo(OX-nX*84,OY-nY*84);vc.lineTo(OX+nX*84,OY+nY*84);vc.stroke();vc.setLineDash([]);
  vc.fillStyle='rgba(237,242,252,.55)';vc.font='9px JetBrains Mono';vc.textAlign='center';
  vc.fillText('NORMAL',OX+nX*102,OY+nY*102+3)}
 if(S.o.arcs){
  const aN=Math.atan2(nY,nX),aI=Math.atan2(-dInY,-dInX),aR=Math.atan2(rCvY,rCvX);
  const arcB=(a1,a2,r)=>{let dd=a2-a1;while(dd>Math.PI)dd-=2*Math.PI;while(dd<-Math.PI)dd+=2*Math.PI;
   vc.beginPath();for(let k=0;k<=24;k++){const aa=a1+dd*k/24;
    const x=OX+Math.cos(aa)*r,y=OY+Math.sin(aa)*r;k?vc.lineTo(x,y):vc.moveTo(x,y)}vc.stroke()};
  vc.lineWidth=2;
  vc.strokeStyle='rgba(65,232,165,.85)';arcB(aN,aI,46);
  vc.strokeStyle=c1;arcB(aN,aR,58);
  vc.font='10px JetBrains Mono';vc.textAlign='center';
  const mid1=aN+(((aI-aN)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/2;
  const mid2=aN+(((aR-aN)%(2*Math.PI)+3*Math.PI)%(2*Math.PI)-Math.PI)/2;
  vc.fillStyle='rgba(65,232,165,.95)';vc.fillText('i='+fmt(physDatar(p).th,0)+'°',OX+Math.cos(mid1)*66,OY+Math.sin(mid1)*66+3);
  vc.fillStyle=c1;vc.fillText('r='+fmt(physDatar(p).th,0)+'°',OX+Math.cos(mid2)*78,OY+Math.sin(mid2)*78+3)}
 vc.shadowColor=c1;vc.shadowBlur=12;
 let g1=vc.createLinearGradient(lasX,lasY,OX,OY);
 g1.addColorStop(0,c1+'33');g1.addColorStop(1,c1+'EE');
 vc.strokeStyle=g1;vc.lineWidth=3;
 vc.beginPath();vc.moveTo(lasX,lasY);vc.lineTo(OX,OY);vc.stroke();
 const endX=OX+rCvX*Lpx,endY=OY+rCvY*Lpx;
 let g2=vc.createLinearGradient(OX,OY,endX,endY);
 g2.addColorStop(0,c1+'EE');g2.addColorStop(1,c1+'33');
 vc.strokeStyle=g2;vc.lineWidth=3;
 vc.beginPath();vc.moveTo(OX,OY);vc.lineTo(endX,endY);vc.stroke();vc.shadowBlur=0;
 vc.save();vc.translate(OX,OY);vc.rotate(-a);
 vc.shadowColor='rgba(200,220,255,.7)';vc.shadowBlur=14;
 const mg=vc.createLinearGradient(-110,0,110,0);
 mg.addColorStop(0,'#6E7F99');mg.addColorStop(.5,'#E8F0FC');mg.addColorStop(1,'#6E7F99');
 vc.strokeStyle=mg;vc.lineWidth=6;vc.lineCap='round';
 vc.beginPath();vc.moveTo(-110,0);vc.lineTo(110,0);vc.stroke();
 vc.shadowBlur=0;vc.strokeStyle='rgba(255,255,255,.25)';vc.lineWidth=8;
 vc.beginPath();vc.moveTo(-104,5);vc.lineTo(104,5);vc.stroke();
 vc.restore();vc.lineCap='butt';
 vc.save();vc.translate(lasX,lasY);vc.rotate(Math.atan2(dInY,dInX));
 vc.fillStyle=c2;vc.shadowColor=c2;vc.shadowBlur=12;
 vc.beginPath();vc.roundRect(-8,-9,34,18,7);vc.fill();
 vc.fillStyle='#0B1120';vc.beginPath();vc.roundRect(-2,-4,10,8,3);vc.fill();
 vc.restore();vc.shadowBlur=0;
 vc.fillStyle='rgba(237,242,252,.6)';vc.font='9px JetBrains Mono';vc.textAlign='center';
 vc.fillText('LASER',lasX,lasY+28);
 const hit=physDatar(p).hitTarget;
 vc.save();vc.translate(detX,detY);vc.rotate(Math.atan2(OY-detY,OX-detX));
 vc.shadowColor=hit?'#41E8A5':c1;vc.shadowBlur=hit?26:10;
 vc.fillStyle=hit?'#41E8A5':c2;
 vc.beginPath();vc.arc(0,0,13,Math.PI*.6,Math.PI*1.4);vc.lineTo(0,0);vc.closePath();vc.fill();
 vc.shadowBlur=0;vc.fillStyle='rgba(11,17,32,.9)';vc.fillRect(-4,-3,9,6);
 vc.restore();
 vc.fillStyle=hit?'#41E8A5':'rgba(237,242,252,.6)';vc.font='9px JetBrains Mono';vc.textAlign='center';
 vc.fillText(hit?'DETEKTOR ✔':'DETEKTOR',detX,detY+30);
 if(S.o.amb){ambPh.forEach((q,k)=>{
  q.p=(q.p+.004+.002*(k%3))%1;
  const uu=q.p*2;let ax,ay;
  if(uu<1){ax=lerp(lasX,OX,uu);ay=lerp(lasY,OY,uu)}
  else{ax=lerp(OX,endX,uu-1);ay=lerp(OY,endY,uu-1)}
  vc.fillStyle=c1+'66';vc.beginPath();vc.arc(ax,ay,1.8,0,7);vc.fill()})}
 photonAlong([{x:lasX,y:lasY},{x:OX,y:OY},{x:endX,y:endY}],(f.u||0)/2,c1);
 vc.save();vc.shadowColor='#fff';vc.shadowBlur=10;
 vc.fillStyle='rgba(255,255,255,'+(.5+.4*Math.sin(t*6))+')';
 vc.beginPath();vc.arc(OX,OY,3.4,0,7);vc.fill();vc.restore();
 if(Lpx>0)drawScaleBar(186,H-30,Lpx/p.L,c1)}

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

/* ---- E4–E7: cermin lengkung ---- */
function drawCurved(W,H,t,c1,c2,p,f){
 const convex=S.exp==='CEMBUNG'||(S.exp==='APLIKASI'&&S.preset==='spion');
 const cc=curvedCalc(p,convex);
 const cy=H*.5,Vx=Math.round(W*.62);
 const spDisp=cc.inf?cc.fAbs:Math.min(Math.abs(cc.sPrime),40);
 const hDisp=cc.inf?0:clamp(cc.hp,-9,9);
 const clipped=!cc.inf&&(Math.abs(cc.sPrime)>40||Math.abs(cc.hp)>9.01);
 let scale=Math.min(
  (Vx-185)/Math.max(p.s,2.5),
  (W-Vx-100)/Math.max(spDisp,2.5),
  (cy-66)/Math.max(Math.abs(hDisp),p.h,1.6),
  46);
 scale=Math.max(scale,4);
 const bx=Vx-p.s*scale,by=cy-p.h*scale;
 const fsg=convex?1:-1;
 const Fx=Vx+fsg*cc.fAbs*scale,Cx=Vx+fsg*2*cc.fAbs*scale;
 const Rpx=p.R*scale;
 vc.setLineDash([2,8]);vc.strokeStyle='rgba(237,242,252,.3)';vc.lineWidth=1;
 vc.beginPath();vc.moveTo(60,cy);vc.lineTo(W-60,cy);vc.stroke();vc.setLineDash([]);
 const halfH=Math.min(92,Rpx*.55),thm=halfH/Rpx;
 vc.save();
 const Mg=vc.createLinearGradient(Vx,cy-halfH,Vx,cy+halfH);
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
 if(S.o.fclabel){
  const dot=(x,y,lbl,maya)=>{
   vc.fillStyle=maya?'#9D7BFF':'#FFC46B';
   vc.beginPath();vc.arc(x,y,4,0,7);vc.fill();
   vc.font='10px JetBrains Mono';vc.textAlign='center';
   vc.fillText(lbl,x,y-10)};
  dot(Fx,cy,'F',convex);dot(Cx,cy,'C (2F)',convex)}
 arrow(bx,cy,bx,by,'#EDF2FC',4);
 vc.fillStyle='#EDF2FC';vc.font='10px JetBrains Mono';vc.textAlign='center';
 vc.fillText('h='+fmt(p.h,1)+'m',bx,cy+18);
 if(cc.inf){
  const m1=(cy-by)/(Fx-Vx);
  vc.strokeStyle=c1;vc.lineWidth=2.6;
  vc.beginPath();vc.moveTo(Vx,by);vc.lineTo(Vx-320,by-m1*320);vc.stroke();
  vc.strokeStyle=c2;vc.lineWidth=2.2;
  vc.beginPath();vc.moveTo(Vx,cy);vc.lineTo(Vx-320,cy+(p.h/p.s)*320);vc.stroke();
  vc.fillStyle='rgba(237,242,252,.85)';vc.font='11px JetBrains Mono';vc.textAlign='left';
  vc.fillText('s = f → semua sinar pantul SEJAJAR → s′ = ∞',Math.max(bx-40,150),by-16);
  photonAlong([{x:bx,y:by},{x:Vx,y:by},{x:Vx-320,y:by-m1*330}],(f.u||0)/2,c1);
  drawScaleBar(186,H-30,scale,c1);
  return}
 const sp=cc.sPrime,M=cc.M,hp=cc.hp;
 const xb=Vx-spDisp*scale,yb=cy-hDisp*scale;
 arrow(bx,by,Vx,by,c1,2.4);
 let d1x,d1y;
 if(!convex){d1x=Fx-Vx;d1y=cy-by}
 else{d1x=Vx-Fx;d1y=by-cy}
 const L1=Math.hypot(d1x,d1y)||1;d1x/=L1;d1y/=L1;
 vc.strokeStyle=c1;vc.lineWidth=2.4;
 vc.beginPath();vc.moveTo(Vx,by);vc.lineTo(Vx+d1x*340,by+d1y*340);vc.stroke();
 if(sp<0){vc.setLineDash([5,6]);vc.strokeStyle=c1+'99';
  vc.beginPath();vc.moveTo(Vx,by);vc.lineTo(xb,yb);vc.stroke();vc.setLineDash([])}
 const den2=(Fx-bx);
 const M2y=Math.abs(den2)>1e-6?by+(cy-by)*(Vx-bx)/den2:cy;
 arrow(bx,by,Vx,M2y,c1,2.4);
 vc.strokeStyle=c1;vc.lineWidth=2.4;
 vc.beginPath();vc.moveTo(Vx,M2y);vc.lineTo(Vx-330,M2y);vc.stroke();
 if(sp<0){vc.setLineDash([5,6]);vc.strokeStyle=c1+'99';
  vc.beginPath();vc.moveTo(Vx,M2y);vc.lineTo(xb,yb);vc.stroke();vc.setLineDash([])}
 if(S.o.r3&&Math.abs(Cx-bx)>.35*scale){
  const M3y=by+(cy-by)*(Vx-bx)/(Cx-bx);
  arrow(bx,by,Vx,M3y,c2,2);
  const dx3=bx-Vx,dy3=by-M3y,L3=Math.hypot(dx3,dy3)||1;
  vc.strokeStyle=c2;vc.lineWidth=2;
  vc.beginPath();vc.moveTo(Vx,M3y);vc.lineTo(Vx+dx3/L3*320,M3y+dy3/L3*320);vc.stroke();
  if(sp<0){vc.setLineDash([5,6]);vc.strokeStyle=c2+'99';
   vc.beginPath();vc.moveTo(Vx,M3y);vc.lineTo(xb,yb);vc.stroke();vc.setLineDash([])}}
 const bcol=sp>0?'#41E8A5':'#9D7BFF';
 arrow(xb,cy,xb,yb,bcol,4,sp<0?[6,6]:[]);
 const lx=Math.min(Math.max(xb,150),W-125);
 vc.fillStyle=bcol;vc.font='10px JetBrains Mono';vc.textAlign='center';
 const stat=(sp>0?'NYATA':'MAYA')+', '+(hp>0?'TEGAK':'TERBALIK')+', '+cc.size;
 vc.fillText('s′='+fmt(sp,2)+'m'+(Math.abs(sp)>40?' →':''),lx,cy+(hp>0?-14:28));
 vc.fillText(stat+(clipped?' *':''),lx,cy+(hp>0?-28:42));
 if(clipped){vc.fillStyle='rgba(255,196,107,.85)';vc.font='9px JetBrains Mono';
  vc.fillText('* sebagian di luar bingkai (nilai aktual di HUD)',lx,cy+(hp>0?-42:56))}
 photonAlong([{x:bx,y:by},{x:Vx,y:by},{x:Vx+d1x*200,y:by+d1y*200}],(f.u||0)/2,c1);
 drawScaleBar(186,H-30,scale,c1)}