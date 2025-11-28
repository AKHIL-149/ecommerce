// frontend/src/components/inventory/StockAdjustmentForm.js
// Form component for adjusting product stock levels

import React, { useState } from 'react';
import { productsAPI } from '../../utils/api';
import Input from '../common/Input';
import Button from '../common/Button';

const StockAdjustmentForm = ({ product, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    adjustment_type: 'restock',
    quantity_change: '',
    reason: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Quantity change is required and must be a number
    const quantity = parseInt(formData.quantity_change);
    if (!formData.quantity_change || isNaN(quantity)) {
      newErrors.quantity_change = 'Please enter a valid quantity';
    }

    // Can't reduce stock below zero
    if (formData.adjustment_type === 'damage' || formData.adjustment_type === 'return') {
      if (Math.abs(quantity) > product.inventory_quantity) {
        newErrors.quantity_change = `Cannot reduce stock below zero. Current stock: ${product.inventory_quantity}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Calculate the quantity change based on adjustment type
      let quantityChange = parseInt(formData.quantity_change);

      // For damage, theft, and return, the quantity should be negative
      if (['damage', 'theft', 'return'].includes(formData.adjustment_type)) {
        quantityChange = -Math.abs(quantityChange);
      } else {
        // For restock and other, ensure positive
        quantityChange = Math.abs(quantityChange);
      }

      const adjustmentData = {
        adjustment_type: formData.adjustment_type,
        quantity_change: quantityChange,
        reason: formData.reason || null
      };

      await productsAPI.adjustStock(product.id, adjustmentData);

      // Notify parent component that adjustment was successful
      onSuccess();
    } catch (error) {
      console.error('Error adjusting stock:', error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to adjust stock. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current Stock Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Current Stock</p>
            <p className="text-2xl font-bold text-gray-900">{product.inventory_quantity}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Low Stock Alert</p>
            <p className="text-lg font-medium text-gray-900">{product.low_stock_threshold}</p>
          </div>
        </div>
      </div>

      {/* Adjustment Type */}
      <div>
        <label htmlFor="adjustment_type" className="block text-sm font-medium text-gray-700 mb-1">
          Adjustment Type
          <span className="text-red-500 ml-1">*</span>
        </label>
        <select
          id="adjustment_type"
          name="adjustment_type"
          value={formData.adjustment_type}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="restock">Restock (Add Inventory)</option>
          <option value="damage">Damage (Remove Inventory)</option>
          <option value="theft">Theft (Remove Inventory)</option>
          <option value="return">Return (Remove Inventory)</option>
          <option value="other">Other Adjustment</option>
        </select>
      </div>

      {/* Quantity Change */}
      <Input
        label={
          ['damage', 'theft', 'return'].includes(formData.adjustment_type)
            ? 'Quantity to Remove'
            : 'Quantity to Add'
        }
        name="quantity_change"
        type="number"
        value={formData.quantity_change}
        onChange={handleChange}
        placeholder="Enter quantity"
        error={errors.quantity_change}
        required
      />

      {/* Preview New Stock */}
      {formData.quantity_change && !isNaN(parseInt(formData.quantity_change)) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">New Stock Level</p>
          <p className="text-xl font-bold text-gray-900">
            {['damage', 'theft', 'return'].includes(formData.adjustment_type)
              ? product.inventory_quantity - Math.abs(parseInt(formData.quantity_change))
              : product.inventory_quantity + Math.abs(parseInt(formData.quantity_change))}
          </p>
        </div>
      )}

      {/* Reason */}
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
          Reason (Optional)
        </label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Add a note explaining this adjustment..."
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Adjusting...' : 'Apply Adjustment'}
        </Button>
      </div>
    </form>
  );
};

export default StockAdjustmentForm;
