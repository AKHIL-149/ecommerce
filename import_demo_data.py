#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Superstore Demo Data Import Script
E-Commerce Inventory Management System

This script processes the sample_superstore.xls file and generates
CSV files that can be easily imported into the inventory management system.

Usage: python import_demo_data.py

Output:
- demo_products.csv - Product catalog
- demo_customers.csv - Customer list
- demo_orders.csv - Order transactions
"""

import pandas as pd
from datetime import datetime
import os
import sys

# Set UTF-8 encoding for Windows console
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

def load_superstore_data():
    """Load the Superstore dataset"""
    print("Loading Superstore dataset...")
    try:
        df = pd.read_excel('sample_superstore.xls')
        print(f"✓ Loaded {len(df)} orders")
        return df
    except FileNotFoundError:
        print("Error: sample_superstore.xls not found in current directory")
        return None

def extract_products(df):
    """Extract unique products from orders"""
    print("\nExtracting products...")

    # Get unique products
    products = df.groupby(['Product ID', 'Product Name', 'Category', 'Sub-Category']).agg({
        'Sales': 'mean',  # Average sale price
        'Quantity': 'sum',  # Total quantity sold
        'Profit': 'sum'  # Total profit
    }).reset_index()

    # Calculate average price per unit
    products['price'] = (products['Sales'] / products['Quantity']).round(2)

    # Calculate estimated cost (Price - average profit margin)
    products['avg_profit_per_unit'] = (products['Profit'] / products['Quantity']).round(2)
    products['cost'] = (products['price'] - products['avg_profit_per_unit']).round(2)
    products['cost'] = products['cost'].clip(lower=0)  # Ensure cost is non-negative

    # Set initial inventory (random for demo)
    import numpy as np
    np.random.seed(42)
    products['inventory_quantity'] = np.random.randint(10, 200, size=len(products))

    # Set low stock threshold based on category
    products['low_stock_threshold'] = products['Category'].map({
        'Furniture': 10,
        'Office Supplies': 50,
        'Technology': 15
    })

    # Prepare final product export
    product_export = pd.DataFrame({
        'sku': products['Product ID'],
        'name': products['Product Name'],
        'category': products['Category'],
        'sub_category': products['Sub-Category'],
        'description': products['Sub-Category'] + ' - ' + products['Product Name'],
        'price': products['price'],
        'cost': products['cost'],
        'inventory_quantity': products['inventory_quantity'],
        'low_stock_threshold': products['low_stock_threshold'],
        'status': 'active'
    })

    # Sample only 100 products for demo (full dataset has 1850+ products)
    product_sample = product_export.sample(n=min(100, len(product_export)), random_state=42)
    product_sample = product_sample.sort_values('category')

    print(f"✓ Extracted {len(product_sample)} sample products")
    print(f"  - Furniture: {len(product_sample[product_sample['category'] == 'Furniture'])}")
    print(f"  - Office Supplies: {len(product_sample[product_sample['category'] == 'Office Supplies'])}")
    print(f"  - Technology: {len(product_sample[product_sample['category'] == 'Technology'])}")

    return product_sample

def extract_customers(df):
    """Extract unique customers from orders"""
    print("\nExtracting customers...")

    # Get unique customers with aggregated data
    customers = df.groupby(['Customer ID', 'Customer Name']).agg({
        'Order ID': 'count',  # Total orders
        'Sales': 'sum',  # Total spent
        'Order Date': 'max'  # Last order date
    }).reset_index()

    customers.columns = ['customer_id', 'name', 'total_orders', 'total_spent', 'last_order_date']

    # Add geographic info from first occurrence
    location_info = df.groupby('Customer ID').first()[['City', 'State', 'Postal Code', 'Segment']]
    customers = customers.merge(location_info, left_on='customer_id', right_index=True)

    # Generate demo email addresses
    customers['email'] = customers['name'].str.lower().str.replace(' ', '.') + '@example.com'

    # Generate demo phone numbers
    customers['phone'] = customers.apply(lambda x: f"({hash(x['customer_id']) % 900 + 100}) 555-{hash(x['name']) % 9000 + 1000:04d}", axis=1)

    # Prepare final customer export
    customer_export = pd.DataFrame({
        'customer_id': customers['customer_id'],
        'name': customers['name'],
        'email': customers['email'],
        'phone': customers['phone'],
        'address': customers['City'] + ', ' + customers['State'] + ' ' + customers['Postal Code'].astype(str),
        'segment': customers['Segment'],
        'total_orders': customers['total_orders'],
        'total_spent': customers['total_spent'].round(2),
        'last_order_date': customers['last_order_date'].dt.strftime('%Y-%m-%d')
    })

    # Sample 100 customers for demo
    customer_sample = customer_export.sample(n=min(100, len(customer_export)), random_state=42)
    customer_sample = customer_sample.sort_values('total_spent', ascending=False)

    print(f"✓ Extracted {len(customer_sample)} sample customers")
    print(f"  - Consumer: {len(customer_sample[customer_sample['segment'] == 'Consumer'])}")
    print(f"  - Corporate: {len(customer_sample[customer_sample['segment'] == 'Corporate'])}")
    print(f"  - Home Office: {len(customer_sample[customer_sample['segment'] == 'Home Office'])}")

    return customer_sample

def extract_orders(df, selected_customers, selected_products):
    """Extract sample orders matching selected customers and products"""
    print("\nExtracting orders...")

    # Filter orders to only include selected customers and products
    selected_customer_ids = selected_customers['customer_id'].tolist()
    selected_product_ids = selected_products['sku'].tolist()

    orders_filtered = df[
        (df['Customer ID'].isin(selected_customer_ids)) &
        (df['Product ID'].isin(selected_product_ids))
    ].copy()

    # Sample 200 orders for demo
    order_sample = orders_filtered.sample(n=min(200, len(orders_filtered)), random_state=42)

    # Add order status (random for demo)
    import numpy as np
    np.random.seed(42)
    statuses = ['completed', 'completed', 'completed', 'processing', 'pending']  # Weighted towards completed
    order_sample['status'] = np.random.choice(statuses, size=len(order_sample))

    # Prepare final order export
    order_export = pd.DataFrame({
        'order_id': order_sample['Order ID'],
        'customer_id': order_sample['Customer ID'],
        'customer_name': order_sample['Customer Name'],
        'order_date': order_sample['Order Date'].dt.strftime('%Y-%m-%d'),
        'ship_date': order_sample['Ship Date'].dt.strftime('%Y-%m-%d'),
        'ship_mode': order_sample['Ship Mode'],
        'product_id': order_sample['Product ID'],
        'product_name': order_sample['Product Name'],
        'category': order_sample['Category'],
        'quantity': order_sample['Quantity'],
        'price_per_unit': (order_sample['Sales'] / order_sample['Quantity']).round(2),
        'total_amount': order_sample['Sales'].round(2),
        'discount': order_sample['Discount'],
        'profit': order_sample['Profit'].round(2),
        'status': order_sample['status']
    })

    order_export = order_export.sort_values('order_date', ascending=False)

    print(f"✓ Extracted {len(order_export)} sample orders")
    print(f"  - Date range: {order_export['order_date'].min()} to {order_export['order_date'].max()}")
    print(f"  - Total value: ${order_export['total_amount'].sum():,.2f}")

    return order_export

def generate_category_setup():
    """Generate category setup instructions"""
    print("\nGenerating category setup file...")

    categories = pd.DataFrame({
        'name': ['Furniture', 'Office Supplies', 'Technology'],
        'description': [
            'Tables, chairs, bookcases, and furnishings',
            'Paper, binders, labels, and office essentials',
            'Phones, accessories, copiers, and tech equipment'
        ],
        'color': ['#8B4513', '#4169E1', '#32CD32']
    })

    categories.to_csv('demo_categories.csv', index=False)
    print(f"✓ Created demo_categories.csv")

    return categories

def main():
    """Main execution function"""
    print("=" * 60)
    print("Superstore Demo Data Import Script")
    print("E-Commerce Inventory Management System")
    print("=" * 60)

    # Load data
    df = load_superstore_data()
    if df is None:
        return

    # Extract data
    categories = generate_category_setup()
    products = extract_products(df)
    customers = extract_customers(df)
    orders = extract_orders(df, customers, products)

    # Save to CSV
    print("\nSaving CSV files...")
    products.to_csv('demo_products.csv', index=False)
    print(f"✓ Saved demo_products.csv ({len(products)} products)")

    customers.to_csv('demo_customers.csv', index=False)
    print(f"✓ Saved demo_customers.csv ({len(customers)} customers)")

    orders.to_csv('demo_orders.csv', index=False)
    print(f"✓ Saved demo_orders.csv ({len(orders)} orders)")

    # Generate summary report
    print("\n" + "=" * 60)
    print("DEMO DATA SUMMARY")
    print("=" * 60)
    print(f"\n📦 Products: {len(products)}")
    print(f"   Furniture: {len(products[products['category'] == 'Furniture'])}")
    print(f"   Office Supplies: {len(products[products['category'] == 'Office Supplies'])}")
    print(f"   Technology: {len(products[products['category'] == 'Technology'])}")

    print(f"\n👥 Customers: {len(customers)}")
    print(f"   Consumer: {len(customers[customers['segment'] == 'Consumer'])}")
    print(f"   Corporate: {len(customers[customers['segment'] == 'Corporate'])}")
    print(f"   Home Office: {len(customers[customers['segment'] == 'Home Office'])}")

    print(f"\n🛒 Orders: {len(orders)}")
    print(f"   Pending: {len(orders[orders['status'] == 'pending'])}")
    print(f"   Processing: {len(orders[orders['status'] == 'processing'])}")
    print(f"   Completed: {len(orders[orders['status'] == 'completed'])}")
    print(f"   Total Revenue: ${orders['total_amount'].sum():,.2f}")

    print("\n" + "=" * 60)
    print("NEXT STEPS")
    print("=" * 60)
    print("\n1. Review generated CSV files:")
    print("   - demo_categories.csv (3 categories)")
    print("   - demo_products.csv (100 sample products)")
    print("   - demo_customers.csv (100 sample customers)")
    print("   - demo_orders.csv (200 sample orders)")

    print("\n2. Import data into your system:")
    print("   a. Settings → Categories → Create categories from demo_categories.csv")
    print("   b. Products → Add products from demo_products.csv")
    print("   c. Customers → Add customers from demo_customers.csv")
    print("   d. Orders → Create orders from demo_orders.csv")

    print("\n3. Explore features:")
    print("   - Dashboard analytics with real data")
    print("   - Category filtering and comparisons")
    print("   - Customer purchase history")
    print("   - Order status tracking")
    print("   - Inventory management")

    print("\n4. See DEMO_GUIDE.md for detailed walkthrough")

    print("\n" + "=" * 60)
    print("✅ Demo data generation complete!")
    print("=" * 60 + "\n")

if __name__ == "__main__":
    main()
