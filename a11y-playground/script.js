// Modal with focus trap
const open = document.getElementById('open-modal');
const close = document.getElementById('close-modal');
const modal = document.getElementById('modal');
const focusToggle = document.getElementById('show-focus');
const firstFocusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let lastFocused = null;

open.addEventListener('click', ()=>{
  lastFocused = document.activeElement;
  modal.setAttribute('aria-hidden','false');
  const focusable = modal.querySelectorAll(firstFocusableSelector);
  if(focusable.length) focusable[0].focus();
})

close.addEventListener('click', ()=>{ modal.setAttribute('aria-hidden','true'); lastFocused?.focus(); })

document.addEventListener('keydown', e=>{
  if(e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false'){
    modal.setAttribute('aria-hidden','true'); lastFocused?.focus();
  }
  if(e.key === 'Tab' && modal.getAttribute('aria-hidden') === 'false'){
    const focusable = Array.from(modal.querySelectorAll(firstFocusableSelector));
    if(focusable.length===0) return;
    const idx = focusable.indexOf(document.activeElement);
    if(e.shiftKey && idx===0){ e.preventDefault(); focusable[focusable.length-1].focus() }
    else if(!e.shiftKey && idx===focusable.length-1){ e.preventDefault(); focusable[0].focus() }
  }
})

// Tabs keyboard controlling
const tab1 = document.getElementById('tab1');
const tab2 = document.getElementById('tab2');
const panel1 = document.getElementById('panel1');
const panel2 = document.getElementById('panel2');

function selectTab(tab){
  tab1.setAttribute('aria-selected', 'false');
  tab2.setAttribute('aria-selected', 'false');
  tab.setAttribute('aria-selected','true');
  if(tab===tab1){ panel1.hidden = false; panel2.hidden = true } else { panel1.hidden = true; panel2.hidden = false }
}

tab1.addEventListener('click', ()=>selectTab(tab1));
tab2.addEventListener('click', ()=>selectTab(tab2));

focusToggle.addEventListener('change', (e)=>{
  document.body.classList.toggle('focus-outline', e.target.checked);
});
