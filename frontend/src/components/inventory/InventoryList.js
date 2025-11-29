// frontend/src/components/inventory/InventoryList.js
// Inventory management page with stock tracking and alerts

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { productsAPI, inventoryAPI } from '../../utils/api';
import { formatDate } from '../../utils/helpers';
import { exportToCSV } from '../../utils/exportHelpers';
import Button from '../common/Button';
import Modal from '../common/Modal';
import StockAdjustmentForm from './StockAdjustmentForm';

const InventoryList = () => {
  const { currentStore } = useStore();
  const [products, setProducts] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (currentStore) {
      if (activeTab === 'products') {
        fetchProducts();
      } else {
        fetchAdjustments();
      }
    }
  }, [currentStore, activeTab, searchTerm, filterType]);

  const fetchProducts = async () => {
    if (!currentStore) return;

    setLoading(true);
    try {
      const params = {
        storeId: currentStore.id,
        limit: 1000,
        search: searchTerm
      };

      // Apply filter
      if (filterType === 'low_stock') {
        const response = await productsAPI.getLowStock({ storeId: currentStore.id });
        const lowStockData = response.data?.products || response.data || [];
        setProducts(lowStockData);
      } else {
        const response = await productsAPI.list(params);
        const productsData = response.data?.products || response.data || [];
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdjustments = async () => {
    if (!currentStore) return;

    setLoading(true);
    try {
      const response = await inventoryAPI.getHistory({
        storeId: currentStore.id,
        limit: 100
      });
      // Handle both array response and object with adjustments property
      const adjustmentsData = Array.isArray(response.data)
        ? response.data
        : (response.data?.adjustments || []);
      setAdjustments(adjustmentsData);
    } catch (error) {
      console.error('Error fetching adjustments:', error);
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setShowAdjustModal(true);
  };

  const handleAdjustmentSaved = () => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    fetchProducts();
    fetchAdjustments();
  };

  const getStockLevelClass = (product) => {
    if (product.inventory_quantity <= 0) {
      return 'text-red-700 bg-red-50';
    } else if (product.inventory_quantity <= product.low_stock_threshold) {
      return 'text-yellow-700 bg-yellow-50';
    }
    return 'text-green-700 bg-green-50';
  };

  const getStockLevelLabel = (product) => {
    if (product.inventory_quantity <= 0) {
      return 'Out of Stock';
    } else if (product.inventory_quantity <= product.low_stock_threshold) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  const handleExportInventoryCSV = () => {
    if (products.length === 0) {
      alert('No inventory data to export');
      return;
    }

    const formattedData = products.map(product => ({
      'Product Name': product.name,
      'SKU': product.sku || '',
      'Category': product.category || '',
      'Stock Level': product.inventory_quantity,
      'Low Stock Threshold': product.low_stock_threshold,
      'Status': getStockLevelLabel(product),
      'Price': product.price
    }));

    exportToCSV(formattedData, `inventory_${currentStore.name}`);
  };

  const handleExportAdjustmentsCSV = () => {
    if (adjustments.length === 0) {
      alert('No adjustment history to export');
      return;
    }

    const formattedData = adjustments.map(adj => ({
      'Date': formatDate(adj.created_at),
      'Product': adj.product_name,
      'Type': adj.adjustment_type,
      'Quantity Change': adj.quantity_change,
      'Old Quantity': adj.old_quantity,
      'New Quantity': adj.new_quantity,
      'Reason': adj.reason || '',
      'Adjusted By': adj.adjusted_by_name
    }));

    exportToCSV(formattedData, `inventory_adjustments_${currentStore.name}`);
  };

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a store to view inventory</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-sm text-gray-600 mt-1">Track stock levels and manage inventory adjustments</p>
        </div>
        <Button
          variant="outline"
          onClick={activeTab === 'products' ? handleExportInventoryCSV : handleExportAdjustmentsCSV}
        >
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'products'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Stock Levels
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Adjustment History
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Products</option>
                <option value="low_stock">Low Stock Only</option>
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
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alert Threshold
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">
                          {product.inventory_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStockLevelClass(product)}`}
                        >
                          {getStockLevelLabel(product)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.low_stock_threshold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleAdjustStock(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No adjustment history found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {adjustments.map((adjustment) => (
                  <tr key={adjustment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(adjustment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {adjustment.product_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {adjustment.adjustment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          adjustment.quantity_change > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {adjustment.quantity_change > 0 ? '+' : ''}{adjustment.quantity_change}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        ({adjustment.old_quantity} → {adjustment.new_quantity})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {adjustment.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {adjustment.adjusted_by_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? `Adjust Stock: ${selectedProduct.name}` : 'Adjust Stock'}
        size="md"
      >
        {selectedProduct && (
          <StockAdjustmentForm
            product={selectedProduct}
            onSuccess={handleAdjustmentSaved}
            onCancel={() => {
              setShowAdjustModal(false);
              setSelectedProduct(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default InventoryList;
