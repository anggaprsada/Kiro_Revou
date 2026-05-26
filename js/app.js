const STORAGE_KEY = 'expense_budget_transactions';
const CATEGORY_KEY = 'expense_budget_categories';
const LIMIT_KEY = 'expense_budget_limit';
const DEFAULT_CATEGORIES = ['Food', 'Transport', 'Fun'];

const transactionForm = document.getElementById('transactionForm');
const itemNameInput = document.getElementById('itemName');
const itemAmountInput = document.getElementById('itemAmount');
const itemCategorySelect = document.getElementById('itemCategory');
const itemDateInput = document.getElementById('itemDate');
const newCategoryInput = document.getElementById('newCategoryName');
const addCategoryButton = document.getElementById('addCategoryButton');
const spendLimitInput = document.getElementById('spendLimit');
const saveLimitButton = document.getElementById('saveLimitButton');
const formError = document.getElementById('formError');
const transactionList = document.getElementById('transactionList');
const totalBalance = document.getElementById('totalBalance');
const transactionCount = document.getElementById('transactionCount');
const thresholdValue = document.getElementById('thresholdValue');
const monthlyTotal = document.getElementById('monthlyTotal');
const monthlyItems = document.getElementById('monthlyItems');
const themeToggle = document.getElementById('themeToggle');
const chartCanvas = document.getElementById('categoryChart');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const currentMonthLabel = document.getElementById('currentMonthLabel');
const sortSelect = document.getElementById('sortSelect');

let transactions = [];
let categories = [];
let categoryChart = null;
let currentTheme = localStorage.getItem('expense_budget_theme') || 'light';
let currentMonth = new Date();
let sortOption = 'date_desc';
let spendLimit = 0;

document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? 'Light mode' : 'Dark mode';

function loadTransactions() {
  const stored = localStorage.getItem(STORAGE_KEY);
  transactions = stored ? JSON.parse(stored) : [];
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadCategories() {
  const stored = localStorage.getItem(CATEGORY_KEY);
  categories = stored ? JSON.parse(stored) : [...DEFAULT_CATEGORIES];
}

function saveCategories() {
  localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
}

function loadLimit() {
  const stored = localStorage.getItem(LIMIT_KEY);
  spendLimit = stored ? Number(stored) : 0;
}

function saveLimit(value) {
  spendLimit = value;
  localStorage.setItem(LIMIT_KEY, String(value));
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function formatDisplayDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function setCurrentMonthLabel() {
  currentMonthLabel.textContent = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function setCurrentDateInput() {
  const today = new Date().toISOString().slice(0, 10);
  itemDateInput.value = today;
}

function renderCategoryOptions() {
  const selectedValue = itemCategorySelect.value;
  itemCategorySelect.innerHTML = '<option value="">Select category</option>';
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    itemCategorySelect.appendChild(option);
  });
  if (selectedValue) {
    itemCategorySelect.value = selectedValue;
  }
}

function getVisibleTransactions() {
  const filterKey = getMonthKey(currentMonth);
  const visible = transactions.filter((transaction) => {
    const dateKey = transaction.dateISO ? transaction.dateISO.slice(0, 7) : getMonthKey(new Date());
    return dateKey === filterKey;
  });
  return sortTransactions(visible);
}

function sortTransactions(items) {
  return [...items].sort((a, b) => {
    switch (sortOption) {
      case 'date_asc':
        return new Date(a.dateISO) - new Date(b.dateISO);
      case 'date_desc':
        return new Date(b.dateISO) - new Date(a.dateISO);
      case 'amount_asc':
        return a.amount - b.amount;
      case 'amount_desc':
        return b.amount - a.amount;
      case 'category_asc':
        return a.category.localeCompare(b.category);
      case 'category_desc':
        return b.category.localeCompare(a.category);
      default:
        return 0;
    }
  });
}

function calculateTotals() {
  return transactions.reduce((total, item) => total + item.amount, 0);
}

function calculateVisibleTotals(visible) {
  return visible.reduce((total, item) => total + item.amount, 0);
}

function updateBalance() {
  const balance = calculateTotals();
  totalBalance.textContent = formatCurrency(balance);
}

function renderMonthlySummary(visible) {
  monthlyTotal.textContent = formatCurrency(calculateVisibleTotals(visible));
  monthlyItems.textContent = `${visible.length}`;
  thresholdValue.textContent = spendLimit > 0 ? formatCurrency(spendLimit) : 'None';
}

function renderTransactionList(visibleTransactions) {
  transactionList.innerHTML = '';
  transactionCount.textContent = `${visibleTransactions.length} item${visibleTransactions.length === 1 ? '' : 's'}`;

  if (visibleTransactions.length === 0) {
    transactionList.innerHTML = '<div class="empty-state">No transactions found for this month.</div>';
    return;
  }

  visibleTransactions.forEach((transaction) => {
    const row = document.createElement('div');
    row.className = 'transaction-item';
    const isOverLimit = spendLimit > 0 && transaction.amount > spendLimit;
    if (isOverLimit) {
      row.classList.add('highlighted');
    }
    row.innerHTML = `
      <div class="transaction-details">
        <p class="tx-name">${transaction.name}</p>
        <div class="tx-meta">
          <span>${transaction.category}</span>
          <span>${formatDisplayDate(transaction.dateISO)}</span>
          ${isOverLimit ? '<span class="highlight-chip">Over limit</span>' : ''}
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

function getCategoryTotals(items) {
  return items.reduce((counts, transaction) => {
    if (!counts[transaction.category]) {
      counts[transaction.category] = 0;
    }
    counts[transaction.category] += transaction.amount;
    return counts;
  }, categories.reduce((acc, category) => ({ ...acc, [category]: 0 }), {}));
}

function createChart(visibleTransactions) {
  const totals = getCategoryTotals(visibleTransactions);

  categoryChart = new Chart(chartCanvas, {
    type: 'pie',
    data: {
      labels: Object.keys(totals),
      datasets: [
        {
          data: Object.values(totals),
          backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#f97316', '#14b8a6'],
          hoverBackgroundColor: ['#16a34a', '#2563eb', '#d97706', '#7c3aed', '#ea580c', '#0f766e'],
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

function updateChart(visibleTransactions) {
  const totals = getCategoryTotals(visibleTransactions);
  if (!categoryChart) {
    createChart(visibleTransactions);
    return;
  }
  categoryChart.data.labels = Object.keys(totals);
  categoryChart.data.datasets[0].data = Object.values(totals);
  categoryChart.update();
}

function render() {
  const visibleTransactions = getVisibleTransactions();
  updateBalance();
  renderTransactionList(visibleTransactions);
  renderMonthlySummary(visibleTransactions);
  updateChart(visibleTransactions);
}

function addTransaction(event) {
  event.preventDefault();
  const name = itemNameInput.value.trim();
  const amountValue = parseFloat(itemAmountInput.value);
  const category = itemCategorySelect.value;
  const dateValue = itemDateInput.value;

  if (!name || Number.isNaN(amountValue) || amountValue <= 0 || !category || !dateValue) {
    formError.textContent = 'Please enter name, amount, category, and date.';
    return;
  }

  formError.textContent = '';

  const transaction = {
    id: Date.now().toString(),
    name,
    amount: Number(amountValue.toFixed(2)),
    category,
    dateISO: dateValue
  };

  transactions.unshift(transaction);
  saveTransactions();
  render();
  transactionForm.reset();
  setCurrentDateInput();
}

function addCategory() {
  const categoryName = newCategoryInput.value.trim();
  if (!categoryName) {
    formError.textContent = 'Enter a custom category name first.';
    return;
  }
  if (categories.includes(categoryName)) {
    formError.textContent = 'This category already exists.';
    return;
  }
  categories.push(categoryName);
  saveCategories();
  renderCategoryOptions();
  newCategoryInput.value = '';
  formError.textContent = '';
}

function saveLimitValue() {
  const limitValue = Number(spendLimitInput.value);
  if (Number.isNaN(limitValue) || limitValue < 0) {
    formError.textContent = 'Enter a valid limit amount.';
    return;
  }
  saveLimit(limitValue);
  spendLimitInput.value = '';
  formError.textContent = '';
  render();
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

function changeMonth(delta) {
  currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
  setCurrentMonthLabel();
  render();
}

transactionForm.addEventListener('submit', addTransaction);
addCategoryButton.addEventListener('click', addCategory);
saveLimitButton.addEventListener('click', saveLimitValue);
sortSelect.addEventListener('change', (event) => {
  sortOption = event.target.value;
  render();
});
prevMonthButton.addEventListener('click', () => changeMonth(-1));
nextMonthButton.addEventListener('click', () => changeMonth(1));
themeToggle.addEventListener('click', toggleTheme);

window.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadLimit();
  loadTransactions();
  renderCategoryOptions();
  setCurrentDateInput();
  setCurrentMonthLabel();
  render();
});
