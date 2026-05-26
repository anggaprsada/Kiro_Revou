const STORAGE_KEY = 'expense_budget_transactions';
const TRANSACTIONS = {
  Food: 0,
  Transport: 0,
  Fun: 0
};

const transactionForm = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const itemAmountInput = document.getElementById('itemAmount');
const itemCategorySelect = document.getElementById('itemCategory');
const formError = document.getElementById('formError');
const transactionList = document.getElementById('transactionList');
const totalBalance = document.getElementById('totalBalance');
const transactionCount = document.getElementById('transactionCount');
const themeToggle = document.getElementById('themeToggle');
const chartCanvas = document.getElementById('categoryChart');

let transactions = [];
let categoryChart = null;
let currentTheme = localStorage.getItem('expense_budget_theme') || 'light';

document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';

function loadTransactions() {
  const stored = localStorage.getItem(STORAGE_KEY);
  transactions = stored ? JSON.parse(stored) : [];
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function calculateTotals() {
  return transactions.reduce((total, item) => total + item.amount, 0);
}

function updateBalance() {
  const balance = calculateTotals();
  totalBalance.textContent = formatCurrency(balance);
}

function renderTransactionList() {
  transactionList.innerHTML = '';
  transactionCount.textContent = `${transactions.length} item${transactions.length === 1 ? '' : 's'}`;

  if (transactions.length === 0) {
    transactionList.innerHTML = '<div class="empty-state">No transactions yet. Add your first expense to see the summary.</div>';
    return;
  }

  transactions.forEach((transaction) => {
    const row = document.createElement('div');
    row.className = 'transaction-item';
    row.innerHTML = `
      <div class="transaction-details">
        <p class="tx-name">${transaction.name}</p>
        <div class="tx-meta">
          <span>${transaction.category}</span>
          <span>${transaction.date}</span>
        </div>
      </div>
      <div>
        <p class="tx-amount">${formatCurrency(transaction.amount)}</p>
        <button class="delete-button" type="button" data-id="${transaction.id}">Delete</button>
      </div>
    `;

    const deleteButton = row.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => removeTransaction(transaction.id));
    transactionList.appendChild(row);
  });
}

function getCategoryTotals() {
  return transactions.reduce((counts, transaction) => {
    if (counts[transaction.category] !== undefined) {
      counts[transaction.category] += transaction.amount;
    }
    return counts;
  }, { ...TRANSACTIONS });
}

function createChart() {
  const totals = getCategoryTotals();

  categoryChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: Object.keys(totals),
      datasets: [
        {
          data: Object.values(totals),
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b'],
          hoverBackgroundColor: ['#16a34a', '#2563eb', '#d97706'],
          borderWidth: 0
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111'
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${formatCurrency(context.raw)}`
          }
        }
      }
    }
  });
}

function updateChart() {
  if (!categoryChart) {
    createChart();
    return;
  }

  const totals = getCategoryTotals();
  categoryChart.data.datasets[0].data = Object.values(totals);
  categoryChart.update();
}

function render() {
  updateBalance();
  renderTransactionList();
  updateChart();
}

function addTransaction(event) {
  event.preventDefault();
  const name = itemNameInput.value.trim();
  const amountValue = parseFloat(itemAmountInput.value);
  const category = itemCategorySelect.value;

  if (!name || Number.isNaN(amountValue) || amountValue <= 0 || !category) {
    formError.textContent = 'Please enter a name, a positive amount, and choose a category.';
    return;
  }

  formError.textContent = '';

  const transaction = {
    id: Date.now().toString(),
    name,
    amount: Number(amountValue.toFixed(2)),
    category,
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  };

  transactions.unshift(transaction);
  saveTransactions();
  render();
  transactionForm.reset();
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  render();
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
  localStorage.setItem('expense_budget_theme', currentTheme);
  themeToggle.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';
  if (categoryChart) {
    categoryChart.options.plugins.legend.labels.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
    categoryChart.update();
  }
}

transactionForm.addEventListener('submit', addTransaction);
themeToggle.addEventListener('click', toggleTheme);
window.addEventListener('DOMContentLoaded', () => {
  loadTransactions();
  render();
});
