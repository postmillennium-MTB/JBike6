(function(root){
  'use strict';
  const ITEMS=[
    ['Geometry','geomVizTitle'],['Stability','rootVizTitle'],['Ride test','btnNudgeBike'],
    ['Control theory','controlTheorySection'],['Eigenmodes','eigenMathTitle'],
    ['Pole-zero','poleZeroCanvas'],['Stability landscape','stabilityLandscapeCanvas'],
    ['Optimization','optimizationTitle']
  ];
  function init(){
    const nav=document.getElementById('vizWorkspaceNav');if(!nav)return;
    const targets=ITEMS.map(([label,id])=>({label,target:document.getElementById(id)})).filter(item=>item.target);
    nav.innerHTML=targets.map((item,index)=>'<button type="button" data-workspace-index="'+index+'">'+item.label+'</button>').join('');
    const buttons=Array.from(nav.querySelectorAll('button'));
    buttons.forEach((button,index)=>button.addEventListener('click',()=>{
      const target=targets[index].target;
      target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
      buttons.forEach((b,i)=>{if(i===index)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');});
    }));
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(!visible)return;
        const index=targets.findIndex(item=>item.target===visible.target);
        if(index>=0)buttons.forEach((button,i)=>{if(i===index)button.setAttribute('aria-current','location');else button.removeAttribute('aria-current');});
      },{rootMargin:'-18% 0px -68% 0px',threshold:[0,.15,.35,.6]});
      targets.forEach(item=>observer.observe(item.target.closest('section')||item.target));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  if(root)root.JBike6VizWorkspace={init:init,items:ITEMS.slice()};
})(typeof globalThis!=='undefined'?globalThis:this);
