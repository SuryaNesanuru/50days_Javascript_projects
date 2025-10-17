const input = document.getElementById('ingredients');
const btn = document.getElementById('find');
const results = document.getElementById('results');

btn.addEventListener('click', async () => {
	const q = input.value.trim();
	if (!q) return;
	results.innerHTML = 'Searching...';
	results.innerHTML = 'No external API wired. Replace this with calls to an ingredients->recipe API or use a local dataset.';
});