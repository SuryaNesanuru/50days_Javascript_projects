const cols = document.querySelectorAll('.col');
const storage = 'kanban-v1';

function load() {
	try {
		return JSON.parse(localStorage.getItem(storage) || '{}');
	} catch (e) {
		return { todo: [], doing: [], done: [] };
	}
}

function save(s) {
	localStorage.setItem(storage, JSON.stringify(s));
}

function render() {
	const state = load();
	cols.forEach(c => {
		const key = c.dataset.col;
		const ul = c.querySelector('.list');
		ul.innerHTML = '';
		(state[key] || []).forEach((t, i) => {
			const li = document.createElement('li');
			li.className = 'card';
			li.draggable = true;
			li.dataset.i = i;
			li.innerText = t;
			ul.appendChild(li);
		});
	});
}

cols.forEach(c => {
	c.querySelector('.add').addEventListener('click', () => {
		const t = prompt('Task title');
		if (!t) return;
		const s = load();
		s[c.dataset.col] = s[c.dataset.col] || [];
		s[c.dataset.col].push(t);
		save(s);
		render();
	});
});

document.addEventListener('dragstart', e => {
	if (e.target.classList.contains('card')) {
		e.dataTransfer.setData('text/plain', JSON.stringify({ from: e.target.parentElement.parentElement.dataset.col, index: +e.target.dataset.i, text: e.target.innerText }));
	}
});

cols.forEach(c => {
	const ul = c.querySelector('.list');
	ul.addEventListener('dragover', e => e.preventDefault());
	ul.addEventListener('drop', e => {
		e.preventDefault();
		const data = JSON.parse(e.dataTransfer.getData('text/plain'));
		const s = load();
		const item = s[data.from].splice(data.index, 1)[0];
		s[c.dataset.col].push(item);
		save(s);
		render();
	});
});

render();