// ===== STATE & CONFIG =====
let transactions = [];
let sortOrder = 'date-desc'; // date-desc, amount-desc, amount-asc, category
let currentMonthView = new Date();
const categoryEmojis = {
    food: '🍔',
    transport: '🚗',
    utilities: '💡',
    entertainment: '🎬',
    healthcare: '⚕️',
    shopping: '🛍️',
    other: '📌'
};

const categoryColors = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    utilities: '#45B7D1',
    entertainment: '#FFA07A',
    healthcare: '#98D8C8',
    shopping: '#F7DC6F',
    other: '#BB8FCE'
};

// ===== STORAGE =====
const STORAGE_KEY = 'expenses_data';

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    transactions = data ? JSON.parse(data) : [];
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    setupEventListeners();
    setDateToday();
    updateAllUI();
    initTheme();
});

function setupEventListeners() {
    // Form submission
    document.getElementById('transactionForm').addEventListener('submit', handleAddTransaction);
    
    // Sort button
    document.getElementById('sortBtn').addEventListener('click', handleSort);
    
    // Monthly view
    document.getElementById('monthlyViewBtn').addEventListener('click', toggleMonthlyView);
    document.getElementById('prevMonth').addEventListener('click', previousMonth);
    document.getElementById('nextMonth').addEventListener('click', nextMonth);
    
    // Clear all
    document.getElementById('clearBtn').addEventListener('click', handleClearAll);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function setDateToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// ===== TRANSACTION MANAGEMENT =====
function handleAddTransaction(e) {
    e.preventDefault();
    
    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;
    const date = document.getElementById('date').value;
    
    if (!description || !amount || !category || !date) {
        alert('Please fill in all fields');
        return;
    }
    
    const transaction = {
        id: Date.now(),
        description,
        amount,
        category,
        type,
        date,
        timestamp: new Date(date).getTime()
    };
    
    transactions.push(transaction);
    saveToStorage();
    updateAllUI();
    
    // Reset form
    document.getElementById('transactionForm').reset();
    setDateToday();
}

function handleClearAll() {
    if (confirm('Are you sure you want to delete all transactions? This action cannot be undone.')) {
        transactions = [];
        saveToStorage();
        updateAllUI();
    }
}

// ===== SORTING =====
function handleSort() {
    const sortOptions = ['date-desc', 'date-asc', 'amount-desc', 'amount-asc', 'category'];
    const currentIndex = sortOptions.indexOf(sortOrder);
    sortOrder = sortOptions[(currentIndex + 1) % sortOptions.length];
    
    applySorting();
    updateTransactionList();
    
    // Visual feedback
    const btnText = {
        'date-desc': '📊 Sort (Date ↓)',
        'date-asc': '📊 Sort (Date ↑)',
        'amount-desc': '📊 Sort (Amount ↓)',
        'amount-asc': '📊 Sort (Amount ↑)',
        'category': '📊 Sort (Category)'
    };
    document.getElementById('sortBtn').textContent = btnText[sortOrder];
}

function applySorting() {
    transactions.sort((a, b) => {
        switch(sortOrder) {
            case 'date-desc':
                return b.timestamp - a.timestamp;
            case 'date-asc':
                return a.timestamp - b.timestamp;
            case 'amount-desc':
                return b.amount - a.amount;
            case 'amount-asc':
                return a.amount - b.amount;
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });
}

// ===== UI UPDATE FUNCTIONS =====
function updateAllUI() {
    applySorting();
    updateBalances();
    updateTransactionList();
    updateChart();
}

function updateBalances() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    document.getElementById('totalBalance').textContent = formatNumber(balance);
    document.getElementById('totalIncome').textContent = formatNumber(income);
    document.getElementById('totalExpenses').textContent = formatNumber(expenses);
}

function updateTransactionList() {
    const listContainer = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        listContainer.innerHTML = '<p class="text-gray-500 text-center py-8">No transactions yet. Add one to get started!</p>';
        return;
    }
    
    listContainer.innerHTML = transactions.map(transaction => `
        <div class="list-item-custom flex justify-between items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div class="flex-1">
                <div class="flex items-center gap-3">
                    <span class="text-2xl">${categoryEmojis[transaction.category] || '📌'}</span>
                    <div>
                        <p class="font-semibold text-gray-800">${transaction.description}</p>
                        <p class="text-sm text-gray-500">${transaction.category} • ${formatDate(transaction.date)}</p>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
                    ${transaction.type === 'income' ? '+' : '-'} Rp ${formatNumber(transaction.amount)}
                </p>
            </div>
            <button class="ml-4 p-2 hover:bg-red-100 rounded text-red-600 transition-colors" onclick="deleteTransaction(${transaction.id})">
                ✕
            </button>
        </div>
    `).join('');
}

function deleteTransaction(id) {
    if (confirm('Delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveToStorage();
        updateAllUI();
    }
}

function updateChart() {
    const expensesByCategory = {};
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
        });
    
    const categories = Object.keys(expensesByCategory);
    const amounts = Object.values(expensesByCategory);
    
    if (categories.length === 0) {
        document.getElementById('expenseChart').style.display = 'none';
        document.getElementById('chartLegend').innerHTML = '<p class="text-gray-500">No expense data available</p>';
        return;
    }
    
    document.getElementById('expenseChart').style.display = 'block';
    drawPieChart(categories, amounts);
    updateChartLegend(categories, amounts);
}

function drawPieChart(categories, amounts) {
    const canvas = document.getElementById('expenseChart');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    let currentAngle = -Math.PI / 2;
    const colors = categories.map(cat => categoryColors[cat] || '#999');
    const total = amounts.reduce((a, b) => a + b, 0);
    
    amounts.forEach((amount, index) => {
        const sliceAngle = (amount / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();
        
        // Draw border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        const percentage = Math.round((amount / total) * 100);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(percentage + '%', labelX, labelY);
        
        currentAngle += sliceAngle;
    });
}

function updateChartLegend(categories, amounts) {
    const total = amounts.reduce((a, b) => a + b, 0);
    const legendHtml = categories.map((cat, index) => {
        const amount = amounts[index];
        const percentage = Math.round((amount / total) * 100);
        return `
            <div class="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <div class="w-4 h-4 rounded-full" style="background-color: ${categoryColors[cat]}"></div>
                <div class="flex-1">
                    <p class="font-medium text-gray-800">${categoryEmojis[cat]} ${cat}</p>
                    <p class="text-sm text-gray-600">Rp ${formatNumber(amount)} (${percentage}%)</p>
                </div>
            </div>
        `;
    }).join('');
    
    document.getElementById('chartLegend').innerHTML = legendHtml;
}

// ===== MONTHLY VIEW =====
function toggleMonthlyView() {
    const monthlyView = document.getElementById('monthlyView');
    monthlyView.classList.toggle('hidden');
    
    if (!monthlyView.classList.contains('hidden')) {
        updateMonthlySummary();
    }
}

function updateMonthlySummary() {
    const year = currentMonthView.getFullYear();
    const month = currentMonthView.getMonth();
    
    const monthName = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('monthDisplay').textContent = monthName;
    
    const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getFullYear() === year && tDate.getMonth() === month;
    });
    
    const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const byCategory = {};
    monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
        });
    
    let html = `
        <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="p-3 bg-green-50 rounded">
                <p class="text-sm text-gray-600">Income</p>
                <p class="font-bold text-green-600 text-lg">Rp ${formatNumber(income)}</p>
            </div>
            <div class="p-3 bg-red-50 rounded">
                <p class="text-sm text-gray-600">Expenses</p>
                <p class="font-bold text-red-600 text-lg">Rp ${formatNumber(expenses)}</p>
            </div>
        </div>
        <div class="border-t pt-4">
            <p class="font-semibold text-gray-800 mb-3">Expenses by Category:</p>
            ${Object.entries(byCategory).length === 0 ? 
                '<p class="text-gray-500 text-center py-4">No expenses this month</p>' :
                Object.entries(byCategory).map(([cat, amount]) => `
                    <div class="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                        <span>${categoryEmojis[cat]} ${cat}</span>
                        <span class="font-semibold">Rp ${formatNumber(amount)}</span>
                    </div>
                `).join('')
            }
        </div>
    `;
    
    document.getElementById('monthlySummary').innerHTML = html;
}

function previousMonth() {
    currentMonthView.setMonth(currentMonthView.getMonth() - 1);
    updateMonthlySummary();
}

function nextMonth() {
    currentMonthView.setMonth(currentMonthView.getMonth() + 1);
    updateMonthlySummary();
}

// ===== THEME =====
function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';
    if (isDark) {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIcon').textContent = '☀️';
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
}

// ===== UTILITY FUNCTIONS =====
function formatNumber(num) {
    return Math.abs(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function formatDate(dateStr) {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}
