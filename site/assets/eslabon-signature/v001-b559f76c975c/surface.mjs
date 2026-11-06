// Only host colors enter this component. No form or account data is read.
export function surfaceFromColors(backgrounds,ink=[0,0,0,255]){
 const solid=backgrounds.find(c=>c[3]>240),color=solid||ink;
 const luma=(color[0]*.2126+color[1]*.7152+color[2]*.0722)/255;
 return solid?(luma>.45?'light':'dark'):(luma>.5?'dark':'light');
}
export function watchSurface(root){
 if(root.dataset.surface)return()=>{};
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1;
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 if(!ctx){root.dataset.surface='dark';return()=>{};}
 const sample=value=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=value;ctx.fillRect(0,0,1,1);return [...ctx.getImageData(0,0,1,1).data];};
 function update(){const colors=[];for(let node=root;node;node=node.parentElement)colors.push(sample(getComputedStyle(node).backgroundColor));root.dataset.surface=surfaceFromColors(colors,sample(getComputedStyle(root).color));}
 const observer=new MutationObserver(update);for(let node=root.parentElement;node;node=node.parentElement)observer.observe(node,{attributes:true,attributeFilter:['class','style','data-theme','data-color-scheme']});const scheme=matchMedia('(prefers-color-scheme: dark)');scheme.addEventListener('change',update);update();return()=>{observer.disconnect();scheme.removeEventListener('change',update);};
}
