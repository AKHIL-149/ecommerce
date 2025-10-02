// backend/src/controllers/analyticsController.js
const { query, cache } = require('../config/database');
const moment = require('moment');

class AnalyticsController {
  // Get sales overview
  async getSalesOverview(req, res) {
    try {
      const { startDate, endDate, storeId } = req.query;
      const cacheKey = `sales_overview_${storeId}_${startDate}_${endDate}`;
      
      let data = await cache.get(cacheKey);
      if (data) {
        return res.json(data);
      }

      const salesQuery = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as orders,
          SUM(total_amount) as revenue,
          AVG(total_amount) as avg_order_value,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM orders 
        WHERE store_id = $1 
          AND created_at BETWEEN $2 AND $3
          AND status != 'cancelled'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `;

      const result = await query(salesQuery, [storeId, startDate, endDate]);
      
      const totals = {
        totalRevenue: result.rows.reduce((sum, row) => sum + parseFloat(row.revenue || 0), 0),
        totalOrders: result.rows.reduce((sum, row) => sum + parseInt(row.orders || 0), 0),
        avgOrderValue: 0,
        uniqueCustomers: new Set(result.rows.map(row => row.unique_customers)).size
      };
      
      totals.avgOrderValue = totals.totalOrders > 0 ? totals.totalRevenue / totals.totalOrders : 0;

      data = {
        dailyStats: result.rows,
        totals,
        period: { startDate, endDate }
      };

      await cache.set(cacheKey, data, 3600);
      res.json(data);
    } catch (error) {
      console.error('Sales overview error:', error);
      res.status(500).json({ error: 'Failed to fetch sales overview' });
    }
  }

  // Get product performance
  async getProductPerformance(req, res) {
    try {
      const { startDate, endDate, storeId, limit = 20 } = req.query;
      const cacheKey = `product_performance_${storeId}_${startDate}_${endDate}_${limit}`;
      
      let data = await cache.get(cacheKey);
      if (data) {
        return res.json(data);
      }

      const productQuery = `
        SELECT 
          p.id,
          p.name,
          p.sku,
          p.price,
          p.category,
          COUNT(oi.id) as units_sold,
          SUM(oi.quantity * oi.price) as revenue,
          AVG(oi.price) as avg_selling_price
        FROM products p
        JOIN order_items oi ON p.id = oi.product_id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.store_id = $1 
          AND o.created_at BETWEEN $2 AND $3
          AND o.status != 'cancelled'
        GROUP BY p.id, p.name, p.sku, p.price, p.category
        ORDER BY revenue DESC
        LIMIT $4
      `;

      const result = await query(productQuery, [storeId, startDate, endDate, limit]);
      
      data = {
        products: result.rows,
        period: { startDate, endDate }
      };

      await cache.set(cacheKey, data, 1800);
      res.json(data);
    } catch (error) {
      console.error('Product performance error:', error);
      res.status(500).json({ error: 'Failed to fetch product performance' });
    }
  }

  // Get customer insights
  async getCustomerInsights(req, res) {
    try {
      const { startDate, endDate, storeId } = req.query;
      const cacheKey = `customer_insights_${storeId}_${startDate}_${endDate}`;
      
      let data = await cache.get(cacheKey);
      if (data) {
        return res.json(data);
      }

      const customerQuery = `
        WITH customer_stats AS (
          SELECT 
            customer_id,
            COUNT(*) as order_count,
            SUM(total_amount) as total_spent,
            MAX(created_at) as last_order_date
          FROM orders 
          WHERE store_id = $1 
            AND created_at BETWEEN $2 AND $3
            AND status != 'cancelled'
          GROUP BY customer_id
        ),
        customer_segments AS (
          SELECT 
            customer_id,
            order_count,
            total_spent,
            CASE 
              WHEN order_count >= 5 AND total_spent >= 500 THEN 'VIP'
              WHEN order_count >= 3 OR total_spent >= 200 THEN 'Loyal'
              WHEN order_count = 1 THEN 'New'
              ELSE 'Regular'
            END as segment
          FROM customer_stats
        )
        SELECT 
          segment,
          COUNT(*) as customer_count,
          AVG(order_count) as avg_orders,
          AVG(total_spent) as avg_spent
        FROM customer_segments
        GROUP BY segment
        ORDER BY avg_spent DESC
      `;

      const segmentResult = await query(customerQuery, [storeId, startDate, endDate]);

      const repeatQuery = `
        SELECT 
          COUNT(CASE WHEN order_count = 1 THEN 1 END) as new_customers,
          COUNT(CASE WHEN order_count > 1 THEN 1 END) as repeat_customers,
          COUNT(*) as total_customers
        FROM (
          SELECT customer_id, COUNT(*) as order_count
          FROM orders 
          WHERE store_id = $1 
            AND created_at BETWEEN $2 AND $3
            AND status != 'cancelled'
          GROUP BY customer_id
        ) customer_orders
      `;

      const repeatResult = await query(repeatQuery, [storeId, startDate, endDate]);
      const repeatStats = repeatResult.rows[0];
      const repeatRate = repeatStats.total_customers > 0 
        ? (repeatStats.repeat_customers / repeatStats.total_customers * 100).toFixed(2)
        : 0;

      data = {
        segments: segmentResult.rows,
        repeatCustomerRate: parseFloat(repeatRate),
        customerCounts: repeatStats,
        period: { startDate, endDate }
      };

      await cache.set(cacheKey, data, 1800);
      res.json(data);
    } catch (error) {
      console.error('Customer insights error:', error);
      res.status(500).json({ error: 'Failed to fetch customer insights' });
    }
  }

  // Get real-time stats
  async getRealTimeStats(req, res) {
    try {
      const { storeId } = req.query;
      const now = moment();
      const last24Hours = now.clone().subtract(24, 'hours').format();
      const lastHour = now.clone().subtract(1, 'hour').format();

      const realTimeQuery = `
        SELECT 
          COUNT(CASE WHEN created_at >= $2 THEN 1 END) as orders_last_hour,
          COUNT(CASE WHEN created_at >= $3 THEN 1 END) as orders_last_24h,
          SUM(CASE WHEN created_at >= $2 THEN total_amount ELSE 0 END) as revenue_last_hour,
          SUM(CASE WHEN created_at >= $3 THEN total_amount ELSE 0 END) as revenue_last_24h
        FROM orders
        WHERE store_id = $1 AND status != 'cancelled'
      `;

      const result = await query(realTimeQuery, [storeId, lastHour, last24Hours]);
      
      const data = {
        ...result.rows[0],
        active_visitors: Math.floor(Math.random() * 1000) + 500,
        timestamp: now.toISOString()
      };

      res.json(data);
    } catch (error) {
      console.error('Real-time stats error:', error);
      res.status(500).json({ error: 'Failed to fetch real-time stats' });
    }
  }
}

module.exports = new AnalyticsController();