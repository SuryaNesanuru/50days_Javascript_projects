const file = document.getElementById('img-file');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const add = document.getElementById('add-rect');
const ann = document.getElementById('annotations');
let img = new Image();

file.addEventListener('change', () => {
	if (!file.files.length) return;
	const url = URL.createObjectURL(file.files[0]);
	img.onload = () => {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0);
	};
	img.src = url;
});

add.addEventListener('click', () => {
	const x = Math.random() * (canvas.width - 60);
	const y = Math.random() * (canvas.height - 40);
	ctx.strokeStyle = 'red';
	ctx.strokeRect(x, y, 60, 40);
	const li = document.createElement('li');
	li.textContent = `Rect @ ${Math.round(x)},${Math.round(y)}`;
	ann.appendChild(li);
});