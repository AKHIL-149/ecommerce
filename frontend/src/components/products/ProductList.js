// frontend/src/components/products/ProductList.js
// Main products page with list view and management

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { productsAPI, categoriesAPI } from '../../utils/api';
import { formatCurrency } from '../../utils/helpers';
import { exportToCSV, formatProductsForExport } from '../../utils/exportHelpers';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ProductForm from './ProductForm';

const ProductList = () => {
  const { currentStore } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('');

  useEffect(() => {
    if (currentStore) {
      fetchProducts();
    }
  }, [currentStore, page, searchTerm, categoryFilter]);

  useEffect(() => {
    if (currentStore) {
      fetchCategories();
    }
  }, [currentStore]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.list({ storeId: currentStore.id });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    if (!currentStore) return;

    setLoading(true);
    try {
      const params = {
        storeId: currentStore.id,
        page,
        limit: 20,
        search: searchTerm
      };

      if (categoryFilter) {
        params.categoryId = categoryFilter;
      }

      const response = await productsAPI.list(params);

      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSaved = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productsAPI.delete(product.id);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleExportCSV = () => {
    if (products.length === 0) {
      alert('No products to export');
      return;
    }

    const formattedData = formatProductsForExport(products);
    exportToCSV(formattedData, `products_${currentStore.name}`);
  };

  const getStockStatusColor = (product) => {
    if (product.inventory_quantity <= 0) {
      return 'text-red-600 font-bold';
    } else if (product.inventory_quantity <= product.low_stock_threshold) {
      return 'text-yellow-600 font-semibold';
    }
    return 'text-green-600';
  };

  const getStockBadge = (product) => {
    if (product.inventory_quantity <= 0) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (product.inventory_quantity <= product.low_stock_threshold) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
          ⚠️ Low Stock
        </span>
      );
    }
    return null;
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction) {
      alert('Please select an action');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    try {
      if (bulkAction === 'delete') {
        if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
          return;
        }
        await Promise.all(selectedProducts.map(id => productsAPI.delete(id)));
        alert(`Successfully deleted ${selectedProducts.length} products`);
      } else if (bulkAction === 'category') {
        if (!bulkCategoryId) {
          alert('Please select a category');
          return;
        }
        await Promise.all(selectedProducts.map(id =>
          productsAPI.update(id, { category_id: bulkCategoryId })
        ));
        alert(`Successfully updated ${selectedProducts.length} products`);
      } else if (bulkAction === 'export') {
        const selectedProductsData = products.filter(p => selectedProducts.includes(p.id));
        const formattedData = formatProductsForExport(selectedProductsData);
        exportToCSV(formattedData, `selected_products_${currentStore.name}`);
      }

      setSelectedProducts([]);
      setBulkAction('');
      setBulkCategoryId('');
      setShowBulkActions(false);
      fetchProducts();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      alert('Failed to perform bulk action');
    }
  };

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a store to view products</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your product catalog and inventory</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={bulkAction}
                onChange={(e) => {
                  setBulkAction(e.target.value);
                  if (e.target.value === 'category') {
                    setShowBulkActions(true);
                  }
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select action...</option>
                <option value="delete">Delete selected</option>
                <option value="category">Assign category</option>
                <option value="export">Export selected</option>
              </select>

              {bulkAction === 'category' && (
                <select
                  value={bulkCategoryId}
                  onChange={(e) => setBulkCategoryId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              )}

              <Button onClick={handleBulkAction} size="sm">
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No products found</p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4" size="sm">
              Add your first product
            </Button>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product.id)}
                        onChange={() => handleSelectProduct(product.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-200"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                          <span className="text-gray-400 text-xs">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        {product.category && (
                          <p className="text-xs text-gray-500">{product.category}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.sku || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`text-sm font-medium ${getStockStatusColor(product)}`}>
                          {product.inventory_quantity} units
                        </span>
                        {getStockBadge(product)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {product.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={page === pagination.totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          product={editingProduct}
          onSuccess={handleProductSaved}
          onCancel={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default ProductList;
