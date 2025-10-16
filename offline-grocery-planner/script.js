// Simple localStorage-backed list (offline-ready). For a full PWA use IndexedDB + service worker.
const form = document.getElementById('item-form');
const listEl = document.getElementById('list');
const storageKey = 'grocery-list-v1';

function load(){
  try{ return JSON.parse(localStorage.getItem(storageKey)||'[]') }catch(e){return []}
}
function save(items){ localStorage.setItem(storageKey, JSON.stringify(items)) }

function render(){
  const items = load();
  listEl.innerHTML = '';
  items.forEach((it, i)=>{
    const li = document.createElement('li');
    li.innerHTML = `<span>${it.name} × ${it.qty} <small>(${it.cat})</small></span><div><button data-i="${i}" class="bought">✓</button> <button data-i="${i}" class="del">✕</button></div>`;
    listEl.appendChild(li);
  })
}

form.addEventListener('submit', e=>{
  e.preventDefault();
  const name = document.getElementById('item-name').value.trim();
  const qty = +document.getElementById('item-qty').value || 1;
  const cat = document.getElementById('item-cat').value;
  if(!name) return;
  const items = load();
  items.push({name,qty,cat,bought:false,added:Date.now()});
  save(items); render(); form.reset();
})

listEl.addEventListener('click', e=>{
  const btn = e.target.closest('button'); if(!btn) return;
  const i = +btn.dataset.i; const items = load();
  if(btn.classList.contains('del')){ items.splice(i,1); save(items); render(); }
  if(btn.classList.contains('bought')){ items[i].bought = !items[i].bought; save(items); render(); }
})

render();
