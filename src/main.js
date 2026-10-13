/* ============================================================
   AXIOM | main.js — bootstrap: impor berurutan + jembatan onclick
   ============================================================ */
import './styles.css';

import {$,store,sndOn,toast,showOvl,hideOvl,toggleFS,showKeys,toggleSnd} from './core.js';
import {S} from './state.js';
import {buildCarousel,applyCar,restartAuto,modEnter,enterLab,goHome,toggleDrawer,chooseMode,askMode,route} from './home.js';
import {resetRun,playPause,stepFrame,updateHUD,loop,closeConsole} from './engine.js';
import {togglePop,toggleDrawerLab,renderExpList,renderLaserList,applyLaser,renderParams,renderOverlays,renderPresets,setExp,showTutor,resetParams} from './uilab.js';
import {startChallenge,checkChallenge} from './challenge.js';
import {openPanel,closePanel,renderCalc,renderAIHead,renderDataTable,expGraph,expData,clrData,doCalc,expHist,clrHist,aiSend} from './panels.js';
import {toggleRec} from './recorder.js';
import './shortcuts.js';

/* ---------- INIT ---------- */
const savedL=store.get('laser',null);if(savedL)S.laser=savedL;
applyLaser();
renderExpList();renderLaserList();renderParams();renderOverlays();renderPresets();
renderCalc();renderAIHead();renderDataTable();
 $('tUnit').textContent=' ns';
if(!sndOn)$('btnSnd').textContent='🔇';
updateHUD();requestAnimationFrame(loop);
buildCarousel();setTimeout(applyCar,80);restartAuto();
route();

/* ---------- JEMBATAN onclick HTML ---------- */
Object.assign(window,{
 toggleDrawer,enterLab,askMode,chooseMode,toggleFS,goHome,toggleDrawerLab,togglePop,
 openPanel,closePanel,resetRun,playPause,stepFrame,
 showKeys,toggleRec,toggleSnd,showTutor,hideOvl,showOvl,
 startChallenge,checkChallenge,closeConsole,
 expGraph,expData,clrData,doCalc,expHist,clrHist,aiSend,
 modEnter,setExp,resetParams,toast});