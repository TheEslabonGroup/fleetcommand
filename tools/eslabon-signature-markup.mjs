export const themes=['titanium','amber','rose','forest','crimson','spectrum'];
export function signatureMarkup(theme='titanium',base='/signature/v1'){
 if(theme==='zarape')theme='amber';
 if(!themes.includes(theme)||!/^\/[a-zA-Z0-9/_-]+$/.test(base))throw Error('Unknown signature theme or unsafe asset path');
 return `<section class="esig" data-eslabon-signature data-ground="host" data-eslabon-light="${theme}" aria-label="Designed by Eslabon Group">
 <div class="esig-credit"><a href="https://eslabongroup.com" target="_blank" rel="noopener" aria-label="Designed by Eslabon Group"><span class="esig-by">Designed by</span><span class="esig-brand-mark"><img class="esig-wordmark" src="${base}/lockup.svg" alt="Eslabon Group" width="180" height="64"><span class="esig-metal-surface" aria-hidden="true"></span></span></a></div>
 <div class="esig-stage" aria-hidden="true"><img class="esig-poster" src="${base}/mark.svg" alt="" width="940" height="360"><canvas class="esig-canvas"></canvas></div>
 <div class="esig-actions"><button type="button" class="esig-control esig-sound" aria-label="Play signature sound" aria-pressed="false" title="Play sound" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4ZM17 8a6 6 0 0 1 0 8"/></svg></button><button type="button" class="esig-control esig-pause" aria-label="Pause signature animation" title="Pause motion" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg></button></div>
 </section>`;
}
