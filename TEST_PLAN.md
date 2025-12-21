# Farm Tracker - Testing Plan

## Phase 9: Testing & Debugging

### Test Scenarios

#### 1. Database Initialization
- [x] App loads without errors
- [x] IndexedDB is created successfully
- [x] Object stores (categories, expenses, milestones, farmData) are created

#### 2. Category Management
- [ ] Create a new category (Lump Sum type)
- [ ] Create a new category (Unit-Based type)
- [ ] View all categories
- [ ] Edit a category
- [ ] Delete a category
- [ ] Verify category type affects expense form

#### 3. Expense Logging - Lump Sum
- [ ] Create lump sum expense
- [ ] Verify amount is stored correctly
- [ ] Edit lump sum expense
- [ ] Delete lump sum expense
- [ ] Verify data persists after page reload

#### 4. Expense Logging - Unit Based
- [ ] Create unit-based expense
- [ ] Verify auto-calculation (unitPrice × quantity = total)
- [ ] Edit unit-based expense
- [ ] Delete unit-based expense
- [ ] Verify calculations update correctly

#### 5. Expense Filtering
- [ ] Filter by category
- [ ] Filter by date range
- [ ] Combine category and date filters
- [ ] Clear filters

#### 6. Analytics
- [ ] Verify total expenses calculation
- [ ] Verify category-wise breakdown
- [ ] Verify pie chart displays correctly
- [ ] Verify bar chart displays correctly
- [ ] Verify line chart displays monthly trend
- [ ] Verify percentage calculations

#### 7. Milestones
- [ ] Create a milestone
- [ ] View milestone on timeline
- [ ] Delete a milestone
- [ ] Verify milestones persist

#### 8. Dashboard
- [ ] Verify stats cards show correct totals
- [ ] Verify recent expenses list
- [ ] Verify responsive layout on mobile

#### 9. Data Persistence
- [ ] Add expense, close browser, reopen - data should persist
- [ ] Add category, close browser, reopen - data should persist
- [ ] Add milestone, close browser, reopen - data should persist

#### 10. Responsive Design
- [ ] Test on desktop (1920px)
- [ ] Test on tablet (768px)
- [ ] Test on mobile (375px)
- [ ] Verify navigation works on mobile

#### 11. Edge Cases
- [ ] Add expense with 0 quantity
- [ ] Add expense with negative amount
- [ ] Add expense without date
- [ ] Add category without name
- [ ] Delete category with expenses (should still work)

#### 12. Performance
- [ ] Add 100+ expenses and verify performance
- [ ] Verify charts load smoothly
- [ ] Verify filtering is responsive

---

## Test Results

### Manual Testing Checklist
- [ ] All tests passed
- [ ] No console errors
- [ ] No data loss on reload
- [ ] Calculations are accurate
- [ ] UI is responsive
- [ ] All buttons work as expected

### Known Issues
(To be filled during testing)

### Fixes Applied
(To be filled during testing)

---

## Testing Commands

```bash
# Start dev server
npm run dev

# Open browser at http://localhost:5173
```

## Test Data to Create

1. **Categories:**
   - Labor (Unit-Based) - ₹/person
   - Fertilizers (Unit-Based) - ₹/liter
   - Seeds (Unit-Based) - ₹/packet
   - Equipment (Lump Sum)
   - Permits (Lump Sum)

2. **Expenses:**
   - Labor: 10 persons × ₹350 = ₹3,500
   - Fertilizer: 5 liters × ₹500 = ₹2,500
   - Equipment: ₹15,000 (lump sum)
   - Seeds: 20 packets × ₹200 = ₹4,000

3. **Milestones:**
   - Planting Date: 2025-01-15
   - First Fertilizer: 2025-02-01
   - Maintenance: 2025-03-01
