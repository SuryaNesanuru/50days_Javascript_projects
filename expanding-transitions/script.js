const grid = document.getElementById('grid');
const cards = Array.from(document.querySelectorAll('.card'));

let current = cards;

function activate(card) {
  cards.forEach(c => c.classList.toggle('current', c === card));
  current = card;
}

function onActivate(card) {
  if (document.startViewTransition) {
    document.startViewTransition(() => activate(card));
  } else {
    activate(card);
  }
}

cards.forEach(card => {
  card.addEventListener('click', () => onActivate(card));
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(card); }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const i = (cards.indexOf(card) + 1) % cards.length;
      cards[i].focus();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const i = (cards.indexOf(card) - 1 + cards.length) % cards.length;
      cards[i].focus();
    }
    if (e.key === 'Home') { e.preventDefault(); cards.focus(); }
    if (e.key === 'End') { e.preventDefault(); cards[cards.length - 1].focus(); }
  });
});

// Ensure correct layout transform on resize
addEventListener('resize', () => {
  // forcing reflow to ensure track size is recalculated for transitions
  document.body.offsetHeight; // no-op reflow
});

// Initialize
activate(current);
