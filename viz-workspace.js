(function(root){
  'use strict';
  // One navigation item per major destination. Related tools (eigenmodes and pole-zero)
  // live together inside Control Lab rather than consuming separate top-level slots.
  const ITEMS=[
    ['Geometry','geomVizTitle','overview'],
    ['Stability','rootVizTitle','overview'],
    ['Ride test','btnNudgeBike','overview'],
    ['Wheel lab','wheelQuickPills','mullet'],
    ['Control lab','controlTheorySection','control'],
    ['Stability landscape','stabilityLandscapeCanvas','landscape'],
    ['Design optimization','optimizationTitle','optimization']
  ];
  function init(){
    const nav=document.getElementById('vizWorkspaceNav');if(!nav)return;
    const syncHeader=()=>{
      const header=document.querySelector('.app-header');
      if(header)document.documentElement.style.setProperty('--app-header-height',header.getBoundingClientRect().height+'px');
    };
    syncHeader();
    window.addEventListener('resize',syncHeader,{passive:true});
    const targets=ITEMS.map(([label,id,tab])=>({label,target:document.getElementById(id),tab})).filter(item=>item.target);
    nav.innerHTML=targets.map((item,index)=>'<button type="button" data-workspace-index="'+index+'" aria-label="'+item.label+'">'+item.label+'</button>').join('');
    const buttons=Array.from(nav.querySelectorAll('button'));
    const setActive=index=>buttons.forEach((button,i)=>{
      if(i===index)button.setAttribute('aria-current','location');
      else button.removeAttribute('aria-current');
    });
    buttons.forEach((button,index)=>button.addEventListener('click',()=>{
      const target=targets[index].target;
      const activeTab=document.querySelector('.lab-tab-btn.active')?.dataset.tab;
      if(targets[index].tab&&targets[index].tab!==activeTab){
        const tabButton=document.querySelector('.lab-tab-btn[data-tab="'+targets[index].tab+'"]');
        if(tabButton)tabButton.click();
      }
      syncHeader();
      window.setTimeout(()=>{
        target.scrollIntoView({
          behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',
          block:'start'
        });
      },40);
      setActive(index);
    }));
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        const visible=entries.filter(entry=>entry.isIntersecting)
          .sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
        if(!visible)return;
        const index=targets.findIndex(item=>item.target===visible.target);
        if(index>=0)setActive(index);
      },{rootMargin:'-20% 0px -66% 0px',threshold:[0,.15,.35,.6]});
      targets.forEach(item=>observer.observe(item.target));
    }
  }
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
    else init();
  }
  const api={init:init,items:ITEMS.map(item=>item.slice())};
  if(root)root.JBike6VizWorkspace=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
