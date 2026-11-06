import {watchSurface} from './surface.mjs';
import {createScene} from './renderer.mjs';
import {createSignatureSound} from './sound.mjs';
const themes={titanium:{accent:[1,.105,.0137],fill:[.105,.262,1]},amber:{accent:[.9,.49,.12],fill:[.065,.26,.85]},rose:{accent:[.9,.06,.27],fill:[.21,.15,.4]},forest:{accent:[.65,.49,.19],fill:[.08,.2,.13]},crimson:{accent:[.9,.06,.025],fill:[.2,.23,.4]},spectrum:{accent:[.03,.7,.8],fill:[.6,.03,.6]}};
// Keep a display-aligned deadline instead of dropping slightly early 60Hz
// callbacks. High-refresh displays still average at most 60 draws per second.
export function createFrameClock(){
 const period=1000/60,tolerance=2;let previous=null,due=null;
 return{
  step(now){
   if(!Number.isFinite(now))return null;
   if(previous===null){previous=now;due=now+period;return{dt:0,span:0}}
   if(now<due-tolerance)return null;
   const span=Math.max(0,now-previous);previous=now;due+=period;
   // One new deadline after a stall, never a burst of catch-up work.
   if(due<now-tolerance)due=now+period;
   return{dt:Math.min(100,span),span};
  },
  reset(){previous=null;due=null}
 };
}
// One bounded recheck for a frame that missed a still-pending GPU fence.
// A new display slot or any lifecycle stop invalidates the older callback.
export function createFrameRetry({active,render,schedule=setTimeout,cancel=clearTimeout}){
 let pending=null,generation=0;
 const clear=()=>{generation++;if(pending!==null)cancel(pending);pending=null};
 return{clear,pending:()=>pending!==null,once(){
  clear();if(!active())return;const ticket=generation;
  pending=schedule(()=>{
   if(ticket!==generation)return;
   pending=null;generation++;
   if(active())render();
  },4);
 }};
}
// One shared composition for runtime motion and uncropped containment proof.
export function signatureFlight(width,height,phase){
 const aspect=width/height,worldH=Math.max(5.4,9.4/aspect),worldW=worldH*aspect;
 const t=phase*Math.PI*2,room=worldW*.90;
 const low=.35-room/2+3.1,high=.35+room/2-6.6,center=(low+high)/2,amp=Math.max(0,(high-low)/2);
 const travelX=center+amp*Math.sin(t),bank=Math.cos(t);
 return{travelX,bank,lightMix:.40+.25*Math.sin(t*.5),hover:.105*Math.sin(t*3)+.025*Math.sin(t*2),flight:{x:travelX,min:low,max:high,direction:bank>=0?'right':'left'}};
}
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
export function mountSignature(root){
 if(root.dataset.mounted)return;root.dataset.mounted='true';const clearSurface=watchSurface(root);
 const canvas=root.querySelector('.esig-canvas'),pause=root.querySelector('.esig-pause'),sound=root.querySelector('.esig-sound'),audio=createSignatureSound();
 const state={running:false,visible:false,paused:false,sound:false,phase:0,elapsed:0,frames:0,frameMs:0,drawMs:[],retryAttempts:0,retryFrames:0,mode:'still'};
 const clock=createFrameClock();let scene=null,raf=0;
 const retry=createFrameRetry({active:()=>!!scene&&state.running&&state.visible&&!state.paused&&!document.hidden&&!reduce.matches,render:()=>{state.retryAttempts++;if(draw())state.retryFrames++}});
 function controls(){if(sound){sound.hidden=!audio.available;sound.setAttribute('aria-pressed',String(state.sound));sound.setAttribute('aria-label',state.sound?'Stop signature sound':'Play signature sound');sound.title=state.sound?'Stop sound':'Play sound';}root.dataset.sound=String(state.sound);root.dataset.running=String(state.running);root.dataset.phase=state.phase.toFixed(3);pause.hidden=reduce.matches||!scene;pause.setAttribute('aria-label',state.paused?'Resume signature animation':'Pause signature animation');pause.title=state.paused?'Resume motion':'Pause motion';pause.innerHTML=state.paused?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l10 7-10 7Z" fill="currentColor" stroke="none"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';}

 function draw(still=false){if(!scene)return false;const start=performance.now(),pose=signatureFlight(canvas.clientWidth,canvas.clientHeight,state.phase);
  // One room, one continuous trajectory. No modulo wrap, exit or re-entry.
  state.flight=pose.flight;
  const rendered=scene.draw(7.2,{still,...pose,motionTime:state.elapsed/1000});if(rendered){root.dataset.rendered='true';state.mode='webgl';if(!still)state.frames++}
  state.drawMs.push(performance.now()-start);if(state.drawMs.length>120)state.drawMs.shift();return rendered;
 }
 function stop(){retry.clear();audio.stop();state.sound=false;state.running=false;cancelAnimationFrame(raf);raf=0;clock.reset();controls()}
 function frame(now){if(!state.running)return;if(document.hidden||!state.visible||state.paused||reduce.matches){stop();return}const tick=clock.step(now);if(tick){retry.clear();state.phase=(state.phase+tick.dt/24000)%1;state.elapsed+=tick.dt;state.frameMs+=tick.span;if(!draw()&&scene)retry.once();root.dataset.phase=state.phase.toFixed(3)}raf=requestAnimationFrame(frame)}
 function start(){if(!scene||!state.visible||state.paused||document.hidden||reduce.matches){controls();return}if(state.running)return;state.running=true;retry.clear();clock.reset();controls();raf=requestAnimationFrame(frame)}
 function create(){try{scene=createScene(canvas,{hostGround:root.dataset.ground!=='room',...(themes[root.dataset.eslabonLight||root.dataset.theme]||themes.titanium),onLoss(){const lost=scene;scene=null;lost?.dispose();stop();state.mode='fallback';root.dataset.mode='fallback';root.dataset.rendered='false';controls()}});if(scene){root.dataset.mode='webgl';draw(true)}else{state.mode='fallback';root.dataset.mode='fallback';root.dataset.rendered='false'}}catch{scene=null;state.mode='fallback';root.dataset.mode='fallback';root.dataset.rendered='false'}controls()}
 if(sound)sound.addEventListener('click',async()=>{if(state.sound){audio.stop();state.sound=false;controls();return;}if(!state.visible||document.hidden)return;state.sound=true;controls();const ok=await audio.play(()=>{state.sound=false;controls()});if(!ok){state.sound=false;controls()}});
 // THE SCENE WAITS FOR THE PAGE (2026-11-04). Building the WebGL context and
 // compiling the shader at mount blocked the host's first paint on short pages,
 // where the footer is in view at load. The still SVG shows until the page has
 // loaded, the browser is idle, and the footer is visible; then the scene is
 // built once and runs exactly as before.
 let booted=false,booting=false;
 function boot(){booting=false;if(booted)return;booted=true;create();start();}
 function bootWhenIdle(){if(booted||booting)return;booting=true;const go=()=>typeof requestIdleCallback==='function'?requestIdleCallback(boot,{timeout:2000}):setTimeout(boot,200);if(document.readyState==='complete')go();else addEventListener('load',go,{once:true});}
 pause.addEventListener('click',()=>{state.paused=!state.paused;if(state.paused)stop();else start();controls()});
 const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;if(state.visible){if(booted)start();else bootWhenIdle()}else stop()},{threshold:.15});observer.observe(root);
 const resize=new ResizeObserver(()=>{if(!state.running)draw(true)});resize.observe(root);
 const onVisibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',onVisibility);
 const onReduce=()=>{stop();if(reduce.matches)draw(true);else start();controls()};reduce.addEventListener('change',onReduce);
 const themeObserver=new MutationObserver(()=>{if(!booted)return;stop();scene?.dispose();scene=null;create();start()});themeObserver.observe(root,{attributes:true,attributeFilter:['data-eslabon-light','data-theme']});
 root.eslabon={start,stop,stats:()=>({...state,retryPending:retry.pending(),drawMs:[...state.drawMs],fps:state.frameMs?state.frames*1000/state.frameMs:null}),loseContext:()=>scene?.loseForTest(),dispose(){stop();clearSurface();observer.disconnect();resize.disconnect();themeObserver.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduce.removeEventListener('change',onReduce);scene?.dispose();audio.close();delete root.eslabon}};
 return root.eslabon;
}
for(const root of document.querySelectorAll('[data-eslabon-signature]'))mountSignature(root);
