if ('serviceWorker' in navigator) {


function drawChart() {
const income = transactions.filter(t => t.amount > 0).reduce((a,b)=>a+b.amount,0);
const expense = transactions.filter(t => t.amount < 0).reduce((a,b)=>a+Math.abs(b.amount),0);
new Chart(chartCtx, {
type: 'doughnut',
data: {
labels: ['Income', 'Expense'],
datasets: [{ data: [income, expense], backgroundColor: ['#4caf50', '#f44336'] }]
},
options: { responsive: true }
});
}


form.addEventListener('submit', e => {
e.preventDefault();
const description = document.getElementById('description').value;
const amount = parseFloat(document.getElementById('amount').value);
if (!description || isNaN(amount)) return;
transactions.push({ description, amount });
updateUI();
form.reset();
});


updateUI();
}