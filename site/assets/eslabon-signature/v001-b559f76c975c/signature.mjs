import {watchSurface} from './surface.mjs';
import {createScene} from './renderer.mjs';
import {createSignatureSound} from './sound.mjs';
const themes={titanium:{accent:[1,.105,.0137],fill:[.105,.262,1]},amber:{accent:[.9,.49,.12],fill:[.065,.26,.85]},rose:{accent:[.9,.06,.27],fill:[.21,.15,.4]},forest:{accent:[.65,.49,.19],fill:[.08,.2,.13]},crimson:{accent:[.9,.06,.025],fill:[.2,.23,.4]},spectrum:{accent:[.03,.7,.8],fill:[.6,.03,.6]}};
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
export function mountSignature(root){
 if(root.dataset.mounted)return;root.dataset.mounted='true';const clearSurface=watchSurface(root);
 const canvas=root.querySelector('.esig-canvas'),pause=root.querySelector('.esig-pause'),sound=root.querySelector('.esig-sound'),audio=createSignatureSound();
 const state={running:false,visible:false,paused:false,sound:false,phase:0,elapsed:0,frames:0,frameMs:0,drawMs:[],mode:'still'};
 let scene=null,raf=0,last=0;
 function controls(){if(sound){sound.hidden=!audio.available;sound.setAttribute('aria-pressed',String(state.sound));sound.setAttribute('aria-label',state.sound?'Stop signature sound':'Play signature sound');sound.title=state.sound?'Stop sound':'Play sound';}root.dataset.sound=String(state.sound);root.dataset.running=String(state.running);root.dataset.phase=state.phase.toFixed(3);pause.hidden=reduce.matches||!scene;pause.setAttribute('aria-label',state.paused?'Resume signature animation':'Pause signature animation');pause.title=state.paused?'Resume motion':'Pause motion';pause.innerHTML=state.paused?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l10 7-10 7Z" fill="currentColor" stroke="none"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';}

 function draw(still=false){if(!scene)return;const start=performance.now(),w=canvas.clientWidth,h=canvas.clientHeight,aspect=w/h,worldH=Math.max(5.4,9.4/aspect),worldW=worldH*aspect;
  // One room, one continuous trajectory. No modulo wrap, exit or re-entry.
  const t=state.phase*Math.PI*2,room=worldW*.90;
  const low=.35-room/2+3.1,high=.35+room/2-6.6,center=(low+high)/2,amp=Math.max(0,(high-low)/2);
  const travel=center+amp*Math.sin(t),bank=Math.cos(t);
  state.flight={x:travel,min:low,max:high,direction:bank>=0?'right':'left'};
  const light=.40+.25*Math.sin(t*.5),hover=.105*Math.sin(t*3)+.025*Math.sin(t*2);
  if(scene.draw(7.2,{still,travelX:travel,lightMix:light,hover,motionTime:state.elapsed/1000,bank})){root.dataset.rendered='true';state.mode='webgl';if(!still)state.frames++}
  state.drawMs.push(performance.now()-start);if(state.drawMs.length>120)state.drawMs.shift();
 }
 function stop(){audio.stop();state.sound=false;state.running=false;cancelAnimationFrame(raf);raf=0;last=0;controls()}
 function frame(now){if(!state.running)return;if(document.hidden||!state.visible||state.paused||reduce.matches){stop();return}if(last&&now-last<1000/60){raf=requestAnimationFrame(frame);return}if(last){const dt=Math.min(100,now-last);state.phase=(state.phase+dt/24000)%1;state.elapsed+=dt;state.frameMs+=now-last}last=now;draw();root.dataset.phase=state.phase.toFixed(3);raf=requestAnimationFrame(frame)}
 function start(){if(!scene||!state.visible||state.paused||document.hidden||reduce.matches){controls();return}if(state.running)return;state.running=true;last=0;controls();raf=requestAnimationFrame(frame)}
 function create(){try{scene=createScene(canvas,{hostGround:root.dataset.ground!=='room',...(themes[root.dataset.eslabonLight||root.dataset.theme]||themes.titanium),onLoss(){const lost=scene;scene=null;lost?.dispose();stop();state.mode='fallback';root.dataset.mode='fallback';root.dataset.rendered='false';controls()}});if(scene){root.dataset.mode='webgl';draw(true)}else{state.mode='fallback';root.dataset.mode='fallback';root.dataset.rendered='false'}}catch{scene=null;state.mode='fallback';root.dataset.mode='fallback';root.dataset.rendered='false'}controls()}
 if(sound)sound.addEventListener('click',async()=>{if(state.sound){audio.stop();state.sound=false;controls();return;}if(!state.visible||document.hidden)return;state.sound=true;controls();const ok=await audio.play(()=>{state.sound=false;controls()});if(!ok){state.sound=false;controls()}});
 create();pause.addEventListener('click',()=>{state.paused=!state.paused;if(state.paused)stop();else start();controls()});
 const observer=new IntersectionObserver(entries=>{state.visible=entries[0].isIntersecting;if(state.visible)start();else stop()},{threshold:.15});observer.observe(root);
 const resize=new ResizeObserver(()=>{if(!state.running)draw(true)});resize.observe(root);
 const onVisibility=()=>document.hidden?stop():start();document.addEventListener('visibilitychange',onVisibility);
 const onReduce=()=>{stop();if(reduce.matches)draw(true);else start();controls()};reduce.addEventListener('change',onReduce);
 const themeObserver=new MutationObserver(()=>{stop();scene?.dispose();scene=null;create();start()});themeObserver.observe(root,{attributes:true,attributeFilter:['data-eslabon-light','data-theme']});
 root.eslabon={start,stop,stats:()=>({...state,drawMs:[...state.drawMs],fps:state.frameMs?state.frames*1000/state.frameMs:null}),loseContext:()=>scene?.loseForTest(),dispose(){stop();clearSurface();observer.disconnect();resize.disconnect();themeObserver.disconnect();document.removeEventListener('visibilitychange',onVisibility);reduce.removeEventListener('change',onReduce);scene?.dispose();audio.close();delete root.eslabon}};
 return root.eslabon;
}
for(const root of document.querySelectorAll('[data-eslabon-signature]'))mountSignature(root);
