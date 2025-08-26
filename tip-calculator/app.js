const billInput = document.getElementById('bill');
const customTipInput = document.getElementById('custom-tip');
const peopleInput = document.getElementById('people');
const tipButtons = document.querySelectorAll('.tip-btn');
const resultsSection = document.getElementById('results');
const resetBtn = document.getElementById('reset');

const tipPerPersonEl = document.getElementById('tip-per-person');
const totalPerPersonEl = document.getElementById('total-per-person');
const grandTotalEl = document.getElementById('grand-total');

const billError = document.getElementById('bill-error');
const peopleError = document.getElementById('people-error');

let currentTip = 15; // Default tip percentage
let billAmount = 0;
let numberOfPeople = 1;

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function showError(errorEl) {
  errorEl.classList.add('show');
  setTimeout(() => errorEl.classList.remove('show'), 3000);
}

function validateInputs() {
  let isValid = true;

  if (isNaN(billAmount) || billAmount <= 0) {
    showError(billError);
    isValid = false;
  }

  if (isNaN(numberOfPeople) || numberOfPeople < 1) {
    showError(peopleError);
    isValid = false;
  }

  return isValid;
}

function calculate() {
  billAmount = parseFloat(billInput.value) || 0;
  numberOfPeople = parseInt(peopleInput.value) || 1;

  if (!validateInputs()) {
    resultsSection.classList.remove('show');
    return;
  }

  const tipAmount = (billAmount * currentTip) / 100;
  const totalAmount = billAmount + tipAmount;
  
  const tipPerPerson = tipAmount / numberOfPeople;
  const totalPerPerson = totalAmount / numberOfPeople;

  tipPerPersonEl.textContent = formatCurrency(tipPerPerson);
  totalPerPersonEl.textContent = formatCurrency(totalPerPerson);
  grandTotalEl.textContent = formatCurrency(totalAmount);

  resultsSection.classList.add('show');
}

function setActiveTip(selectedBtn, tipValue) {
  tipButtons.forEach(btn => btn.classList.remove('active'));
  if (selectedBtn) selectedBtn.classList.add('active');
  
  currentTip = tipValue;
  customTipInput.value = '';
  calculate();
}

function resetCalculator() {
  billInput.value = '';
  customTipInput.value = '';
  peopleInput.value = '1';
  
  billAmount = 0;
  numberOfPeople = 1;
  currentTip = 15;
  
  tipButtons.forEach(btn => btn.classList.remove('active'));
  tipButtons[2].classList.add('active'); // 15% default
  
  resultsSection.classList.remove('show');
}

// Event listeners
billInput.addEventListener('input', calculate);
peopleInput.addEventListener('input', calculate);

customTipInput.addEventListener('input', (e) => {
  const value = parseFloat(e.target.value);
  if (!isNaN(value) && value >= 0) {
    tipButtons.forEach(btn => btn.classList.remove('active'));
    currentTip = value;
    calculate();
  }
});

tipButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tipValue = parseInt(btn.dataset.tip);
    setActiveTip(btn, tipValue);
  });
});

resetBtn.addEventListener('click', resetCalculator);

// Initialize
tipButtons[2].classList.add('active'); // Set 15% as default
