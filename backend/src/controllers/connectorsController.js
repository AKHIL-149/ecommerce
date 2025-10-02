// backend/src/controllers/connectorsController.js
const { ConnectorManager } = require('../connectors/ConnectorManager');

const connectorManager = new ConnectorManager();

class ConnectorsController {
  async listConnectors(req, res) {
    try {
      const connectors = connectorManager.getAvailableConnectors();
      res.json({ connectors });
    } catch (error) {
      res.status(500).json({ error: 'Failed to list connectors' });
    }
  }

  async addStore(req, res) {
    try {
      const { name, platform, config } = req.body;
      
      const validation = await connectorManager.validateConnectorConfig(platform, config);
      
      if (!validation.valid) {
        return res.status(400).json({ errors: validation.errors });
      }

      res.json({ message: 'Store added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add store' });
    }
  }

  async testConnection(req, res) {
    try {
      const { platform, config } = req.body;
      
      const connector = connectorManager.getConnector(platform, config);
      const result = await connector.testConnection();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async syncData(req, res) {
    try {
      const { storeId, dataType } = req.body;
      res.json({ message: 'Sync started' });
    } catch (error) {
      res.status(500).json({ error: 'Sync failed' });
    }
  }
}

module.exports = new ConnectorsController();