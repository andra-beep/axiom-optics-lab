/* ============================================================
   AXIOM | recorder.js — perekam simulasi (.webm)
   ============================================================ */
import {toast,sfx} from './core.js';
const vp=document.getElementById('bench');
let rec=null,recChunks=[];
export function toggleRec(){
 const btn=document.getElementById('btnRec');
 if(rec){rec.stop();return}
 if(!vp.captureStream||!window.MediaRecorder)return toast('Browser tidak mendukung');
 try{
  const stream=vp.captureStream(30);
  const mime=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')?'video/webm;codecs=vp9':'video/webm';
  rec=new MediaRecorder(stream,{mimeType:mime});recChunks=[];
  rec.ondataavailable=e=>recChunks.push(e.data);
  rec.onstop=()=>{const b=new Blob(recChunks,{type:'video/webm'});
   const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='axiom_optika.webm';a.click();
   rec=null;btn.classList.remove('rec');toast('Rekaman .webm tersimpan ✔')};
  rec.start();btn.classList.add('rec');toast('Merekam meja optik… (klik lagi untuk berhenti)');sfx.start();
 }catch(e){toast('Gagal memulai perekaman')}}