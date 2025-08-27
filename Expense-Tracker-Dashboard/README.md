# Expense Tracker Dashboard

A simple, responsive expense tracking dashboard using localStorage, array methods, and Chart.js for monthly visualization.

## Features

- Add income and expenses with description, amount, and date
- Persistent storage via localStorage
- Live totals: balance, total income, total expense
- Monthly income vs expense chart (Chart.js)
- Edit and delete transactions
- Export all data as CSV
- Responsive UI

## Getting Started

1. Open `index.html` in a modern browser, or serve via a local server for best results.
2. Start adding transactions using the form.
3. Your data is saved automatically in `localStorage`.

## Tech

- Vanilla HTML/CSS/JS
- Chart.js CDN for charts
- Browser localStorage for persistence

## CSV Export

Click "Export CSV" to download a `expenses.csv` containing all transactions with columns: `id,description,amount,type,date`.

## Notes

- Currency display uses your system locale in USD for formatting; you can adjust in `script.js` (`formatCurrency`).
- Data is stored under the key `expense_tracker_transactions_v1` in localStorage.

## License

MIT
