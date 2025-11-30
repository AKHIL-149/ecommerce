# Quick Demo Data Import Guide

## ✅ Test Account Created!

Your demo account has been successfully created:

**Login Credentials:**
- **Email:** demo@superstore.com
- **Password:** demo123
- **Store:** Superstore Demo

**Access:** http://localhost:3002

---

## 🚀 Import Demo Data (2 Methods)

### Method 1: Manual Import (Recommended - 15 minutes)

This method gives you hands-on experience with the system.

#### Step 1: Login
1. Open http://localhost:3002
2. Click "Login"
3. Enter email: `demo@superstore.com`
4. Enter password: `demo123`
5. Click "Login"

#### Step 2: Create Categories (2 minutes)
1. Navigate to **Settings → Categories**
2. Create 3 categories:

**Category 1: Furniture**
- Name: Furniture
- Description: Tables, chairs, bookcases, and furnishings
- Color: #8B4513 (brown)
- Click "Add Category"

**Category 2: Office Supplies**
- Name: Office Supplies
- Description: Paper, binders, labels, and office essentials
- Color: #4169E1 (blue)
- Click "Add Category"

**Category 3: Technology**
- Name: Technology
- Description: Phones, accessories, copiers, and tech equipment
- Color: #32CD32 (green)
- Click "Add Category"

#### Step 3: Import Products (10 minutes)
1. Navigate to **Products**
2. Click "Add Product"
3. Open `demo_products.csv` in Excel/Notepad
4. Add 10-20 products manually (recommended for learning)

**Example Product 1:**
- Name: Bush Somerset Collection Bookcase
- SKU: FUR-BO-10001798
- Category: Furniture
- Price: 130.98
- Cost: 89.00
- Inventory: 50
- Low Stock Threshold: 10
- Status: Active

**Example Product 2:**
- Name: GBC Wire Binding Combs
- SKU: OFF-BI-10001617
- Category: Office Supplies
- Price: 1.01
- Cost: 0.50
- Inventory: 200
- Low Stock Threshold: 50
- Status: Active

**Quick Tip:** Copy and paste from CSV - much faster than typing!

#### Step 4: Add Customers (3 minutes)
1. Navigate to **Customers**
2. Click "Add Customer"
3. Open `demo_customers.csv`
4. Add 10-15 customers

**Example Customer 1:**
- Name: Tamara Chand
- Email: tamara.chand@example.com
- Phone: (508) 555-9468

**Example Customer 2:**
- Name: Tom Ashbrook
- Email: tom.ashbrook@example.com
- Phone: (101) 555-5873

#### Step 5: Create Orders (Optional - 5 minutes)
1. Navigate to **Orders**
2. Click "Create Order"
3. Select a customer
4. Add 2-3 products
5. Set status (Completed/Processing/Pending)
6. Click "Create Order"

**Repeat 5-10 times for realistic data**

---

### Method 2: Database Import (Advanced - 5 minutes)

For experienced users who want to import all data at once.

#### Option A: Using Docker Exec

```bash
# 1. Copy CSV files to backend container
docker cp demo_categories.csv ecom_backend:/app/demo_categories.csv
docker cp demo_products.csv ecom_backend:/app/demo_products.csv
docker cp demo_customers.csv ecom_backend:/app/demo_customers.csv
docker cp demo_orders.csv ecom_backend:/app/demo_orders.csv

# 2. Run the seed script
docker-compose exec backend node src/scripts/seed-demo-data.js
```

#### Option B: Direct Database Import (PostgreSQL)

```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d ecom_analytics

# Then run SQL inserts (advanced)
# See database documentation for COPY commands
```

---

## 📊 What You'll Have After Import

### Categories (3)
- Furniture (Brown)
- Office Supplies (Blue)
- Technology (Green)

### Products (100)
- 18 Furniture items
- 67 Office Supplies
- 15 Technology items
- Price range: $0.32 - $699.99

### Customers (100)
- 52 Consumer segment
- 29 Corporate segment
- 19 Home Office segment
- Top customer: $19,052 lifetime value

### Orders (54 if using Method 2)
- 27 Completed
- 16 Processing
- 11 Pending
- Total revenue: $44,482

---

## 🎯 Next Steps After Import

### 1. Explore Dashboard (2 minutes)
- View sales trends
- Check category performance pie chart
- See top products
- Monitor low stock alerts

### 2. Test Features (5 minutes)
- Filter products by category
- View customer purchase history
- Export a CSV report
- Use bulk operations (select multiple products)

### 3. Complete Walkthrough (90 minutes)
- Open [DEMO_GUIDE.md](DEMO_GUIDE.md)
- Follow Phase 1-4
- Practice all 14 enhancements

---

## 🔍 Verify Your Import

### Check Categories
1. Settings → Categories
2. Should see 3 categories with colors

### Check Products
1. Products page
2. Use category filter dropdown
3. Should see products in each category

### Check Customers
1. Customers page
2. Should see customer list
3. Click "Orders" on any customer (if orders imported)

### Check Dashboard
1. Dashboard should show:
   - Category pie chart
   - Sales trends (if orders)
   - Low stock alerts
   - Top products (if orders)

---

## ⚠️ Troubleshooting

### "No categories showing"
- Refresh page (Ctrl+F5)
- Check you're logged into correct store
- Verify categories were created

### "Can't add products"
- Ensure categories exist first
- Check all required fields filled
- Verify price is a number

### "Dashboard is empty"
- This is normal with no orders yet
- Add some orders to see analytics
- Or use Method 2 to import order data

### "Forgot password"
- Default password is: demo123
- Email: demo@superstore.com
- Or reset via database if needed

---

## 💡 Pro Tips

### Tip 1: Start Small
Don't import all 100 products at once. Start with 10-20 to learn the interface.

### Tip 2: Use Copy-Paste
Open CSV files in Excel, copy entire rows, paste into form fields - much faster!

### Tip 3: Add Images Later
Import products first without images, then add images using the "Edit" function.

### Tip 4: Create Realistic Orders
Mix statuses (completed, processing, pending) to see full order timeline feature.

### Tip 5: Test Everything
After importing, test each feature:
- Category filtering
- CSV exports
- Bulk operations
- Customer history
- Dashboard analytics

---

## 📚 Resources

- **Quick Start:** This guide
- **Full Walkthrough:** [DEMO_GUIDE.md](DEMO_GUIDE.md)
- **User Manual:** [USER_GUIDE.md](USER_GUIDE.md)
- **Features:** [FINAL_ENHANCEMENTS_REPORT.md](FINAL_ENHANCEMENTS_REPORT.md)

---

## ✅ Import Checklist

**Account Setup:**
- [ ] Logged in with demo@superstore.com
- [ ] Verified Superstore Demo store is selected

**Data Import:**
- [ ] Created 3 categories
- [ ] Added 10-20 products
- [ ] Added 10-15 customers
- [ ] Created 5-10 orders (optional)

**Verification:**
- [ ] Dashboard shows data
- [ ] Category filter works
- [ ] Can export CSV
- [ ] Customer history displays

**Learning:**
- [ ] Explored all navigation menus
- [ ] Tested category filtering
- [ ] Tried bulk operations
- [ ] Exported a report

---

**🎉 You're Ready!**

Your demo account is set up and ready to explore. Start with Method 1 (manual import) to learn the system, or use Method 2 for quick data loading.

**Login now:** http://localhost:3002

---

*Last Updated: November 29, 2024*
*Demo Account: demo@superstore.com / demo123*
*Store ID: 6 (Superstore Demo)*
