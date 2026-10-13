/* ============================================================
   AXIOM | state.js — satu sumber kebenaran state aplikasi
   ============================================================ */
import {store} from './core.js';
import {DEF,EXPIDS,LASERS} from './config.js';

export const S={laser:'cyan',exp:'DATAR',appMode:store.get('mode','free'),
 presetMap:{CEKUNG:'default',CEMBUNG:'default'},
 p:JSON.parse(JSON.stringify(DEF)), o:{trail:true,arcs:true,norm:true,amb:true,r3:true,fclabel:true,klabel:true,noise:false,zone:true,img:true},
 running:false,paused:false,finished:false,data:[],frame:0,speed:1,
 pts:store.get('pts',{}),ptsM:store.get('ptsM',{}),
 hist:store.get('hist',[]),welcomed:store.get('welcomed',false),tan:null};
EXPIDS.forEach(k=>{if(!S.pts[k])S.pts[k]=[];if(!S.ptsM[k])S.ptsM[k]=[]});

export const P=()=>S.p[S.exp];
export function noisy(v){return S.o.noise?v*(1+(Math.random()-.5)*.04):v}
export function l1(){return LASERS.find(x=>x.id===S.laser).c1}
export function l2(){return LASERS.find(x=>x.id===S.laser).c2}