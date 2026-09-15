/* ============================================================
   AXIOM | config.js — data statis: modul, laser, eksperimen
   ============================================================ */
import {C,fmt} from './core.js';
import {kaleidoN,curvedCalc} from './physics.js';

export const MODULES=[
 {tag:'MODUL 01',name:'Pemantulan Cahaya',icon:'🪞',pm:'#3ED6FF',p1:'#1a6fd4',p2:'#4fe0c8',live:true,
  desc:'Tujuh eksperimen bertahap: hukum pemantulan, baur vs teratur, kaleidoskop, cermin cekung & cembung, verifikasi rumus, dan aplikasi nyata.',
  chips:['7 Eksperimen','Ray Diagram']},
 {tag:'MODUL 02',name:'Pembiasan Cahaya',icon:'🔷',pm:'#9D7BFF',p1:'#5b3cc4',p2:'#b18cff',live:false,
  desc:'Hukum Snellius n₁sinθ₁ = n₂sinθ₂ dan pemantulan total pada batas dua medium.',chips:['Snellius','n₁ ≠ n₂']},
 {tag:'MODUL 03',name:'Lensa',icon:'🔍',pm:'#FFC46B',p1:'#c77f1e',p2:'#ffd98a',live:false,
  desc:'Konvergensi dan divergensi berkas oleh lensa tipis — jarak fokus dan bayangan.',chips:['1/f','Nyata–Maya']},
 {tag:'MODUL 04',name:'Dispersi Cahaya',icon:'🌈',pm:'#FF6B81',p1:'#c22e55',p2:'#ff9e9e',live:false,
  desc:'Prisma memecah cahaya putih menjadi spektrum — indeks bias bergantung λ.',chips:['Prisma','Spektrum']},
 {tag:'MODUL 05',name:'Difraksi Kisi',icon:'📏',pm:'#41E8A5',p1:'#0f8f5e',p2:'#7de38a',live:false,
  desc:'Cahaya menekuk melalui kisi d×sinθ = mλ — orde terang dan pengukuran λ.',chips:['d·sinθ = mλ','Orde m']},
 {tag:'MODUL 06',name:'Interferensi Cahaya',icon:'🌊',pm:'#5EA0FF',p1:'#2b5fd9',p2:'#9ec3ff',live:false,
  desc:'Pola pita terang-gelap Young d sinθ = mλ pada layar pengamatan.',chips:['Young','Pita']},
 {tag:'MODUL 07',name:'Alat Optik',icon:'🔭',pm:'#C9A0FF',p1:'#7b4fd4',p2:'#e2ccff',live:false,
  desc:'Rangkai lup, mikroskop, dan teleskop — perbesaran dan jalur berkasnya.',chips:['Lup','Teleskop']}];

export const LASERS=[
 {id:'cyan',label:'Cyan 488nm',c1:'#3ED6FF',c2:'#2B8FD9'},
 {id:'emerald',label:'Emerald 532nm',c1:'#41E8A5',c2:'#2BD9C8'},
 {id:'ruby',label:'Ruby 694nm',c1:'#FF5C7A',c2:'#C22545'},
 {id:'violet',label:'Violet 405nm',c1:'#B48CFF',c2:'#7B4FD4'}];

export const EXPS={
 DATAR:{name:'Cermin Datar — θᵢ = θᵣ',short:'DATAR',icon:'🪞',photon:true,
  params:[{k:'i',l:'Sudut datang i',min:0,max:85,step:1,u:'°',d:25},
          {k:'al',l:'Kemiringan cermin α',min:-30,max:30,step:1,u:'°',d:0},
          {k:'L',l:'Jarak sumber L',min:2,max:10,step:.5,u:'m',d:5},
          {k:'phi',l:'Posisi detektor φ',min:0,max:170,step:5,u:'°',d:40}],
  overlays:[['Jejak foton','trail'],['Busur sudut i & r','arcs'],['Garis normal','norm'],['Partikel berkas','amb']],
  calc:{ins:[{k:'i',l:'i (°)',d:25},{k:'al',l:'α (°)',d:0},{k:'L',l:'L (m)',d:5}],
   f:'θᵢ = |i − α| · β = i − 2α · t = 2L/c',
   run:i=>{const ti=Math.abs(i.i-i.al),t=2*i.L/C*1e9;
    return[['θᵢ = θᵣ',fmt(ti,1)+'°'],['Arah pantul β',fmt(i.i-2*i.al,1)+'°'],['t = 2L/c',fmt(t,1)+' ns']]}},
  tutorial:'Laser menembak cermin datar. Sudut diukur dari garis NORMAL. Eksperimen dasar: α=0, ubah i, amati θᵣ = θᵢ. Tantangan: detektor φ=60° dengan cermin miring α=10° — berapa i agar HIT? (i = φ + 2α)'},
 BAUR:{name:'Baur (Difus) vs Teratur',short:'BAUR',icon:'🌫️',photon:false,
  params:[{k:'i',l:'Sudut datang i',min:0,max:80,step:1,u:'°',d:35},
          {k:'rough',l:'Kekasaran permukaan',min:0,max:100,step:5,u:'%',d:30}],
  overlays:[['Partikel berkas','amb']],
  calc:{ins:[{k:'i',l:'i (°)',d:35},{k:'rough',l:'kekasaran (%)',d:30}],
   f:'sebaran ±(rough/100 × 60°) di sekitar arah specular',
   run:i=>{const sp=i.rough/100*60;
    return[['Sebaran berkas','±'+fmt(sp,0)+'°'],['Jenis',i.rough<10?'teratur (specular)':i.rough>60?'baur kuat (difus)':'semi-baur'],['Arah rata-rata','θᵢ = θᵣ = '+fmt(i.i,0)+'°']]}},
  tutorial:'Kekasaran 0% = cermin: pemantulan TERATUR (specular) — berkas tetap satu. Naikkan kekasaran: permukaan mikroskopis tak rata memantulkan ke segala arah = pemantulan BAUR (difus). Itulah kenapa kertas & dinding terlihat dari segala arah tapi tidak memantulkan gambar seperti cermin!'},
 KALEIDO:{name:'Dua Cermin Bersudut',short:'KALEIDO',icon:'🔮',photon:false,
  params:[{k:'theta',l:'Sudut antar cermin θ',min:10,max:90,step:5,u:'°',d:45},
          {k:'dist',l:'Posisi benda dari poros',min:20,max:80,step:5,u:'%',d:45},
          {k:'hh',l:'Ukuran benda',min:20,max:60,step:5,u:'u',d:35}],
  overlays:[['Label bayangan','klabel']],
  calc:{ins:[{k:'theta',l:'θ (°)',d:45}],
   f:'n = 360/θ − 1 (benda pada garis bagi; 360/θ genap)',
   run:i=>[['Jumlah bayangan n',kaleidoN(i.theta)+' buah'],['360/θ',fmt(360/i.theta,1)],['Aplikasi','kaleidoskop']]},
  tutorial:'Dua cermin membentuk sudut θ. Bayangan terakhir dari satu cermin menjadi benda bagi cermin lain → bayangan berlipat. Benda pada garis bagi: n = 360/θ − 1 (jika 360/θ genap). Coba θ=60° → n=5; θ=90° → n=3; θ→0° (sejajar) → bayangan tak terhingga!'},
 CEKUNG:{name:'Cermin Cekung — Ray Diagram',short:'CEKUNG',icon:'🥣',photon:false,
  params:[{k:'R',l:'Radius kelengkungan R',min:2,max:20,step:.5,u:'m',d:8},
          {k:'s',l:'Jarak benda s',min:.5,max:30,step:.1,u:'m',d:12},
          {k:'h',l:'Tinggi benda h',min:.5,max:8,step:.1,u:'m',d:3}],
  overlays:[['Sinar istimewa #3 (ke C)','r3'],['Jejak foton','trail'],['Label titik F & C','fclabel']],
  calc:{ins:[{k:'R',l:'R (m)',d:8},{k:'s',l:'s (m)',d:12},{k:'h',l:'h (m)',d:3}],
   f:'f = R/2 · 1/f = 1/s + 1/s′ · M = −s′/s',
   run:i=>{const c=curvedCalc(i,false);
    if(c.inf)return[['f = R/2',fmt(i.R/2,2)+' m'],['s′','∞ (bayangan tak hingga)'],['Sinar pantul','SEJAJAR — prinsip reflektor!']];
    return[['f = R/2',fmt(c.fAbs,2)+' m'],['s′',fmt(c.sPrime,2)+' m'],['M = −s′/s',fmt(c.M,3)],
     ['Bayangan',(c.real?'nyata':'maya')+', '+(c.tegak?'tegak':'terbalik')+', '+c.size]]}},
  tutorial:'Tiga sinar istimewa digambar otomatis: (1) sejajar sumbu → pantul melalui F; (2) melalui F → pantul sejajar; (3) menuju pusat C → pantul sendiri. Perpotongan = bayangan. Coba 5 zona: s<f (maya tegak besar), s=f (∞), f<s<2f (nyata besar), s=2f (sama besar), s>2f (nyata kecil). Geser slider dan lihat SEMUA representasi berubah serentak!'},
 CEMBUNG:{name:'Cermin Cembung — Sifat Bayangan',short:'CEMBUNG',icon:'🛡️',photon:false,
  params:[{k:'R',l:'Radius kelengkungan R',min:2,max:20,step:.5,u:'m',d:8},
          {k:'s',l:'Jarak benda s',min:.5,max:30,step:.1,u:'m',d:6},
          {k:'h',l:'Tinggi benda h',min:.5,max:8,step:.1,u:'m',d:3}],
  overlays:[['Sinar istimewa #3 (ke C)','r3'],['Jejak foton','trail'],['Label titik F & C','fclabel']],
  calc:{ins:[{k:'R',l:'R (m)',d:8},{k:'s',l:'s (m)',d:6},{k:'h',l:'h (m)',d:3}],
   f:'f = −R/2 (maya) · 1/f = 1/s + 1/s′',
   run:i=>{const c=curvedCalc(i,true);
    return[['f = −R/2',fmt(-c.fAbs,2)+' m'],['s′ (maya)',fmt(c.sPrime,2)+' m'],['M',fmt(c.M,3)],
     ['Bayangan','SELALU: maya, tegak, diperkecil']]}},
  tutorial:'Cermin cembung: F & C di BELAKANG cermin. Bayangan selalu maya, tegak, diperkecil — untuk posisi benda APA PUN. Bukti: garis putus-putus (perpanjangan sinar) bertemu di belakang cermin. Meski benda sangat jauh, |M| < 1 selalu. Klik ▶ beberapa kali dengan s berbeda dan periksa tabelnya!'},
 KUANTA:{name:'Verifikasi 1/f = 1/s + 1/s′',short:'KUANTA',icon:'🧮',photon:false,
  params:[{k:'R',l:'Radius kelengkungan R',min:2,max:20,step:.5,u:'m',d:10},
          {k:'s',l:'Jarak benda s',min:.5,max:30,step:.1,u:'m',d:15},
          {k:'h',l:'Tinggi benda h',min:.5,max:8,step:.1,u:'m',d:3}],
  overlays:[['Sinar istimewa #3 (ke C)','r3'],['Noise pengukuran ±2%','noise']],
  calc:{ins:[{k:'R',l:'R (m)',d:10},{k:'s',l:'s (m)',d:15}],
   f:'1/s′ = 1/f − 1/s',
   run:i=>{const f=i.R/2,inv=1/f-1/i.s;
    return[['1/f',fmt(1/f,4)+' /m'],['1/s',fmt(1/i.s,4)+' /m'],['1/s′ (teori)',fmt(inv,4)+' /m'],['s′ (teori)',fmt(1/inv,2)+' m']]}},
  tutorial:'Eksperimen kuantitatif: klik ▶ (Rekam Data) pada beberapa nilai s — setiap rekaman menambah titik pada grafik 1/s vs 1/s′. Jika titik-titik jatuh pada garis lurus, rumus 1/f = 1/s + 1/s′ terverifikasi! Aktifkan "Noise ±2%" untuk simulasi ketidakpastian alat nyata, lalu hitung error-nya.'},
 APLIKASI:{name:'Aplikasi: Spion · Reflektor · Teleskop',short:'APLIKASI',icon:'🔭',photon:false,
  params:[{k:'R',l:'Radius kelengkungan R',min:2,max:20,step:.5,u:'m',d:4},
          {k:'s',l:'Jarak benda s',min:.5,max:30,step:.1,u:'m',d:6},
          {k:'h',l:'Tinggi benda h',min:.5,max:8,step:.1,u:'m',d:1.5}],
  overlays:[['Sinar istimewa #3 (ke C)','r3'],['Label titik F & C','fclabel']],
  calc:{ins:[{k:'R',l:'R (m)',d:4},{k:'s',l:'s (m)',d:6},{k:'h',l:'h (m)',d:1.5}],
   f:'tergantung preset aktif (cembung / cekung)',
   run:(i,ctx)=>{const cv=ctx&&ctx.preset==='spion';const c=curvedCalc(i,cv);
    if(c.inf)return[['Konfigurasi',cv?'cembung':'cekung'],['s′','∞ — sinar pantul sejajar']];
    return[['Konfigurasi',cv?'cembung (spion)':'cekung'],['s′',fmt(c.sPrime,2)+' m'],['M',fmt(c.M,3)],
     ['Bayangan',(c.real?'nyata':'maya')+', '+(c.tegak?'tegak':'terbalik')+', '+c.size]]}},
  tutorial:'Tiga preset dunia nyata: (1) SPION — cermin cembung: bayangan maya diperkecil → medan pandang luas, "objects are closer than they appear". (2) REFLEKTOR — sumber di F cermin cekung → pantulan SEJAJAR (senter/lampu mobil). (3) TELELESKOP — benda sangat jauh → bayangan kecil terbalik dekat F.'}
};

export const EXPIDS=Object.keys(EXPS);

export const CONCEPT={
 DATAR:'Hukum pemantulan: sinar datang, normal, dan sinar pantul satu bidang; θᵢ = θᵣ dari normal. Memiringkan cermin α memutar pantulan 2α (β = i − 2α). Cermin datar: bayangan maya, tegak, sama besar, simetris.',
 BAUR:'Pemantulan teratur (specular) pada permukaan licin → arah pantul seragam, gambar terbentuk. Pemantulan baur (difus) pada permukaan kasar → sinar menyebar, tak ada gambar, tapi benda TERLIHAT dari segala arah. Kertas = baur; cermin = teratur.',
 KALEIDO:'Dua cermin bersudut θ: bayangan terakhir pada satu cermin menjadi benda bagi cermin lain → n bayangan. Benda di garis bagi: n = 360/θ − 1 bila 360/θ genap. θ mengecil → n bertambah; θ→0 (sejajar) → n tak hingga.',
 CEKUNG:'Cermin cekung: f = R/2. Lima zona benda: s<f → maya tegak diperbesar (kaca rias); s=f → bayangan di ∞; f<s<2f → nyata terbalik diperbesar; s=2f → nyata sama besar; s>2f → nyata terbalik diperkecil.',
 CEMBUNG:'Cermin cembung: f maya (−R/2). Bayangan SELALU maya, tegak, diperkecil untuk posisi apa pun → medan pandang luas. Sinar pantul divergen; perpanjangannya bertemu di belakang cermin.',
 KUANTA:'Persamaan cermin 1/f = 1/s + 1/s′ dan perbesaran M = −s′/s = h′/h. Konvensi tanda: s′ positif = nyata (depan), negatif = maya (belakang); M negatif = terbalik. Verifikasi lewat grafik 1/s vs 1/s′: garis lurus bergradien −1 dengan perpotongan 1/f.',
 APLIKASI:'Spion = cembung (maya, kecil, bidang luas). Reflektor senter = cekung dengan sumber di F → sinar sejajar. Teleskop reflektor = cekung dengan benda sangat jauh → bayangan nyata kecil di dekat F untuk diperbesar okuler.'};

export const DEF={DATAR:{i:25,al:0,L:5,phi:40},BAUR:{i:35,rough:30},KALEIDO:{theta:45,dist:45,hh:35},
 CEKUNG:{R:8,s:12,h:3},CEMBUNG:{R:8,s:6,h:3},KUANTA:{R:10,s:15,h:3},APLIKASI:{R:4,s:6,h:1.5}};