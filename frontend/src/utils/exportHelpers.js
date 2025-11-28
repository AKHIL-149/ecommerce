// frontend/src/utils/exportHelpers.js
// Utility functions for exporting data to CSV

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Convert data to CSV format
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format products for CSV export
export const formatProductsForExport = (products) => {
  return products.map(product => ({
    'Name': product.name,
    'SKU': product.sku || '',
    'Category': product.category_name || 'Uncategorized',
    'Price': product.price,
    'Cost': product.cost || '',
    'Inventory': product.inventory_quantity,
    'Low Stock Threshold': product.low_stock_threshold,
    'Status': product.status,
    'Created At': new Date(product.created_at).toLocaleDateString()
  }));
};

// Format orders for CSV export
export const formatOrdersForExport = (orders) => {
  return orders.map(order => ({
    'Order Number': order.order_number,
    'Customer': order.customer_name || 'Guest',
    'Total': order.total_amount,
    'Status': order.status,
    'Payment Status': order.payment_status || 'Pending',
    'Items Count': order.items?.length || 0,
    'Created At': new Date(order.created_at).toLocaleDateString()
  }));
};

// Format customers for CSV export
export const formatCustomersForExport = (customers) => {
  return customers.map(customer => ({
    'Name': `${customer.first_name} ${customer.last_name}`,
    'Email': customer.email || '',
    'Phone': customer.phone || '',
    'Total Orders': customer.total_orders || 0,
    'Total Spent': customer.total_spent || 0,
    'Created At': new Date(customer.created_at).toLocaleDateString()
  }));
};
