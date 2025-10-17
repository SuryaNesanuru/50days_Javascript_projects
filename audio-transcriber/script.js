const fileInput = document.getElementById('audio-file');
const btn = document.getElementById('transcribe');
const out = document.getElementById('output');

btn.addEventListener('click', async () => {
	if (!fileInput.files.length) return;
	out.textContent = 'Processing...';
	const file = fileInput.files[0];
	const array = await file.arrayBuffer();
	out.textContent = 'Transcription not implemented in this starter. Replace this with a call to a speech-to-text API (server-side recommended)';
});