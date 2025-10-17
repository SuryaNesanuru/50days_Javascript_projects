const primary = document.getElementById('primary');
const ghost = document.getElementById('ghost');
const root = document.documentElement;
primary.addEventListener('click', () => { primary.textContent = 'Clicked'; root.style.setProperty('--accent', '#10b981'); root.style.transition = '0.25s'; });
ghost.addEventListener('click', () => { ghost.textContent = 'Ghost'; root.style.setProperty('--accent', '#64748b'); root.style.transition = '0.25s'; });
document.addEventListener('keydown', e => { if (e.key === 't') { document.body.classList.toggle('alt-theme'); } });