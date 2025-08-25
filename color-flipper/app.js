// Color Flipper App
// Pure JS, no frameworks

// --- Preset palettes ---
const presetPalettes = [
  { name: 'Red', hex: '#E53935' },
  { name: 'Pink', hex: '#D81B60' },
  { name: 'Purple', hex: '#8E24AA' },
  { name: 'Indigo', hex: '#3949AB' },
  { name: 'Blue', hex: '#1E88E5' },
  { name: 'Teal', hex: '#00897B' },
  { name: 'Green', hex: '#43A047' },
  { name: 'Lime', hex: '#C0CA33' },
  { name: 'Amber', hex: '#FFB300' },
  { name: 'Orange', hex: '#FB8C00' },
  { name: 'Brown', hex: '#6D4C41' },
  { name: 'Grey', hex: '#757575' },
  { name: 'Blue Grey', hex: '#546E7A' },
  { name: 'Cyan', hex: '#00BCD4' },
  { name: 'Deep Purple', hex: '#5E35B1' },
  { name: 'Deep Orange', hex: '#F4511E' }
];

// --- State ---
const state = {
  mode: 'random', // 'random' | 'presets'
  currentHex: randomHex(),
  favorites: loadFavorites(),
  presetIndex: 0
};

// --- Pure functions ---
function randomHex() {
  // Returns a random hex color string
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
}
function hexToRgb(hex) {
  // Converts hex to {r,g,b}
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(x => x + x).join('');
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}
function luminance(hex) {
  // Relative luminance for WCAG
  const { r, g, b } = hexToRgb(hex);
  const srgb = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
}
function getContrastRatio(bgHex, textHex) {
  // Returns contrast ratio to 2 decimals
  const l1 = luminance(bgHex);
  const l2 = luminance(textHex);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return Math.round(ratio * 100) / 100;
}
function loadFavorites() {
  // Load favorites from localStorage
  try {
    return JSON.parse(localStorage.getItem('color-flipper:favorites')) || [];
  } catch {
    return [];
  }
}
function saveFavorites(favs) {
  localStorage.setItem('color-flipper:favorites', JSON.stringify(favs));
}

// --- DOM refs ---
const tabRandom = document.getElementById('tab-random');
const tabPresets = document.getElementById('tab-presets');
const colorCard = document.getElementById('color-card');
const presetsPanel = document.getElementById('presets-panel');
const preview = document.getElementById('preview');
const hexCode = document.getElementById('hex-code');
const copyBtn = document.getElementById('copy-btn');
const flipBtn = document.getElementById('flip-btn');
const favBtn = document.getElementById('fav-btn');
const presetsGrid = document.getElementById('presets-grid');
const favoritesRow = document.getElementById('favorites-row');
const contrastWhite = document.getElementById('contrast-white');
const contrastBlack = document.getElementById('contrast-black');

// --- Render ---
let renderQueued = false;
function render() {
  // Batch DOM updates for snappy UI
  if (renderQueued) return;
  renderQueued = true;
  window.requestAnimationFrame(() => {
    // Tabs
    tabRandom.setAttribute('aria-selected', state.mode === 'random');
    tabRandom.setAttribute('aria-pressed', state.mode === 'random');
    tabRandom.tabIndex = state.mode === 'random' ? 0 : -1;
    tabPresets.setAttribute('aria-selected', state.mode === 'presets');
    tabPresets.setAttribute('aria-pressed', state.mode === 'presets');
    tabPresets.tabIndex = state.mode === 'presets' ? 0 : -1;
    colorCard.hidden = state.mode !== 'random';
    presetsPanel.hidden = state.mode !== 'presets';
    // Preview
    preview.style.background = state.currentHex;
    hexCode.textContent = state.currentHex;
    // Contrast
    const ratioWhite = getContrastRatio(state.currentHex, '#FFFFFF');
    const ratioBlack = getContrastRatio(state.currentHex, '#000000');
    contrastWhite.textContent = `White: ${ratioWhite} (${ratioWhite >= 4.5 ? 'Pass' : 'Fail'})`;
    contrastBlack.textContent = `Black: ${ratioBlack} (${ratioBlack >= 4.5 ? 'Pass' : 'Fail'})`;
    // Favorites
    favBtn.setAttribute('aria-pressed', state.favorites.includes(state.currentHex));
    // Presets grid
    if (state.mode === 'presets') {
      presetsGrid.innerHTML = '';
      presetPalettes.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.className = 'preset-color';
        btn.style.background = p.hex;
        btn.textContent = p.name;
        btn.setAttribute('aria-label', `${p.name} ${p.hex}`);
        btn.setAttribute('aria-selected', state.presetIndex === i);
        btn.tabIndex = state.presetIndex === i ? 0 : -1;
        btn.addEventListener('click', () => {
          state.presetIndex = i;
          state.currentHex = p.hex;
          render();
        });
        btn.addEventListener('keydown', e => {
          if (e.key === 'ArrowRight') {
            let ni = (i + 1) % presetPalettes.length;
            state.presetIndex = ni;
            state.currentHex = presetPalettes[ni].hex;
            render();
            presetsGrid.children[ni].focus();
          } else if (e.key === 'ArrowLeft') {
            let ni = (i - 1 + presetPalettes.length) % presetPalettes.length;
            state.presetIndex = ni;
            state.currentHex = presetPalettes[ni].hex;
            render();
            presetsGrid.children[ni].focus();
          } else if (e.key === 'Enter' || e.key === ' ') {
            state.presetIndex = i;
            state.currentHex = p.hex;
            render();
          }
        });
        presetsGrid.appendChild(btn);
      });
    }
    // Favorites row
    favoritesRow.innerHTML = '';
    state.favorites.forEach(hex => {
      const fav = document.createElement('button');
      fav.className = 'favorite-color';
      fav.style.background = hex;
      fav.setAttribute('aria-label', hex);
      fav.tabIndex = 0;
      fav.textContent = '';
      fav.addEventListener('click', () => {
        state.currentHex = hex;
        render();
      });
      favoritesRow.appendChild(fav);
    });
    renderQueued = false;
  });
}

// --- Event handlers ---
tabRandom.addEventListener('click', () => {
  state.mode = 'random';
  render();
});
tabPresets.addEventListener('click', () => {
  state.mode = 'presets';
  state.currentHex = presetPalettes[state.presetIndex].hex;
  render();
});
flipBtn.addEventListener('click', () => {
  if (state.mode === 'random') {
    state.currentHex = randomHex();
  } else {
    state.presetIndex = (state.presetIndex + 1) % presetPalettes.length;
    state.currentHex = presetPalettes[state.presetIndex].hex;
  }
  render();
});
favBtn.addEventListener('click', () => {
  if (!state.favorites.includes(state.currentHex)) {
    state.favorites.push(state.currentHex);
    saveFavorites(state.favorites);
    render();
  }
});
hexCode.addEventListener('click', copyHex);
copyBtn.addEventListener('click', copyHex);
function copyHex() {
  // Copy hex code to clipboard
  const hex = state.currentHex;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(hex).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 1000);
    });
  } else {
    // Fallback
    const input = document.createElement('input');
    input.value = hex;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 1000);
  }
}

// --- Accessibility: focus-visible polyfill for old browsers ---
document.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});
document.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing');
});

// --- Initial render ---
render();

// --- Export for testing ---
window.randomHex = randomHex;
window.getContrastRatio = getContrastRatio;
window.presetPalettes = presetPalettes;
