// frontend/src/components/products/ProductForm.js
// Form component for creating and editing products

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { productsAPI, categoriesAPI } from '../../utils/api';
import Input from '../common/Input';
import Button from '../common/Button';

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const { currentStore } = useStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    price: '',
    cost: '',
    category_id: '',
    inventory_quantity: '',
    low_stock_threshold: '10',
    status: 'active',
    image_url: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Fetch categories when component mounts
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

  // If we're editing a product, populate the form with existing data
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        price: product.price || '',
        cost: product.cost || '',
        category_id: product.category_id || '',
        inventory_quantity: product.inventory_quantity || '',
        low_stock_threshold: product.low_stock_threshold || '10',
        status: product.status || 'active',
        image_url: product.image_url || ''
      });

      // Set image preview if product has an image
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    }
  }, [product]);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Create preview and convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData(prev => ({
          ...prev,
          image_url: base64String
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Name is required
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    // Price must be a positive number
    if (!formData.price || parseFloat(formData.price) < 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Inventory quantity must be a non-negative integer
    if (formData.inventory_quantity !== '' &&
        (isNaN(formData.inventory_quantity) || parseInt(formData.inventory_quantity) < 0)) {
      newErrors.inventory_quantity = 'Inventory must be a non-negative number';
    }

    // Low stock threshold must be a non-negative integer
    if (formData.low_stock_threshold !== '' &&
        (isNaN(formData.low_stock_threshold) || parseInt(formData.low_stock_threshold) < 0)) {
      newErrors.low_stock_threshold = 'Threshold must be a non-negative number';
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
      // Prepare data for API - convert string numbers to actual numbers
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: formData.cost ? parseFloat(formData.cost) : null,
        inventory_quantity: formData.inventory_quantity ? parseInt(formData.inventory_quantity) : 0,
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 10,
        store_id: currentStore.id
      };

      // Call the appropriate API method
      if (product) {
        await productsAPI.update(product.id, productData);
      } else {
        await productsAPI.create(productData);
      }

      // Notify parent component that save was successful
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);

      // Check if the server sent back validation errors
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to save product. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name */}
      <Input
        label="Product Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Enter product name"
        error={errors.name}
        required
      />

      {/* Product Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Image
        </label>
        <div className="flex items-start space-x-4">
          {/* Image Preview */}
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}

          {/* Upload Button */}
          <div className="flex-1">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
            >
              {imagePreview ? 'Change Image' : 'Upload Image'}
            </label>
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        </div>
      </div>

      {/* SKU and Category in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="SKU"
          name="sku"
          value={formData.sku}
          onChange={handleChange}
          placeholder="Optional product code"
          error={errors.sku}
        />
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">No Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Price and Cost in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Price"
          name="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          error={errors.price}
          required
        />
        <Input
          label="Cost"
          name="cost"
          type="number"
          step="0.01"
          value={formData.cost}
          onChange={handleChange}
          placeholder="Optional cost price"
          error={errors.cost}
        />
      </div>

      {/* Inventory Quantity and Low Stock Threshold in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Inventory Quantity"
          name="inventory_quantity"
          type="number"
          value={formData.inventory_quantity}
          onChange={handleChange}
          placeholder="0"
          error={errors.inventory_quantity}
        />
        <Input
          label="Low Stock Threshold"
          name="low_stock_threshold"
          type="number"
          value={formData.low_stock_threshold}
          onChange={handleChange}
          placeholder="10"
          error={errors.low_stock_threshold}
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
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
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
