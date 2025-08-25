const valueEl = document.getElementById('count');
const incBtn = document.getElementById('increment');
const decBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

let value = 0;

function render() { valueEl.textContent = value; }
function inc() { value += 1; render(); }
function dec() { value -= 1; render(); }
function reset() { value = 0; render(); }

incBtn.addEventListener('click', inc);
decBtn.addEventListener('click', dec);
resetBtn.addEventListener('click', reset);

window.addEventListener('keydown', e => {
  if (e.key === '+' || e.key === '=') inc();
  else if (e.key === '-') dec();
  else if ((e.key || '').toLowerCase() === 'r') reset();
});

render();
