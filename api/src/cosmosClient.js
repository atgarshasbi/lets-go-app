const { CosmosClient } = require('@azure/cosmos');

let container;

function getContainer() {
  if (!container) {
    const client = new CosmosClient({
      endpoint: process.env.COSMOS_DB_URI,
      key: process.env.COSMOS_DB_KEY,
    });
    container = client.database('LetsGoLicenses').container('DeviceSlots');
  }
  return container;
}

module.exports = { getContainer };
