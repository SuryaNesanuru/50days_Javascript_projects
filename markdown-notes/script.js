const notesEl = document.getElementById('notes');
const newBtn = document.getElementById('new');
const md = document.getElementById('md');
const title = document.getElementById('title');
const preview = document.getElementById('preview');
const key = 'md-notes-v1';

function load() {
	try {
		return JSON.parse(localStorage.getItem(key) || '[]');
	} catch (e) {
		return [];
	}
}

function save(s) {
	localStorage.setItem(key, JSON.stringify(s));
}

function renderList() {
	notesEl.innerHTML = '';
	const items = load();
	items.forEach((n, i) => {
		const li = document.createElement('li');
		li.textContent = n.title || 'Untitled';
		li.dataset.i = i;
		li.addEventListener('click', () => { select(i); });
		li.addEventListener('dblclick', () => {
			if (confirm('Delete this note?')) {
				const s = load();
				s.splice(i, 1);
				save(s);
				renderList();
				if (s.length) select(0); else add();
			}
		});
		notesEl.appendChild(li);
	});
}

function select(i) {
	const items = load();
	const n = items[i] || { title: '', content: '' };
	title.value = n.title || '';
	md.value = n.content || '';
	updatePreview();
	current = i;
}

function updatePreview() {
	const text = md.value || '';
	const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/\n/g, '<br>');
	preview.innerHTML = html;
}

function add() {
	const items = load();
	items.unshift({ title: 'New Note', content: '' });
	save(items);
	renderList();
	select(0);
}

function persist() {
	const items = load();
	items[current] = { title: title.value, content: md.value };
	save(items);
	renderList();
}

function debounce(fn, wait) {
	let t;
	return function (...a) {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, a), wait);
	};
}

let current = 0;
newBtn.addEventListener('click', add);
md.addEventListener('input', debounce(() => { updatePreview(); persist(); }, 700));
title.addEventListener('input', debounce(persist, 700));

document.addEventListener('keydown', e => {
	if (e.ctrlKey && e.key.toLowerCase() === 'n') { e.preventDefault(); add(); }
	if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); persist(); }
	if (e.ctrlKey && e.key.toLowerCase() === 'e') { e.preventDefault(); const data = JSON.stringify(load()); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'notes.json'; a.click(); URL.revokeObjectURL(url); }
	if (e.ctrlKey && e.key.toLowerCase() === 'i') { e.preventDefault(); const txt = prompt('Paste notes JSON'); try { const parsed = JSON.parse(txt||'[]'); save(parsed); renderList(); select(0); } catch (err) { alert('Invalid JSON'); } }
});

renderList();
if (load().length) select(0); else add();