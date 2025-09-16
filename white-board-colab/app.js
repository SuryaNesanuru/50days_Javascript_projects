/* Collaborative Whiteboard using Firebase Realtime Database (client-only)
   - Replace firebaseConfig with your Firebase project's config (apiKey, authDomain, databaseURL...)
   - Uses a simple "strokes" list: each push is { clientId, type, points[], color, size, timestamp }
   - Special message type: { type: 'clear' } clears canvas for all clients
*/

//////////////////////
// Firebase config: //
//////////////////////
// Replace these placeholder values with your Firebase project's config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d', { willReadFrequently: false });
const colorInput = document.getElementById('color');
const sizeInput = document.getElementById('size');
const clearBtn = document.getElementById('clearBtn');
const exportBtn = document.getElementById('exportBtn');
const statusEl = document.getElementById('status');

// Resize canvas to fill available space while keeping high DPI
function resizeCanvas(){
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * ratio);
  canvas.height = Math.floor(rect.height * ratio);
  ctx.scale(ratio, ratio);
  redrawLocal(); // re-draw if needed (we keep stroke history)
}
window.addEventListener('resize', () => {
  // temporarily save current drawn image
  resizeCanvas();
});
resizeCanvas();

/* Client id to avoid processing our own remote events */
const clientId = 'c_' + Math.random().toString(36).slice(2,9);

/* Local stroke buffering (used for redraw, optional) */
let localStrokes = []; // { color, size, points: [{x,y}, ...] }

/* Drawing state */
let drawing = false;
let currentStroke = null;

/* Utility: get mouse/touch pos relative to canvas (CSS pixels) */
function getPosFromEvent(e){
  const rect = canvas.getBoundingClientRect();
  if (e.touches && e.touches[0]) {
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  } else {
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}

/* Begin stroke */
function startStroke(e){
  e.preventDefault();
  drawing = true;
  const p = getPosFromEvent(e);
  currentStroke = {
    clientId,
    type: 'stroke',
    color: colorInput.value,
    size: parseInt(sizeInput.value, 10),
    points: [ { x: p.x, y: p.y } ],
    timestamp: Date.now()
  };
}

/* Continue stroke */
function moveStroke(e){
  if (!drawing || !currentStroke) return;
  const p = getPosFromEvent(e);
  const last = currentStroke.points[currentStroke.points.length - 1];
  // add point only if moved enough to reduce redundant events
  const dx = p.x - last.x, dy = p.y - last.y;
  if ((dx*dx + dy*dy) < 4) return;
  currentStroke.points.push({ x: p.x, y: p.y });
  // draw segment locally for immediate feedback
  drawStrokeSegment(currentStroke.color, currentStroke.size, last, p);
}

/* End stroke: push to Firebase and save locally */
function endStroke(e){
  if (!drawing || !currentStroke) return;
  drawing = false;
  // push stroke to firebase under /strokes
  const strokeRef = db.ref('strokes').push();
  strokeRef.set(currentStroke).catch(err => console.error('Firebase write error', err));
  // keep local copy for redraws
  localStrokes.push(currentStroke);
  currentStroke = null;
}

/* Draw a quick segment (immediate) */
function drawStrokeSegment(color, size, from, to){
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

/* Draw a full stroke (used when receiving remote or redraw) */
function drawFullStroke(stroke){
  if (!stroke.points || stroke.points.length === 0) return;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.beginPath();
  const p0 = stroke.points[0];
  ctx.moveTo(p0.x, p0.y);
  for (let i = 1; i < stroke.points.length; i++){
    const p = stroke.points[i];
    ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

/* Redraw all local strokes (for resize) */
function redrawLocal(){
  // optional: in a real app you'd re-fetch strokes from DB as canonical source.
  // Here we only re-render the localStrokes buffer for smoother UX on resize/refresh.
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // draw local strokes
  localStrokes.forEach(s => drawFullStroke(s));
}

/* Listen for pointer events */
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); startStroke(e); });
canvas.addEventListener('pointermove', (e) => moveStroke(e));
canvas.addEventListener('pointerup', (e) => { canvas.releasePointerCapture(e.pointerId); endStroke(e); });
canvas.addEventListener('pointercancel', (e) => { canvas.releasePointerCapture(e.pointerId); endStroke(e); });

/* also support touch-only older devices (optional) */
canvas.addEventListener('touchstart', (e)=> startStroke(e), { passive:false });
canvas.addEventListener('touchmove', (e)=> moveStroke(e), { passive:false });
canvas.addEventListener('touchend', (e)=> endStroke(e) );

/* Clear canvas locally and push a clear event to Firebase */
clearBtn.addEventListener('click', () => {
  const clearMsg = { clientId, type: 'clear', timestamp: Date.now() };
  db.ref('strokes').push(clearMsg).catch(err => console.error('Firebase write error', err));
  // We will handle clearing in the DB listener (to keep everyone in sync)
});

/* Export canvas as PNG */
exportBtn.addEventListener('click', () => {
  // Convert canvas to dataURL then download
  const dataURL = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = `whiteboard-${new Date().toISOString().slice(0,19)}.png`;
  a.click();
});

/* Firebase listeners: child_added to receive new strokes/commands in order */
const strokesRef = db.ref('strokes');

// Keep connection status
firebase.database().ref(".info/connected").on("value", snap => {
  if (snap.val() === true) {
    statusEl.textContent = 'Connected';
    statusEl.style.color = '#86efac';
  } else {
    statusEl.textContent = 'Disconnected';
    statusEl.style.color = '#fda4af';
  }
});

// Load last N strokes on start (so new clients see recent drawing). We'll query last 1000 items.
strokesRef.limitToLast(1000).once('value', snap => {
  const items = snap.val();
  if (!items) return;
  // sort by push order (Firebase returns keyed object)
  const ordered = Object.keys(items).map(k => items[k]).sort((a,b)=> (a.timestamp||0)-(b.timestamp||0));
  ordered.forEach(msg => {
    // handle each message
    if (msg.type === 'clear') {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      localStrokes = [];
    } else if (msg.type === 'stroke') {
      // if it is our own stroke (clientId), skip re-drawing? no: we may already have drawn segments locally.
      // But to avoid duplicate draws we check clientId; if it's from this client we have already drawn (and stored) it.
      if (msg.clientId === clientId) {
        // ensure it's in localStrokes (might be present) — simple approach: push if not identical by timestamp
        if (!localStrokes.some(s => s.timestamp === msg.timestamp && s.clientId === msg.clientId)) {
          localStrokes.push(msg);
        }
      } else {
        drawFullStroke(msg);
      }
    }
  });
});

// Now listen for new strokes in real time
strokesRef.limitToLast(1).on('child_added', snapshot => {
  const msg = snapshot.val();
  if (!msg) return;
  // ignore the initial bulk loaded items (they were handled above) by checking timestamp recency is optional.
  // But here we safely handle all: if msg.clientId === our id and we already stored it, skip drawing it again.
  if (msg.type === 'clear') {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    localStrokes = [];
    return;
  }
  if (msg.type === 'stroke') {
    if (msg.clientId === clientId) {
      // ensure not duplicated in local buffer
      if (!localStrokes.some(s => s.timestamp === msg.timestamp && s.clientId === clientId)) {
        localStrokes.push(msg);
      }
      return; // we already drew locally as user was drawing
    } else {
      // remote stroke: draw it
      drawFullStroke(msg);
    }
  }
});

/* OPTIONAL: Periodic trim of old strokes to keep DB small
   (In production you should implement server-side cleanup or use TTL)
*/
setInterval(() => {
  // this example does not delete anything automatically to keep things simple.
  // You may implement logic to remove very old strokes from /strokes if needed.
}, 60*60*1000);

//////////////////////
// Notes & Tips:
//////////////////////
// - For production: secure your Realtime Database rules to allow only authenticated users or proper validation.
// - For performance: instead of pushing entire stroke points for very long strokes, chunk them or sample points.
// - To improve rendering: consider batching points and smoothing (catmull-rom / bezier).
// - To support undo: track stroke keys (push().key) and allow clients to remove last own stroke; you'd need better UX and access control.
