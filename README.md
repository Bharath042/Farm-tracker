# 🌳 Farm Expense Tracker

A Progressive Web App (PWA) for tracking farm expenses, managing categories, and analyzing profitability for your casuarina plantation in Tamil Nadu, India.

## Features

✅ **Expense Tracking**
- Track expenses with unit-based calculations (quantity × price)
- Support for lump-sum fixed expenses
- Auto-calculation of total amounts
- Detailed expense history with filtering

✅ **Dynamic Categories**
- Create custom categories on-the-fly
- Choose between unit-based and lump-sum types
- Edit and delete categories anytime

✅ **Timeline & Milestones**
- Record important farm events (planting, fertilizing, harvesting)
- Visual timeline of all activities
- Track farm journey over time

✅ **Analytics & Reports**
- Category-wise expense breakdown
- Visual charts (pie, bar, line graphs)
- Monthly expense trends
- Percentage analysis
- ROI calculations

✅ **Mobile-Friendly**
- Responsive design for laptop and mobile
- Works offline with local storage
- Can be installed as an app on mobile devices

✅ **Local Storage**
- All data stored locally in your browser
- No internet required
- No data sent to external servers
- Data persists across sessions

## Getting Started

### Prerequisites
- Node.js v20.18+ or v22.12+
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd farm-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and go to:
```
http://localhost:5173
```

### Using on Mobile (Same WiFi)

1. Find your laptop's IP address:
   - Windows: Open Command Prompt and type `ipconfig` (look for IPv4 Address)
   - Mac/Linux: Open Terminal and type `ifconfig`

2. On your mobile phone, open browser and go to:
```
http://<your-laptop-ip>:5173
```

Example: `http://192.168.1.100:5173`

## How to Use

### 1. Create Categories

1. Go to **Categories** tab
2. Click **➕ Add Category**
3. Enter category name (e.g., "Labor", "Fertilizers")
4. Choose type:
   - **Lump Sum**: For fixed expenses (equipment, permits)
   - **Unit-Based**: For items with quantity (labor per person, fertilizer per liter)
5. Add optional description
6. Click **Create Category**

### 2. Log Expenses

1. Go to **Expenses** tab
2. Click **➕ Add Expense**
3. Fill in the form:
   - **Date**: When the expense occurred
   - **Category**: Select from your categories
   - **Item Name**: Specific item (e.g., "NPK Fertilizer", "Daily Labor")
   - **Type**: Auto-filled based on category
   - For **Unit-Based**: Enter unit price and quantity (total auto-calculates)
   - For **Lump Sum**: Enter total amount
4. Add optional description
5. Click **Add Expense**

### 3. Filter Expenses

1. Use the filter section to:
   - Filter by category
   - Filter by date range
   - Combine multiple filters
2. Click **Clear Filters** to reset

### 4. View Analytics

1. Go to **Analytics** tab
2. See:
   - Total expenses summary
   - Category-wise breakdown (pie chart)
   - Category comparison (bar chart)
   - Monthly spending trend (line chart)
   - Detailed category table with percentages

### 5. Track Milestones

1. Go to **Milestones** tab
2. Click **➕ Add Milestone**
3. Enter:
   - **Date**: When the event occurred
   - **Title**: Event name (e.g., "First Planting")
   - **Description**: Details about the event
4. Click **Add Milestone**
5. View all milestones on the timeline

### 6. Dashboard

The **Dashboard** shows:
- Total expenses spent
- Number of expense entries
- Number of categories
- Recent 5 expenses
- Quick access to add expenses and manage categories

## Data Structure

### Categories
```javascript
{
  id: "timestamp",
  name: "Labor",
  type: "unit-based", // or "lump-sum"
  description: "Daily labor costs",
  createdAt: "2025-01-15T10:30:00Z"
}
```

### Expenses
```javascript
{
  id: "timestamp",
  date: "2025-01-15",
  category: "category-id",
  categoryName: "Labor",
  itemName: "Daily Labor",
  type: "unit-based",
  unitPrice: 350,
  quantity: 10,
  amount: 3500, // for lump-sum
  description: "10 workers for field preparation",
  createdAt: "2025-01-15T10:30:00Z"
}
```

### Milestones
```javascript
{
  id: "timestamp",
  date: "2025-01-15",
  title: "First Planting",
  description: "Planted 500 saplings",
  createdAt: "2025-01-15T10:30:00Z"
}
```

## Keyboard Shortcuts

- **Esc**: Close forms and dialogs
- **Enter**: Submit forms (when focused on submit button)

## Tips for Best Results

1. **Be Consistent**: Use consistent item names for better tracking
2. **Add Descriptions**: Include notes for future reference
3. **Regular Updates**: Log expenses as they happen, not later
4. **Create Milestones**: Mark important events for timeline tracking
5. **Review Analytics**: Check analytics monthly to identify spending patterns
6. **Backup Data**: Periodically export your data (browser storage is persistent but backup is good)

## Troubleshooting

### Data Not Saving?
- Check browser console for errors (F12 → Console)
- Ensure IndexedDB is enabled in your browser
- Try clearing browser cache and reloading

### Charts Not Showing?
- Ensure you have at least one expense recorded
- Wait a moment for charts to load
- Refresh the page

### Mobile Access Not Working?
- Ensure both devices are on the same WiFi network
- Check firewall settings
- Try using the IP address instead of localhost

## Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Database**: IndexedDB (local storage)
- **Charts**: Chart.js + react-chartjs-2
- **Build**: Vite

## Project Structure

```
farm-tracker/
├── src/
│   ├── components/
│   │   └── Navigation.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── ExpenseTracker.jsx
│   │   ├── Categories.jsx
│   │   ├── Analytics.jsx
│   │   └── Milestones.jsx
│   ├── db.js (Database operations)
│   ├── App.jsx (Main app component)
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Development

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Future Enhancements

- [ ] Export data to CSV/Excel
- [ ] Import data from CSV
- [ ] Multi-farm support
- [ ] Expense budgeting and alerts
- [ ] Yield prediction based on expenses
- [ ] Weather integration
- [ ] Soil health tracking
- [ ] Crop rotation planning

## Notes

- This is a personal-use application designed for your farm
- All data is stored locally in your browser
- No data is sent to any server
- Data persists as long as you don't clear browser storage
- Perfect for tracking your casuarina plantation journey

## Support

For issues or questions, refer to the TEST_PLAN.md file for testing procedures.

---

**Happy Farming! 🌾**

Built with ❤️ for sustainable agriculture tracking.
