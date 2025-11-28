// frontend/src/components/customers/CustomerList.js
// Main customers page with list view and management

import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { customersAPI } from '../../utils/api';
import { formatCurrency, formatDate } from '../../utils/helpers';
import Button from '../common/Button';
import Modal from '../common/Modal';
import CustomerForm from './CustomerForm';

const CustomerList = () => {
  const { currentStore } = useStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (currentStore) {
      fetchCustomers();
    }
  }, [currentStore, page, searchTerm]);

  const fetchCustomers = async () => {
    if (!currentStore) return;

    setLoading(true);
    try {
      const response = await customersAPI.list({
        storeId: currentStore.id,
        page,
        limit: 20,
        search: searchTerm
      });

      setCustomers(response.data.customers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSaved = () => {
    setShowAddModal(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setShowAddModal(true);
  };

  const handleDelete = async (customer) => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return;
    }

    try {
      await customersAPI.delete(customer.id);
      fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer');
    }
  };

  if (!currentStore) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please select a store to view customers</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your customer database and relationships</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-4">
        <input
          type="text"
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customers table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No customers found</p>
            <Button onClick={() => setShowAddModal(true)} className="mt-4" size="sm">
              Add your first customer
            </Button>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {customer.email && (
                          <p className="text-gray-900">{customer.email}</p>
                        )}
                        {customer.phone && (
                          <p className="text-gray-500">{customer.phone}</p>
                        )}
                        {!customer.email && !customer.phone && (
                          <p className="text-gray-400">No contact info</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.total_orders || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(customer.total_spent || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {customer.last_order_date ? formatDate(customer.last_order_date) : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(customer)}
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
          setEditingCustomer(null);
        }}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        size="md"
      >
        <CustomerForm
          customer={editingCustomer}
          onSuccess={handleCustomerSaved}
          onCancel={() => {
            setShowAddModal(false);
            setEditingCustomer(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default CustomerList;
