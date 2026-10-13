/* ============================================================
   AXIOM | config.js — data statis: modul, laser, eksperimen
   ============================================================ */
import {C,fmt} from './core.js';
import {kaleidoN,curvedCalc} from './physics.js';

export const MODULES=[
 {tag:'MODUL 01',name:'Pemantulan Cahaya',icon:'🪞',pm:'#3ED6FF',p1:'#1a6fd4',p2:'#4fe0c8',live:true,
  desc:'Empat eksperimen bertahap: cermin datar, dua cermin bersudut, cermin cekung, dan cermin cembung - lengkap dengan ray diagram dan tabel data.',
  chips:['4 Eksperimen','Ray Diagram','Tabel Data']},
 {tag:'MODUL 02',name:'Pembiasan Cahaya',icon:'🔷',pm:'#9D7BFF',p1:'#5b3cc4',p2:'#b18cff',live:false,
  desc:'Hukum Snellius n₁sinθ₁ = n₂sinθ₂ dan pemantulan total pada batas dua medium.',chips:['Snellius','n₁ ≠ n₂']},
 {tag:'MODUL 03',name:'Kisi Difraksi',icon:'📏',pm:'#41E8A5',p1:'#0f8f5e',p2:'#7de38a',live:false,
  desc:'Cahaya menekuk melalui kisi d×sinθ = mλ — orde terang dan pengukuran panjang gelombang.',chips:['d·sinθ = mλ','Orde m']},
 {tag:'MODUL 04',name:'Interferensi Cahaya',icon:'🌊',pm:'#5EA0FF',p1:'#2b5fd9',p2:'#9ec3ff',live:false,
  desc:'Pola pita terang-gelap interferensi Young d sinθ = mλ pada layar pengamatan.',chips:['Young','Pita']}];

export const LASERS=[
 {id:'cyan',label:'Cyan 488nm',c1:'#3ED6FF',c2:'#2B8FD9'},
 {id:'emerald',label:'Emerald 532nm',c1:'#41E8A5',c2:'#2BD9C8'},
 {id:'ruby',label:'Ruby 694nm',c1:'#FF5C7A',c2:'#C22545'},
 {id:'violet',label:'Violet 405nm',c1:'#B48CFF',c2:'#7B4FD4'}];

export const EXPS={
 DATAR:{name:'Pemantulan Cermin Datar',short:'DATAR',icon:'🪞',photon:true,
  params:[{k:'i',l:'Sudut datang i (dari normal)',min:-90,max:90,step:1,u:'°',d:0,abs:true},
          {k:'al',l:'Kemiringan cermin α',min:-180,max:180,step:1,u:'°',d:0},
          {k:'L',l:'Jarak sumber L',min:1,max:40,step:.5,u:'m',d:1}],
  overlays:[['Busur sudut i & r','arcs'],['Garis normal','norm']],
  calc:{ins:[{k:'i',l:'i — sudut datang dari normal (°)',d:0},{k:'al',l:'α — kemiringan cermin (°)',d:0},{k:'L',l:'L — jarak sumber (m)',d:10}],
   f:'θᵢ = |i| (dari normal) = θᵣ  ·  t = 2L/c',
   run:i=>{const th=Math.abs(i.i),t=2*i.L/C*1e9;
    return[['Sudut datang θᵢ',fmt(th,1)+'°'],['Sudut pantul r',fmt(th,1)+'°'],['t = 2L/c',fmt(t,1)+' ns'],['Catatan',i.i<0?'laser di kiri normal':i.i>0?'laser di kanan normal':'laser sepanjang normal']]}},
  tutorial:'Titik 0° = garis NORMAL. Geser ke kanan (0…+90°) atau ke kiri (0…−90°) — laser selalu menyapu sisi depan cermin. Sudut datang sebenarnya adalah |i|, dan selalu r = θᵢ. i = 90°? Laser rata dengan permukaan (grazing). Jalankan ▶ dan lihat busurnya!'},
 KALEIDO:{name:'Dua Cermin Bersudut',short:'KALEIDO',icon:'🔮',photon:false,
  params:[{k:'theta',l:'Sudut antar cermin θ',min:10,max:90,step:5,u:'°',d:45},
          {k:'dist',l:'Posisi benda dari poros',min:20,max:80,step:5,u:'%',d:45},
          {k:'hh',l:'Ukuran benda',min:20,max:60,step:5,u:'u',d:35}],
  overlays:[['Label bayangan','klabel']],
  calc:{ins:[{k:'theta',l:'θ (°)',d:45}],
   f:'n = 360/θ − 1 (benda pada garis bagi; 360/θ genap)',
   run:i=>[['Jumlah bayangan n',kaleidoN(i.theta)+' buah'],['360/θ',fmt(360/i.theta,1)],['Aplikasi','kaleidoskop']]},
  tutorial:'Dua cermin membentuk sudut θ. Bayangan terakhir dari satu cermin menjadi benda bagi cermin lain → bayangan berlipat. Benda pada garis bagi: n = 360/θ − 1 (jika 360/θ genap). Coba θ=60° → n=5; θ=90° → n=3; θ→0° (sejajar) → bayangan tak terhingga!'},
 CEKUNG:{name:'Pemantulan Cermin Cekung',short:'CEKUNG',icon:'🥣',photon:false,
  params:[{k:'R',l:'Radius kelengkungan R',min:2,max:20,step:.5,u:'m',d:8},
          {k:'s',l:'Jarak benda s',min:.5,max:30,step:.1,u:'m',d:12},
          {k:'h',l:'Tinggi benda h',min:1,max:10,step:.5,u:'m',d:1},
          {k:'ang',l:'Sudut sinar datang (0° = sejajar sumbu)',min:0,max:85,step:1,u:'°',d:0}],
  overlays:[['Label titik F & R','fclabel'],['Noise pengukuran ±2%','noise']],
  calc:{ins:[{k:'R',l:'R (m)',d:8},{k:'s',l:'s (m)',d:12},{k:'h',l:'h (m)',d:1}],
   f:'f = R/2 · 1/f = 1/s + 1/s′ · M = −s′/s',
   run:i=>{const c=curvedCalc(i,false);
    if(c.inf)return[['f = R/2',fmt(i.R/2,2)+' m'],['s′','∞ (bayangan tak hingga)'],['Sinar pantul','SEJAJAR — prinsip reflektor!']];
    return[['f = R/2',fmt(c.fAbs,2)+' m'],['s′',fmt(c.sPrime,2)+' m'],['M = −s′/s',fmt(c.M,3)],
     ['Bayangan',(c.real?'nyata':'maya')+', '+(c.tegak?'tegak':'terbalik')+', '+c.size]]}},
  tutorial:'Atur SUDUT SINAR DATANG lewat slider, atau pakai 3 tombol sinar istimewa: (1) sejajar sumbu → pantul melalui F; (2) melalui F → pantul sejajar; (3) melalui R (C) → pantul balik arah. Semuanya mengikuti hukum pemantulan pada permukaan lengkung! Klik ▶ untuk merekam s′ & sifat bayangan. Coba 5 zona: s<f, s=f, f<s<2f, s=2f, s>2f!'},
 CEMBUNG:{name:'Pemantulan Cermin Cembung',short:'CEMBUNG',icon:'🛡️',photon:false,
  params:[{k:'R',l:'Radius kelengkungan R',min:2,max:20,step:.5,u:'m',d:8},
          {k:'s',l:'Jarak benda s',min:.5,max:30,step:.1,u:'m',d:6},
          {k:'h',l:'Tinggi benda h',min:1,max:10,step:.5,u:'m',d:1}],
  presets:[['default','⚗️ Bebas'],['spion','🚗 Spion']],
  overlays:[['Label titik F','fclabel'],['Noise pengukuran ±2%','noise'],['Tampilkan bayangan s′','img'],['Tampilkan zona (I–IV)','zone']],
  calc:{ins:[{k:'R',l:'R (m)',d:8},{k:'s',l:'s (m)',d:6},{k:'h',l:'h (m)',d:3}],
   f:'f = −R/2 (maya) · 1/f = 1/s + 1/s′',
   run:i=>{const c=curvedCalc(i,true);
    return[['f = −R/2',fmt(-c.fAbs,2)+' m'],['s′ (maya)',fmt(c.sPrime,2)+' m'],['M',fmt(c.M,3)],
     ['Bayangan','SELALU: maya, tegak, diperkecil']]}},
  tutorial:'Cermin cembung: F & C di BELAKANG cermin. Bayangan selalu maya, tegak, diperkecil — untuk posisi benda APA PUN. Bukti: garis putus-putus (perpanjangan sinar) bertemu di belakang cermin. Preset Spion: bayangan diperkecil → bidang pandang luas, "objects are closer than they appear"!'}
};
export const EXPIDS=Object.keys(EXPS);

export const CONCEPT={
 DATAR:'Hukum pemantulan (Snellius): sinar datang, normal, dan sinar pantul satu bidang; θᵢ = θᵣ diukur dari normal. Pada cermin datar bayangan bersifat MAYA: tegak, sama besar, dengan s′ = s dan h′ = h.',
 BAUR:'Pemantulan teratur (specular) pada permukaan licin → arah pantul seragam, gambar terbentuk. Pemantulan baur (difus) pada permukaan kasar → sinar menyebar, tak ada gambar, tapi benda TERLIHAT dari segala arah. Kertas = baur; cermin = teratur.',
 CEKUNG:'Cermin cekung: f = R/2. Lima zona benda: s<f → maya tegak diperbesar (kaca rias); s=f → pantulan sejajar (reflektor); f<s<2f → nyata terbalik diperbesar; s=2f → nyata sama besar; s>2f → nyata terbalik diperkecil.',
 CEMBUNG:'Cermin cembung: f maya (−R/2). Bayangan SELALU maya, tegak, diperkecil untuk posisi apa pun → medan pandang luas (spion). Sinar pantul divergen; perpanjangannya bertemu di belakang cermin.',
 KALEIDO:'Dua cermin bersudut θ: bayangan terakhir pada satu cermin menjadi benda bagi cermin lain → n bayangan. Benda di garis bagi: n = 360/θ − 1 bila 360/θ genap. θ mengecil → n bertambah; θ→0 (sejajar) → n tak hingga.'};

export const DEF={DATAR:{i:0,al:0,L:1},BAUR:{i:35,rough:30},
 CEKUNG:{R:8,s:12,h:1,ang:0},CEMBUNG:{R:8,s:6,h:1},KALEIDO:{theta:45,dist:45,hh:35}};