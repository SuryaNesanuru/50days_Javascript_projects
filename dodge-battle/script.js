// Minimal single-player demo: move a player and dodge moving obstacles
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const w = canvas.width, h = canvas.height;
let px = w/2, py = h/2, speed = 3;
let keys = {};
let obstacles = [];
let frame = 0;

window.addEventListener('keydown', e=>keys[e.key]=true);
window.addEventListener('keyup', e=>keys[e.key]=false);

function spawn(){
  const size = 12 + Math.random()*20;
  const x = Math.random()>0.5? (Math.random()*w): (Math.random()*w);
  const y = -20;
  obstacles.push({x,y,vy:1+Math.random()*2,size})
}

function update(){
  if(keys['ArrowLeft']||keys['a']) px -= speed;
  if(keys['ArrowRight']||keys['d']) px += speed;
  if(keys['ArrowUp']||keys['w']) py -= speed;
  if(keys['ArrowDown']||keys['s']) py += speed;
  px = Math.max(0,Math.min(w,px)); py = Math.max(0,Math.min(h,py));

  obstacles.forEach(o=>o.y += o.vy);
  obstacles = obstacles.filter(o=>o.y < h+50);

  // collision
  for(const o of obstacles){
    const dx = o.x - px; const dy = o.y - py; const dist = Math.hypot(dx,dy);
    if(dist < o.size + 8){ // collision
      // reset
      px = w/2; py = h/2; obstacles = []; break;
    }
  }

  if(frame % 60 === 0) spawn();
  frame++;
}

function draw(){
  ctx.clearRect(0,0,w,h);
  // player
  ctx.fillStyle = '#0ff'; ctx.beginPath(); ctx.arc(px,py,8,0,Math.PI*2); ctx.fill();
  // obstacles
  ctx.fillStyle = '#f55';
  obstacles.forEach(o=>{ ctx.beginPath(); ctx.arc(o.x,o.y,o.size,0,Math.PI*2); ctx.fill() })
}

function loop(){ update(); draw(); requestAnimationFrame(loop) }

loop();
