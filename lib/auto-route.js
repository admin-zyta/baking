'use strict';

const { readConfig, patchConfig } = require('./config');

function autoRouteStatus() {
  const config = readConfig();
  const enabled = config?.enabled === true;
  const auto = config?.autoRoute?.enabled === true;
  return {
    bakingEnabled: enabled,
    autoRouteEnabled: auto,
    effective: enabled && auto,
  };
}

function setAutoRoute(on) {
  const config = patchConfig({ autoRoute: { enabled: on === true } });
  return {
    autoRouteEnabled: config.autoRoute?.enabled === true,
    bakingEnabled: config.enabled === true,
  };
}

module.exports = { autoRouteStatus, setAutoRoute };
