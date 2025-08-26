const steps = Array.from(document.querySelectorAll('.step'));
const tabs = Array.from(document.querySelectorAll('.pill'));
const panels = Array.from(document.querySelectorAll('.panel'));
const meter = document.getElementById('meter');
const back = document.getElementById('back');
const next = document.getElementById('next');
const skip = document.getElementById('skip');

let index = 0;

function setCurrent(i, userAction = false) {
  index = Math.max(0, Math.min(i, steps.length - 1));
  steps.forEach((s, idx) => s.classList.toggle('current', idx === index));
  tabs.forEach((t, idx) => {
    const selected = idx === index;
    t.setAttribute('aria-selected', selected ? 'true' : 'false');
  });
  panels.forEach((p, idx) => {
    const show = idx === index;
    p.classList.toggle('current', show);
    p.hidden = !show;
  });
  const progress = (index) / (steps.length - 1);
  meter.style.width = `${progress * 100}%`;
  back.disabled = index === 0;
  next.textContent = index === steps.length - 1 ? 'Finish' : 'Next';
  if (userAction) tabs[index].focus();
}

tabs.forEach((t, i) => {
  t.addEventListener('click', () => setCurrent(i, true));
  t.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setCurrent(Math.min(i + 1, steps.length - 1), true); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setCurrent(Math.max(i - 1, 0), true); }
    if (e.key === 'Home') { e.preventDefault(); setCurrent(0, true); }
    if (e.key === 'End') { e.preventDefault(); setCurrent(steps.length - 1, true); }
  });
});

back.addEventListener('click', () => setCurrent(index - 1, true));
next.addEventListener('click', () => setCurrent(index + 1, true));
skip.addEventListener('click', () => setCurrent(steps.length - 1, true));

setCurrent(0);
