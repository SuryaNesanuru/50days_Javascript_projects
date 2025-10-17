const buttons = document.querySelectorAll('.card button');
const key = 'pricing-selected';
function loadSel(){return localStorage.getItem(key)}
function saveSel(v){localStorage.setItem(key,v)}
function clearAll(){buttons.forEach(x=>{x.disabled=false;x.textContent='Choose'})}
buttons.forEach((b,i)=>{b.addEventListener('click',()=>{clearAll();b.disabled=true;b.textContent='Selected';saveSel(String(i))})});
const sel = loadSel();if(sel!==null && buttons[+sel]){clearAll();buttons[+sel].disabled=true;buttons[+sel].textContent='Selected'}
document.addEventListener('keydown', e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const idx = buttons.findIndex(b => b.disabled); let next = idx; if (idx === -1) next = 0; else if (e.key === 'ArrowRight') next = Math.min(buttons.length-1, idx+1); else next = Math.max(0, idx-1); buttons[next].click(); } });