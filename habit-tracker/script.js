const form = document.getElementById('add-form');
const list = document.getElementById('habits');
const key = 'habits-v1';

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

function render() {
	list.innerHTML = '';
	const items = load();
	items.forEach((h, i) => {
		const li = document.createElement('li');
		li.className = 'habit';
		li.innerHTML = `<span>${h.name} <small>${h.streak || 0} day(s)</small></span><div><button data-i="${i}" class="inc">+1</button><button data-i="${i}" class="del">✕</button></div>`;
		list.appendChild(li);
	});
}

form.addEventListener('submit', e => {
	e.preventDefault();
	const name = document.getElementById('habit-name').value.trim();
	if (!name) return;
	const items = load();
	items.push({ name, streak: 0, added: Date.now() });
	save(items);
	form.reset();
	render();
});

list.addEventListener('click', e => {
	const b = e.target.closest('button');
	if (!b) return;
	const i = +b.dataset.i;
	const items = load();
	if (b.classList.contains('del')) {
		items.splice(i, 1);
		save(items);
		render();
	} else if (b.classList.contains('inc')) {
		items[i].streak = (items[i].streak || 0) + 1;
		save(items);
		render();
	}
});

render();