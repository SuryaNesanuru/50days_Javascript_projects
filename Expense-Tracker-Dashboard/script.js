// Expense Tracker Dashboard
(function(){
	const STORAGE_KEY = 'expense_tracker_transactions_v1';

	/** @typedef {{ id:string, description:string, amount:number, type:'income'|'expense', date:string }} Transaction */
	/** @type {Transaction[]} */
	let transactions = loadTransactions();
	let editedId = null;
	let chartInstance = null;

	// Elements
	const balanceEl = document.getElementById('balance');
	const totalIncomeEl = document.getElementById('totalIncome');
	const totalExpenseEl = document.getElementById('totalExpense');
	const form = document.getElementById('entryForm');
	const descriptionEl = document.getElementById('description');
	const amountEl = document.getElementById('amount');
	const typeEl = document.getElementById('type');
	const dateEl = document.getElementById('date');
	const listEl = document.getElementById('transactionList');
	const exportBtn = document.getElementById('exportCsvBtn');
	const clearAllBtn = document.getElementById('clearAllBtn');
	const chartCanvas = document.getElementById('monthlyChart');

	init();

	function init(){
		// default date today
		if(!dateEl.value) dateEl.valueAsDate = new Date();
		render();
		bindEvents();
	}

	function bindEvents(){
		form.addEventListener('submit', onSubmit);
		exportBtn.addEventListener('click', exportCsv);
		clearAllBtn.addEventListener('click', () => {
			if(confirm('Clear all transactions?')){
				transactions = [];
				saveTransactions();
				render();
			}
		});
	}

	function onSubmit(e){
		e.preventDefault();
		const description = descriptionEl.value.trim();
		const amount = parseFloat(amountEl.value);
		const type = /** @type {'income'|'expense'} */(typeEl.value);
		const date = dateEl.value || new Date().toISOString().slice(0,10);

		if(!description || isNaN(amount)) return;

		if(editedId){
			transactions = transactions.map(t => t.id === editedId ? { ...t, description, amount, type, date } : t);
			editedId = null;
		} else {
			transactions.unshift({ id: cryptoRandomId(), description, amount, type, date });
		}
		saveTransactions();
		form.reset();
		dateEl.valueAsDate = new Date();
		render();
	}

	function cryptoRandomId(){
		if(window.crypto && crypto.randomUUID) return crypto.randomUUID();
		return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
	}

	function saveTransactions(){
		localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
	}

	function loadTransactions(){
		try{
			const raw = localStorage.getItem(STORAGE_KEY);
			return raw ? JSON.parse(raw) : [];
		}catch{ return []; }
	}

	function computeTotals(){
		const income = transactions.filter(t => t.type==='income').reduce((s,t)=>s+t.amount,0);
		const expense = transactions.filter(t => t.type==='expense').reduce((s,t)=>s+t.amount,0);
		return { income, expense, balance: income - expense };
	}

	function render(){
		// totals
		const { income, expense, balance } = computeTotals();
		balanceEl.textContent = formatCurrency(balance);
		totalIncomeEl.textContent = formatCurrency(income);
		totalExpenseEl.textContent = formatCurrency(expense);

		// list
		listEl.innerHTML = '';
		if(transactions.length === 0){
			const empty = document.createElement('li');
			empty.textContent = 'No transactions yet';
			empty.style.color = '#64748b';
			listEl.appendChild(empty);
		}else{
			transactions.forEach(t => listEl.appendChild(renderRow(t)));
		}

		// chart
		renderChart();
	}

	function renderRow(t){
		const li = document.createElement('li');
		li.className = 'transaction';
		const tag = document.createElement('span');
		tag.className = 'tag';
		tag.textContent = t.type;
		const desc = document.createElement('span');
		desc.className = 'desc';
		desc.textContent = t.description;
		const date = document.createElement('span');
		date.className = 'date';
		date.textContent = t.date;
		const amount = document.createElement('span');
		amount.className = 'amount ' + (t.type==='income'?'income':'expense');
		amount.textContent = (t.type==='income'?'+':'-') + formatCurrency(t.amount);
		const actions = document.createElement('div');
		actions.className = 'row-actions';
		const editBtn = document.createElement('button');
		editBtn.className = 'btn';
		editBtn.textContent = 'Edit';
		editBtn.onclick = () => startEdit(t);
		const delBtn = document.createElement('button');
		delBtn.className = 'btn danger';
		delBtn.textContent = 'Delete';
		delBtn.onclick = () => deleteTx(t.id);
		actions.append(editBtn, delBtn);
		li.append(tag, desc, date, amount, actions);
		return li;
	}

	function startEdit(t){
		editedId = t.id;
		descriptionEl.value = t.description;
		amountEl.value = String(t.amount);
		typeEl.value = t.type;
		dateEl.value = t.date;
		descriptionEl.focus();
	}

	function deleteTx(id){
		transactions = transactions.filter(t => t.id !== id);
		saveTransactions();
		render();
	}

	function formatCurrency(n){
		return n.toLocaleString(undefined,{ style:'currency', currency:'USD' });
	}

	function groupByMonth(){
		// returns arrays for labels, income, expense
		const map = new Map(); // key: yyyy-mm
		transactions.forEach(t => {
			const key = (t.date || '').slice(0,7) || new Date().toISOString().slice(0,7);
			if(!map.has(key)) map.set(key, { income:0, expense:0 });
			map.get(key)[t.type] += t.amount;
		});
		const keys = Array.from(map.keys()).sort();
		const income = keys.map(k => map.get(k).income);
		const expense = keys.map(k => map.get(k).expense);
		return { labels: keys, income, expense };
	}

	function renderChart(){
		const { labels, income, expense } = groupByMonth();
		if(chartInstance){ chartInstance.destroy(); }
		chartInstance = new Chart(chartCanvas, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{ label:'Income', data: income, backgroundColor:'#16a34a', borderRadius:6 },
					{ label:'Expense', data: expense, backgroundColor:'#dc2626', borderRadius:6 }
				]
			},
			options: {
				responsive: true,
				plugins: { legend: { position:'top' } },
				scales: { y: { beginAtZero:true } }
			}
		});
	}

	function exportCsv(){
		if(transactions.length === 0){ alert('No data to export'); return; }
		const header = ['id','description','amount','type','date'];
		const rows = transactions.map(t => [t.id, escapeCsv(t.description), t.amount, t.type, t.date]);
		const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
		downloadFile('expenses.csv', 'text/csv;charset=utf-8;', csv);
	}

	function escapeCsv(value){
		const s = String(value ?? '');
		if(/[",\n]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
		return s;
	}

	function downloadFile(filename, mime, content){
		const blob = new Blob([content], { type: mime });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = filename; a.click();
		setTimeout(()=>URL.revokeObjectURL(url), 1000);
	}
})();
