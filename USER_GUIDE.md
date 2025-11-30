# E-Commerce Inventory Management System - User Guide

## 📖 Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Product Management](#product-management)
4. [Order Management](#order-management)
5. [Customer Management](#customer-management)
6. [Inventory Management](#inventory-management)
7. [Reports & Analytics](#reports--analytics)
8. [Settings & Configuration](#settings--configuration)
9. [Tips & Best Practices](#tips--best-practices)

---

## Getting Started

### First Time Login
1. Access the application at `http://localhost:3000`
2. Register with your email and password
3. Create your first store with:
   - Store name
   - Currency preference (USD, EUR, etc.)
   - Timezone
   - Default low stock threshold

### Navigation
- **Dashboard**: Overview of your business metrics
- **Products**: Manage your product catalog
- **Orders**: Track and manage orders
- **Customers**: Customer database and relationships
- **Inventory**: Stock levels and adjustments
- **Reports**: Analytics and insights
- **Settings**: Store and account configuration

---

## Dashboard Overview

The Dashboard provides real-time insights into your business performance.

### Today's Metrics
- **Orders Today**: Total orders received today
- **Revenue Today**: Total sales revenue
- **Average Order Value**: Revenue per order

### Analytics Charts
1. **Sales Trend Chart**
   - View revenue and order trends over time
   - Filter by date range (default: last 30 days)
   - Filter by category for specific product line analysis

2. **Category Analytics** (Pie Chart)
   - Sales distribution across product categories
   - Color-coded for easy identification
   - Click category filter to view detailed breakdown

3. **Top Products**
   - Bar chart showing best-selling products
   - Based on revenue generation
   - Limited to top 5 products

4. **Low Stock Alerts**
   - Products below threshold
   - Quantity remaining
   - Threshold value for reference

### Quick Actions
- Add Product
- Create Order
- Register Customer
- View Reports

---

## Product Management

### Adding a New Product

1. Click **"Add Product"** button
2. Fill in product details:
   - **Product Name** (required)
   - **SKU** (optional - product code)
   - **Category** (select from dropdown)
   - **Description** (optional)
   - **Price** (required - selling price)
   - **Cost** (optional - for profit margin tracking)
   - **Inventory Quantity** (current stock)
   - **Low Stock Threshold** (default: 10)
   - **Status** (Active/Inactive)
   - **Product Image** (PNG, JPG, GIF up to 5MB)

3. Click **"Create Product"**

### Product Image Upload
- Click **"Upload Image"** button
- Select image file (max 5MB)
- Preview appears immediately
- Click **×** to remove image
- Supported formats: PNG, JPG, GIF

### Editing Products
1. Find product in list
2. Click **"Edit"** button
3. Update fields as needed
4. Click **"Update Product"**

### Filtering Products
- **Search**: Type product name or SKU
- **Category Filter**: Select category from dropdown
- **Results update automatically**

### Low Stock Indicators
Products display visual status:
- 🔴 **Red "Out of Stock"**: Quantity = 0
- 🟡 **Yellow "⚠️ Low Stock"**: Quantity ≤ threshold
- 🟢 **Green**: Normal stock levels

### Bulk Operations

#### Selecting Products
1. Check boxes next to products
2. Or click **Select All** checkbox
3. Bulk toolbar appears automatically

#### Bulk Actions
- **Delete Selected**: Remove multiple products
- **Assign Category**: Apply category to selected products
- **Export Selected**: Download CSV of selected items

#### Usage Example
```
1. Select 10 products
2. Choose "Assign category"
3. Select "Electronics" from dropdown
4. Click "Apply"
5. All 10 products now categorized as Electronics
```

### CSV Export
- Click **"Export CSV"** to download all products
- File includes: Name, SKU, Category, Price, Stock, Status
- Filename: `products_[StoreName]_[Date].csv`

---

## Order Management

### Creating an Order

1. Click **"Create Order"** button
2. Select customer (or create new)
3. Add products:
   - Search/select products
   - Enter quantities
   - Prices auto-populate
4. Review totals
5. Select order status
6. Click **"Create Order"**

### Order Status Workflow

Orders follow a standard progression:
1. **Pending** → Order received, awaiting processing
2. **Processing** → Order being prepared/shipped
3. **Completed** → Order fulfilled
4. **Cancelled** → Order cancelled (separate track)

### Order Timeline Visualization
- View **Order Details** to see visual timeline
- Checkmarks show completed stages
- Current stage highlighted in blue
- Cancelled orders show special indicator

### Filtering Orders

**Search**: Order number or customer name

**Status Filter**:
- All Statuses
- Pending only
- Processing only
- Completed only
- Cancelled only

**Date Range Filter**:
1. Select "From Date"
2. Select "To Date"
3. Results filter automatically
4. Click **"Clear Dates"** to reset

**Combined Filtering**:
```
Example: Find all completed orders for "John Doe"
in January 2025
- Search: "John Doe"
- Status: Completed
- From: 2025-01-01
- To: 2025-01-31
```

### Viewing Order Details
1. Click **"View Details"** on any order
2. See complete order information:
   - Order number and date
   - Customer details
   - Product list with quantities
   - Pricing breakdown
   - Status timeline
   - Notes

### Updating Order Status
1. Open order details
2. Click status update buttons
3. Confirm action
4. Timeline updates automatically

### CSV Export
- Click **"Export CSV"** to download orders
- Respects current filters (date, status, search)
- File includes: Order #, Customer, Date, Items, Total, Status
- Filename: `orders_[StoreName]_[Date].csv`

---

## Customer Management

### Adding a Customer

1. Click **"Add Customer"** button
2. Enter customer information:
   - **Name** (required)
   - **Email** (optional)
   - **Phone** (optional)
   - **Address** (optional)
3. Click **"Create Customer"**

### Customer Information Display

Each customer shows:
- Name
- Contact info (email/phone)
- Total orders count
- Total spent (lifetime value)
- Last order date

### Viewing Purchase History

1. Click **"Orders"** button next to customer
2. Modal displays:
   - **Statistics Dashboard**:
     - Total orders count
     - Total spent (lifetime value)
     - Average order value
   - **Order Timeline**:
     - All orders sorted by date
     - Order numbers
     - Amounts
     - Status badges
     - Scrollable list

### Editing Customers
1. Find customer in list
2. Click **"Edit"** button
3. Update information
4. Click **"Update Customer"**

### Customer Search
- Type name, email, or phone number
- Results filter automatically
- Search across all fields

### CSV Export
- Click **"Export CSV"** to download customers
- Respects search filter
- File includes: Name, Email, Phone, Orders, Spending, Last Order
- Filename: `customers_[StoreName]_[Date].csv`

---

## Inventory Management

### Two Main Views

#### 1. Stock Levels Tab
Shows current inventory snapshot:
- Product names
- SKU codes
- Current quantities
- Low stock thresholds
- Status indicators

#### 2. Adjustment History Tab
Shows all stock changes:
- Date and time
- Product affected
- Adjustment type
- Quantity change
- Old → New quantity
- Reason for adjustment
- User who made change

### Making Stock Adjustments

1. Go to **Inventory** page
2. Click **"Adjust Stock"** on product
3. Enter adjustment details:
   - **Type**:
     - Restock (add inventory)
     - Sale (reduce inventory)
     - Damage (write-off)
     - Return (customer return)
     - Correction (fix errors)
   - **Quantity**: Amount to adjust
   - **Reason**: Explanation (optional but recommended)
4. Click **"Save Adjustment"**
5. Stock level updates immediately

### Stock Level Indicators

Visual cues help identify issues:
- 🔴 **Critical**: Out of stock
- 🟡 **Warning**: Low stock
- 🟢 **Normal**: Adequate stock

### CSV Exports

**Two export options**:

1. **Export Inventory** (Stock Levels tab)
   - Current snapshot
   - File: `inventory_[StoreName].csv`
   - Includes: SKU, stock, thresholds, status

2. **Export Adjustments** (History tab)
   - All stock movements
   - File: `inventory_adjustments_[StoreName].csv`
   - Includes: Date, product, type, quantity, reason, user

---

## Reports & Analytics

### Available Reports

1. **Sales Reports**
   - Daily/weekly/monthly sales trends
   - Revenue breakdown
   - Order volume analysis

2. **Product Performance**
   - Top selling products
   - Product revenue comparison
   - Category performance

3. **Customer Analytics**
   - Customer lifetime value
   - Order frequency
   - Top customers by spending

4. **Inventory Reports**
   - Stock level summaries
   - Low stock items
   - Adjustment history

### Filtering Reports

- **Date Range**: Select start and end dates
- **Category**: Filter by product category
- **Export**: Download report as CSV

### Using Dashboard Analytics

**View Category Performance**:
1. Dashboard → Category Analytics section
2. Pie chart shows sales distribution
3. Table shows detailed metrics:
   - Revenue per category
   - Order count
   - Product count

**Filter by Category**:
1. Select category from dropdown
2. Sales trend updates automatically
3. Chart title shows selected category
4. View category-specific performance

---

## Settings & Configuration

### Store Settings

Access: **Settings → Store** tab

Configure:
- **Store Name**: Your business name
- **Currency**: USD, EUR, GBP, etc.
- **Timezone**: For accurate timestamps
- **Low Stock Threshold**: Default warning level

### Profile Settings

Access: **Settings → Profile** tab

Update:
- Your name
- Email address

### Password Management

Access: **Settings → Password** tab

Change password:
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click **"Change Password"**

### Category Management

Access: **Settings → Categories** tab

#### Creating Categories
1. Enter category name (e.g., "Electronics")
2. Add description (optional)
3. Choose color for visual identification
4. Click **"Add Category"**

#### Color Coding Benefits
- Visual distinction in product lists
- Analytics charts use category colors
- Easier product organization

#### Editing Categories
1. Find category in list
2. Click **"Edit"**
3. Update fields
4. Click **"Update Category"**

#### Deleting Categories
1. Click **"Delete"** on category
2. Confirm deletion
3. Products in category become "Uncategorized"
4. No products are deleted

---

## Tips & Best Practices

### Product Management
✅ **DO**:
- Always add product images for better customer experience
- Set realistic low stock thresholds (typically 5-20 units)
- Use categories to organize large catalogs
- Keep SKUs consistent and meaningful
- Update prices and descriptions regularly

❌ **DON'T**:
- Don't delete products with order history (mark inactive instead)
- Don't set threshold too high (causes false alerts)
- Don't leave descriptions empty

### Inventory Control
✅ **DO**:
- Perform regular stock counts
- Always add reasons for adjustments
- Monitor low stock alerts daily
- Review adjustment history weekly
- Export inventory reports for backup

❌ **DON'T**:
- Don't make adjustments without documentation
- Don't ignore low stock warnings
- Don't skip cycle counts

### Order Processing
✅ **DO**:
- Update order status promptly
- Add notes to complex orders
- Review pending orders daily
- Export orders for accounting
- Use date filters to track periods

❌ **DON'T**:
- Don't leave orders in "pending" indefinitely
- Don't skip status updates
- Don't process orders without stock verification

### Customer Management
✅ **DO**:
- Collect email addresses for marketing
- Track customer purchase history
- Identify top customers (lifetime value)
- Use customer data for targeted campaigns
- Export customer lists regularly

❌ **DON'T**:
- Don't delete customers with order history
- Don't ignore repeat customers
- Don't forget to update contact info

### Data Management
✅ **DO**:
- Export CSV backups weekly
- Review analytics monthly
- Archive old data
- Use bulk operations for efficiency
- Filter data before exporting

❌ **DON'T**:
- Don't rely solely on the system (keep backups)
- Don't export without filters (too much data)
- Don't ignore data quality issues

### Categories
✅ **DO**:
- Create logical category structure
- Use consistent naming
- Assign colors thoughtfully
- Review category performance in analytics
- Reorganize as needed

❌ **DON'T**:
- Don't create too many categories (becomes confusing)
- Don't use similar names for different categories
- Don't delete categories without reassigning products

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Search products | Focus on search box |
| Create new product | Click "Add Product" |
| Export current view | Click "Export CSV" |
| Navigate pages | Previous/Next buttons |

---

## Troubleshooting

### Common Issues

**Products not appearing**:
- Check category filter (select "All Categories")
- Clear search box
- Verify product status is "Active"

**CSV export empty**:
- Ensure data exists in current view
- Check filters aren't excluding all results
- Try refreshing page

**Low stock alerts not showing**:
- Verify threshold is set correctly
- Check actual inventory quantity
- Refresh inventory page

**Order status not updating**:
- Ensure proper permissions
- Check internet connection
- Try refreshing page

**Images not uploading**:
- Check file size (max 5MB)
- Verify file format (PNG, JPG, GIF)
- Try compressing image

---

## Getting Help

### Resources
- User guide (this document)
- Technical documentation: [FINAL_ENHANCEMENTS_REPORT.md](FINAL_ENHANCEMENTS_REPORT.md)
- Enhancement summary: [ENHANCEMENTS_SUMMARY.md](ENHANCEMENTS_SUMMARY.md)

### Support
For technical issues or feature requests, consult the project documentation or contact your system administrator.

---

## Quick Reference Card

### Daily Tasks
- [ ] Check low stock alerts
- [ ] Process pending orders
- [ ] Update order statuses
- [ ] Review new customers

### Weekly Tasks
- [ ] Export inventory backup
- [ ] Review top products
- [ ] Check category performance
- [ ] Reconcile stock levels

### Monthly Tasks
- [ ] Export financial reports
- [ ] Review customer analytics
- [ ] Update product pricing
- [ ] Clean up inactive products
- [ ] Archive old orders

---

*Last Updated: November 29, 2025*
*Version: 1.0*
*System Version: 14 Enhancements Complete*
