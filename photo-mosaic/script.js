const input = document.getElementById('files');
const mosaic = document.getElementById('mosaic');

input.addEventListener('change', () => {
	mosaic.innerHTML = '';
	Array.from(input.files).forEach(file => {
		const url = URL.createObjectURL(file);
		const img = document.createElement('img');
		img.src = url;
		img.draggable = true;
		img.addEventListener('click', () => { if (confirm('Remove this image?')) img.remove(); });
		img.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', url); });
		mosaic.appendChild(img);
	});
});

mosaic.addEventListener('dragover', e => e.preventDefault());
mosaic.addEventListener('drop', e => {
	e.preventDefault();
	const url = e.dataTransfer.getData('text/plain');
	if (url) {
		const img = document.createElement('img');
		img.src = url;
		mosaic.appendChild(img);
	}
});