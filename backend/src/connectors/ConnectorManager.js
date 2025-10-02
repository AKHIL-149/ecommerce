// backend/src/connectors/ConnectorManager.js
const ShopifyConnector = require('./ShopifyConnector');
const WooCommerceConnector = require('./WooCommerceConnector');

class ConnectorManager {
  constructor() {
    this.connectors = new Map();
    this.registerDefaultConnectors();
  }

  registerDefaultConnectors() {
    this.register('shopify', ShopifyConnector);
    this.register('woocommerce', WooCommerceConnector);
  }

  register(name, connectorClass) {
    this.connectors.set(name, connectorClass);
  }

  getConnector(name, config) {
    const ConnectorClass = this.connectors.get(name);
    if (!ConnectorClass) {
      throw new Error(`Connector '${name}' not found`);
    }
    return new ConnectorClass(config);
  }

  getAvailableConnectors() {
    return Array.from(this.connectors.keys());
  }

  async validateConnectorConfig(name, config) {
    const connector = this.getConnector(name, config);
    return await connector.validateConfig();
  }
}

module.exports = { ConnectorManager };