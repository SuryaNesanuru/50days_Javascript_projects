const plantForm = document.getElementById('plantForm');
const cardsContainer = document.getElementById('cardsContainer');

let plants = JSON.parse(localStorage.getItem('plants')) || [];

// Utility to render all cards
function renderPlants() {
  cardsContainer.innerHTML = '';
  const now = new Date();

  plants.forEach((plant, index) => {
    const nextWater = new Date(plant.lastWatered);
    nextWater.setDate(nextWater.getDate() + plant.frequency);

    const diffMs = nextWater - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000*60*60*24)) / (1000*60*60));

    const card = document.createElement('div');
    card.className = 'card';

    // Color based on urgency
    if (diffDays < 1) card.classList.add('alert');
    else if (diffDays < 2) card.classList.add('warning');

    card.innerHTML = `
      ${plant.photo ? `<img src="${plant.photo}" alt="${plant.name}">` : ''}
      <h3>${plant.name}</h3>
      <p>Water every ${plant.frequency} day(s)</p>
      <p class="timer">Next watering: ${diffDays >= 0 ? `${diffDays}d ${diffHours}h` : 'Due now!'}</p>
      <button onclick="markWatered(${index})">💧 Mark Watered</button>
      <button onclick="removePlant(${index})">🗑 Remove</button>
    `;
    cardsContainer.appendChild(card);
  });

  localStorage.setItem('plants', JSON.stringify(plants));
}

// Add plant
plantForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('plantName').value.trim();
  const frequency = parseInt(document.getElementById('frequency').value);
  const photoInput = document.getElementById('plantPhoto');
  
  if (!name || !frequency) return;

  let photoData = '';
  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      photoData = ev.target.result;
      plants.push({ name, frequency, lastWatered: new Date(), photo: photoData });
      localStorage.setItem('plants', JSON.stringify(plants));
      renderPlants();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    plants.push({ name, frequency, lastWatered: new Date(), photo: '' });
    localStorage.setItem('plants', JSON.stringify(plants));
    renderPlants();
  }

  plantForm.reset();
});

// Mark as watered
window.markWatered = function(index) {
  plants[index].lastWatered = new Date();
  localStorage.setItem('plants', JSON.stringify(plants));
  renderPlants();
};

// Remove plant
window.removePlant = function(index) {
  plants.splice(index, 1);
  localStorage.setItem('plants', JSON.stringify(plants));
  renderPlants();
};

// Initial render and live timer update
renderPlants();
setInterval(renderPlants, 60 * 60 * 1000); // update every hour
