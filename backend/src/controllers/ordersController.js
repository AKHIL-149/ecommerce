// backend/src/controllers/ordersController.js
// HTTP request handlers for order-related endpoints
// Manages manual order entry and order status updates

const orderService = require('../services/orderService');

class OrdersController {
  // GET /api/orders - List all orders
  async listOrders(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const options = {
        page: req.query.page,
        limit: req.query.limit,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate
      };

      const result = await orderService.getOrders(storeId, options);
      res.json(result);
    } catch (error) {
      console.error('List orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  }

  // GET /api/orders/:id - Get single order
  async getOrder(req, res) {
    try {
      const orderId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const order = await orderService.getOrderById(orderId, storeId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Get order error:', error);
      res.status(500).json({ error: 'Failed to fetch order' });
    }
  }

  // POST /api/orders - Create new order
  async createOrder(req, res) {
    try {
      const storeId = req.storeAccess.storeId;
      const userId = req.user.userId;

      const order = await orderService.createOrder(req.body, storeId, userId);
      res.status(201).json(order);
    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ error: 'Failed to create order', message: error.message });
    }
  }

  // PUT /api/orders/:id - Update order status
  async updateOrder(req, res) {
    try {
      const orderId = req.params.id;
      const storeId = req.storeAccess.storeId;

      const order = await orderService.updateOrder(orderId, req.body, storeId);

      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json(order);
    } catch (error) {
      console.error('Update order error:', error);
      res.status(500).json({ error: 'Failed to update order' });
    }
  }

  // DELETE /api/orders/:id - Cancel order
  async cancelOrder(req, res) {
    try {
      const orderId = req.params.id;
      const storeId = req.storeAccess.storeId;
      const userId = req.user.userId;

      const cancelled = await orderService.cancelOrder(orderId, storeId, userId);

      if (!cancelled) {
        return res.status(404).json({ error: 'Order not found' });
      }

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      console.error('Cancel order error:', error);
      res.status(500).json({ error: 'Failed to cancel order', message: error.message });
    }
  }

  // GET /api/orders/stats/today - Get today's order statistics
  async getTodayStats(req, res) {
    try {
      const storeId = req.storeAccess.storeId;

      const stats = await orderService.getTodayStats(storeId);
      res.json(stats);
    } catch (error) {
      console.error('Get today stats error:', error);
      res.status(500).json({ error: 'Failed to fetch today statistics' });
    }
  }
}

module.exports = new OrdersController();
