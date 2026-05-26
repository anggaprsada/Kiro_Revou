# 💰 Expense & Budget Visualizer

A mobile-friendly web application to track daily expenses and visualize spending patterns.

## 📋 Overview

Expense & Budget Visualizer is a lightweight, client-side web application that helps users manage their finances efficiently. It features real-time balance tracking, transaction history, and visual analytics of spending by category.

## ✨ Features

### Core Features
- **Total Balance Display**: Shows current balance, total income, and total expenses at a glance
- **Transaction Management**: Add, view, and delete transactions with detailed information
- **Transaction History**: Complete record of all transactions with date and category information
- **Category-Based Charts**: Visual pie chart showing expenses breakdown by category
- **Local Storage**: All data persists in the browser's local storage

### Optional Features (Implemented)
- 📊 **Sort Transactions**: Sort by date (ascending/descending), amount, or category
- 📅 **Monthly Summary**: View income, expenses, and category breakdown for any month with month navigation
- 🌙 **Dark/Light Mode**: Toggle between dark and light themes with persistent preference

## 🛠 Tech Stack

- **HTML5**: Semantic structure
- **CSS3 + Tailwind CSS**: Responsive styling with dark mode support
- **Vanilla JavaScript**: No frameworks, pure ES6+ functionality
- **Browser Local Storage API**: Client-side data persistence

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No backend server required

### Installation

1. Clone or download the project:
```bash
git clone https://github.com/yourusername/expense-visualizer.git
cd expense-visualizer
```

2. Open the application:
```bash
# Simply open the HTML file in your browser
# File > Open > html/index.html
# Or double-click the index.html file
```

### Usage

1. **Add a Transaction**:
   - Fill in the description (e.g., "Coffee")
   - Enter the amount
   - Select a category
   - Choose type (Income/Expense)
   - Pick the date
   - Click "Add Transaction"

2. **View Analytics**:
   - Check the pie chart for expense breakdown by category
   - View the summary cards for total balance, income, and expenses

3. **Sort Transactions**:
   - Click the "📊 Sort" button to cycle through sort options
   - Available sorts: Date ↓, Date ↑, Amount ↓, Amount ↑, Category

4. **Monthly Summary**:
   - Click the "📅 Monthly" button to toggle monthly view
   - Use Previous/Next buttons to navigate between months

5. **Toggle Dark Mode**:
   - Click the 🌙/☀️ button in the header
   - Preference is saved automatically

## 📁 Project Structure

```
Kiro_Revou/
├── html/
│   └── index.html          # Main application page
├── css/
│   └── tailwind.css        # Tailwind CSS + custom dark mode styles
├── js/
│   └── app.js              # Complete application logic
├── Img/                    # Image assets folder
└── README.md               # This file
```

## 📊 Categories

- 🍔 Food
- 🚗 Transport
- 💡 Utilities
- 🎬 Entertainment
- ⚕️ Healthcare
- 🛍️ Shopping
- 📌 Other

## 💾 Data Storage

All transactions are stored locally in the browser using the Local Storage API:
- Key: `expenses_data`
- Format: JSON
- Persists across browser sessions

**Important**: Data is stored only on your device. Clearing browser data will delete all transactions.

## 🎨 Themes

- **Light Mode**: Clean, bright interface with orange accent colors
- **Dark Mode**: Easy-on-the-eyes dark theme for night-time use
- Theme preference is saved in localStorage

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Edge (latest)
- ✅ Safari (latest)

## 📱 Mobile Responsive

The application is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets
- Desktop screens

## ⚙️ Technical Constraints

- **TC-1**: HTML, CSS, Vanilla JavaScript (no frameworks)
- **TC-2**: Browser Local Storage only (no backend)
- **TC-3**: Works on all modern browsers
- **TC-4**: Single CSS file, single JS file policy
- **NFR-1**: Clean, minimalist UI
- **NFR-2**: Fast, responsive interactions
- **NFR-3**: User-friendly visual design

## 🔐 Privacy

All data is stored locally on your device. No data is sent to any server.

## 🐛 Known Limitations

- Data is cleared when browser cache is cleared
- No cloud sync feature
- No multi-device synchronization
- No data export/import feature

## 🚀 Deployment

### GitHub Pages Setup

1. Push your code to GitHub:
```bash
git add .
git commit -m "Initial commit: Expense Visualizer"
git push origin main
```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Scroll to GitHub Pages section
   - Select `main` branch as source
   - Your site will be available at: `https://yourusername.github.io/expense-visualizer/`

3. Access the application at the provided GitHub Pages URL

## 📝 License

This project is open source and available for educational purposes.

## 👤 Author

Created as part of the RevoU Full Stack Development Program

---

**Enjoy tracking your expenses!** 💰✨
