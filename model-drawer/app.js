const overlay = document.getElementById('overlay');
const modal = document.getElementById('modal');
const drawer = document.getElementById('drawer');
const openModalBtn = document.getElementById('open-modal');
const openDrawerBtn = document.getElementById('open-drawer');
const content = document.getElementById('content');

let active = null;
let lastActiveTrigger = null;

const FOCUSABLE = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

function getFocusables(scope) {
  return Array.from(scope.querySelectorAll(FOCUSABLE))
    .filter(el => el.offsetParent !== null || el === document.activeElement);
}

function setBackgroundInert(state) {
  document.body.style.overflow = state ? 'hidden' : '';
  content.setAttribute('aria-hidden', state ? 'true' : 'false');
}

function openDialog(type, trigger) {
  lastActiveTrigger = trigger;
  active = type === 'modal' ? modal : drawer;
  overlay.hidden = false;
  active.hidden = false;
  requestAnimationFrame(() => {
    overlay.classList.add('show');
    active.classList.add('show');
    setBackgroundInert(true);
    const surface = active.querySelector(type === 'modal' ? '.dialog__surface' : '.drawer__surface');
    surface.setAttribute('tabindex', '-1');
    surface.focus();
    surface.addEventListener('keydown', onKeydown);
    overlay.addEventListener('click', onOverlay);
    document.addEventListener('keydown', onGlobalEsc);
    active.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeDialog));
    trapFocus(active, surface);
  });
}

function closeDialog() {
  if (!active) return;
  overlay.classList.remove('show');
  active.classList.remove('show');
  setBackgroundInert(false);
  const surface = active.querySelector('.dialog__surface, .drawer__surface');
  surface.removeEventListener('keydown', onKeydown);
  overlay.removeEventListener('click', onOverlay);
  document.removeEventListener('keydown', onGlobalEsc);
  active.querySelectorAll('[data-close]').forEach(b => b.removeEventListener('click', closeDialog));
  setTimeout(() => {
    overlay.hidden = true;
    active.hidden = true;
    if (lastActiveTrigger) lastActiveTrigger.focus();
    active = null;
  }, 220);
}

function onOverlay(e) {
  if (!active) return;
  closeDialog();
}

function onGlobalEsc(e) {
  if (e.key === 'Escape') closeDialog();
}

function onKeydown(e) {
  if (e.key === 'Tab') {
    const focusables = getFocusables(active);
    if (focusables.length === 0) { e.preventDefault(); return; }
    const first = focusables;
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

function trapFocus(scope, fallback) {
  scope.addEventListener('focusin', () => {
    if (!active) return;
    const inScope = scope.contains(document.activeElement);
    if (!inScope) (getFocusables(scope) || fallback).focus();
  });
}

document.querySelectorAll('[data-open]').forEach(btn => {
  btn.addEventListener('click', () => openDialog(btn.dataset.open, btn));
});
