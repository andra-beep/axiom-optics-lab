/* ============================================================
   AXIOM | shortcuts.js — keyboard global + toggle bahasa
   ============================================================ */
import {$,toast,toggleFS,showKeys} from './core.js';
import {S} from './state.js';
import {playPause,resetRun,stepFrame} from './engine.js';

document.addEventListener('keydown',e=>{
 if(e.key==='Escape'){
  document.querySelectorAll('.ovl').forEach(o=>o.classList.remove('show'));
  $('drawer').classList.remove('open');$('pDrawer').classList.remove('open');return}
 const typing=/INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
 if(e.key==='?'&&!typing){showKeys();return}
 if(typing||!$('lab').classList.contains('on'))return;
 if(e.code==='Space'){e.preventDefault();playPause()}
 else if(e.key.toLowerCase()==='r')resetRun();
 else if(e.key==='.')stepFrame();
 else if(e.key.toLowerCase()==='f')toggleFS();
 else if(e.key==='ArrowLeft'&&S.data.length){S.frame=Math.max(S.frame-6,0);$('scrub').value=S.frame;
  import('./engine.js').then(m=>m.updateHUD())}
 else if(e.key==='ArrowRight'&&S.data.length){S.frame=Math.min(S.frame+6,S.data.length-1);$('scrub').value=S.frame;
  import('./engine.js').then(m=>m.updateHUD())}});

 $('lgID').onclick=()=>{$('lgID').classList.add('on');$('lgEN').classList.remove('on')};
 $('lgEN').onclick=()=>{$('lgEN').classList.add('on');$('lgID').classList.remove('on');toast('English UI — i18n menyusul')};