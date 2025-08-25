const accordion = document.querySelector('.accordion');
const items = Array.from(document.querySelectorAll('.item'));
const triggers = Array.from(document.querySelectorAll('.trigger'));

const allowMultiple = false; // set true to allow multiple open

function closeItem(item) {
  const btn = item.querySelector('.trigger');
  const panel = item.querySelector('.panel');
  btn.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
}

function openItem(item) {
  const btn = item.querySelector('.trigger');
  const panel = item.querySelector('.panel');
  btn.setAttribute('aria-expanded', 'true');
  panel.hidden = false;
}

function toggleItem(item) {
  const expanded = item.querySelector('.trigger').getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeItem(item);
  } else {
    if (!allowMultiple) items.forEach(i => i !== item && closeItem(i));
    openItem(item);
  }
}

triggers.forEach(btn => {
  btn.addEventListener('click', () => toggleItem(btn.closest('.item')));
  btn.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleItem(btn.closest('.item'));
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const idx = triggers.indexOf(btn);
      const next = triggers[(idx + 1) % triggers.length];
      next.focus();
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const idx = triggers.indexOf(btn);
      const prev = triggers[(idx - 1 + triggers.length) % triggers.length];
      prev.focus();
    }
    if (e.key === 'Home') {
      e.preventDefault();
      triggers[0].focus();
    }
    if (e.key === 'End') {
      e.preventDefault();
      triggers[triggers.length - 1].focus();
    }
  });
});

// Optionally open the first item on load
// openItem(items[0]);
