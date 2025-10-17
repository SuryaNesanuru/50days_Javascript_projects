const pads = document.querySelectorAll('.pad');
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const map = { A: 100, S: 150, D: 200, F: 250 };
function play(note, el) {
	const o = ctx.createOscillator();
	const g = ctx.createGain();
	o.type = 'sine';
	o.frequency.value = map[note] || 120;
	o.connect(g);
	g.connect(ctx.destination);
	g.gain.value = 0.001;
	o.start();
	g.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.01);
	g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
	setTimeout(() => o.stop(), 400);
	if (el) { el.classList.add('active'); setTimeout(() => el.classList.remove('active'), 150); }
}
pads.forEach(p => p.addEventListener('click', () => { play(p.dataset.key, p); }));
document.addEventListener('keydown', e => { const p = Array.from(pads).find(x => x.dataset.key.toLowerCase() === e.key.toLowerCase()); if (p) play(p.dataset.key, p); });