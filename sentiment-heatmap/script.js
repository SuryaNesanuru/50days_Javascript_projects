// Simple simulated stream + rule-based sentiment -> heatmap color
const start = document.getElementById('start');
const stop = document.getElementById('stop');
const heatmap = document.getElementById('heatmap');
const size = 16*8; // grid cells
let cells = [];
let timer = null;

function makeGrid(){
  heatmap.innerHTML = '';
  cells = [];
  for(let i=0;i<size;i++){
    const d = document.createElement('div'); d.className='cell'; d.style.background='#eee'; heatmap.appendChild(d); cells.push(d);
  }
}

const positive = ['good','great','love','happy','nice','awesome'];
const negative = ['bad','hate','sad','angry','terrible','awful'];

function sentimentOf(text){
  text = text.toLowerCase();
  let score = 0;
  positive.forEach(w=>{ if(text.includes(w)) score += 1 });
  negative.forEach(w=>{ if(text.includes(w)) score -= 1 });
  return Math.max(-3, Math.min(3, score));
}

function colorFromScore(s){
  const map = {
    '-3':'#7a0b0b',
    '-2':'#c21a1a',
    '-1':'#f29a9a',
    '0':'#eee',
    '1':'#b7e1a1',
    '2':'#57c957',
    '3':'#177a17'
  }
  return map[String(s)]||'#ddd';
}

function pushRandom(){
  // generate sample text
  const templates = ['I love this','This is terrible','Such a great day','I feel bad about this','Awesome work!','I hate waiting'];
  return templates[Math.floor(Math.random()*templates.length)];
}

function step(){
  const t = pushRandom();
  const s = sentimentOf(t);
  // shift grid left and set last cell
  cells.forEach((c,i)=>{ c.style.opacity = Math.max(0.2, parseFloat(getComputedStyle(c).opacity||1)-0.02) });
  const idx = Math.floor(Math.random()*cells.length);
  cells[idx].style.background = colorFromScore(s);
  cells[idx].style.opacity = 1;
}

start.addEventListener('click', ()=>{ if(timer) return; timer = setInterval(step, 250); })
stop.addEventListener('click', ()=>{ clearInterval(timer); timer=null })

makeGrid();
