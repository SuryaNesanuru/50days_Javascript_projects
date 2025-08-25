const track = document.getElementById('track');
const slides = Array.from(track.children);
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const dots = Array.from(document.querySelectorAll('.dot'));
const viewport = document.getElementById('carousel-viewport');
const progressBar = document.getElementById('progress');

let index = 0;
let autoplay = true;
let interval = 4500;
let timer = null;
let progressTimer = null;
let startX = 0;
let deltaX = 0;

function update() {
  const offset = -index * viewport.clientWidth;
  track.style.transform = `translate3d(${offset}px,0,0)`;
  slides.forEach((s, i) => s.classList.toggle('current', i === index));
  dots.forEach((d, i) => {
    d.classList.toggle('active', i === index);
    d.setAttribute('aria-selected', i === index ? 'true' : 'false');
  });
}

function goTo(i) {
  index = (i + slides.length) % slides.length;
  update();
  restartAutoplay();
}

function next() { goTo(index + 1); }
function prev() { goTo(index - 1); }

function startAutoplay() {
  clearInterval(timer);
  clearTimeout(progressTimer);
  progressBar.style.transition = 'none';
  progressBar.style.width = '0%';
  // allow layout
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      progressBar.style.transition = `width ${interval}ms linear`;
      progressBar.style.width = '100%';
    });
  });
  timer = setInterval(next, interval);
}

function stopAutoplay() {
  clearInterval(timer);
  progressBar.style.transition = 'width 200ms ease';
  progressBar.style.width = '0%';
}

function restartAutoplay() {
  if (!autoplay) return;
  startAutoplay();
}

function onResize() {
  update();
}

prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

dots.forEach(d => {
  d.addEventListener('click', () => goTo(parseInt(d.dataset.go, 10)));
  d.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });
});

viewport.addEventListener('pointerdown', e => {
  viewport.setPointerCapture(e.pointerId);
  startX = e.clientX;
  deltaX = 0;
  track.style.transition = 'none';
  stopAutoplay();
});
viewport.addEventListener('pointermove', e => {
  if (startX === 0) return;
  deltaX = e.clientX - startX;
  const offset = -index * viewport.clientWidth + deltaX;
  track.style.transform = `translate3d(${offset}px,0,0)`;
});
function endSwipe() {
  if (startX === 0) return;
  track.style.transition = '';
  const threshold = viewport.clientWidth * 0.18;
  if (deltaX > threshold) prev();
  else if (deltaX < -threshold) next();
  else update();
  startX = 0;
  deltaX = 0;
  if (autoplay) startAutoplay();
}
viewport.addEventListener('pointerup', endSwipe);
viewport.addEventListener('pointercancel', endSwipe);
viewport.addEventListener('pointerleave', endSwipe);

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') prev();
  if (e.key === 'ArrowRight') next();
  if (e.key.toLowerCase() === ' ') e.preventDefault();
});

viewport.addEventListener('mouseenter', () => { autoplay = false; stopAutoplay(); });
viewport.addEventListener('mouseleave', () => { autoplay = true; startAutoplay(); });

window.addEventListener('resize', onResize);

update();
startAutoplay();
